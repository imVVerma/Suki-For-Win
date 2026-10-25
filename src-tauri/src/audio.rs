use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use hound::{SampleFormat, WavSpec, WavWriter};
use std::io::Cursor;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{mpsc, Arc, Mutex};
use std::thread;
use std::time::Instant;

pub enum AudioCommand {
    Start,
    Stop(mpsc::Sender<(Vec<u8>, f64)>), // Returns (WAV bytes in RAM, duration_sec)
    Cancel,
}

pub struct AudioRecorder {
    tx: Mutex<mpsc::Sender<AudioCommand>>,
    is_recording: Arc<AtomicBool>,
}

impl Default for AudioRecorder {
    fn default() -> Self {
        Self::new()
    }
}

impl AudioRecorder {
    pub fn new() -> Self {
        let (tx, rx) = mpsc::channel::<AudioCommand>();
        let is_recording = Arc::new(AtomicBool::new(false));
        let is_rec_clone = Arc::clone(&is_recording);

        // Dedicated background thread so cpal::Stream stays on its owning thread
        thread::spawn(move || {
            let host = cpal::default_host();
            let mut active_stream: Option<cpal::Stream> = None;
            let samples_buffer: Arc<Mutex<Vec<f32>>> = Arc::new(Mutex::new(Vec::new()));
            let mut sample_rate: u32 = 48000;
            let mut channels: u16 = 1;
            let mut start_time = Instant::now();

            while let Ok(cmd) = rx.recv() {
                match cmd {
                    AudioCommand::Start => {
                        if let Ok(mut buf) = samples_buffer.lock() {
                            buf.clear();
                        }
                        start_time = Instant::now();

                        if let Some(device) = host.default_input_device() {
                            if let Ok(config) = device.default_input_config() {
                                sample_rate = config.sample_rate().0;
                                channels = config.channels();
                                let buf_clone = Arc::clone(&samples_buffer);

                                let stream_res = match config.sample_format() {
                                    cpal::SampleFormat::F32 => device.build_input_stream(
                                        &config.into(),
                                        move |data: &[f32], _: &_| {
                                            if let Ok(mut buf) = buf_clone.lock() {
                                                buf.extend_from_slice(data);
                                            }
                                        },
                                        |err| eprintln!("Audio stream error: {err}"),
                                        None,
                                    ),
                                    cpal::SampleFormat::I16 => device.build_input_stream(
                                        &config.into(),
                                        move |data: &[i16], _: &_| {
                                            if let Ok(mut buf) = buf_clone.lock() {
                                                for &s in data {
                                                    buf.push(s as f32 / i16::MAX as f32);
                                                }
                                            }
                                        },
                                        |err| eprintln!("Audio stream error: {err}"),
                                        None,
                                    ),
                                    _ => continue,
                                };

                                if let Ok(stream) = stream_res {
                                    if stream.play().is_ok() {
                                        active_stream = Some(stream);
                                        is_rec_clone.store(true, Ordering::SeqCst);
                                    }
                                }
                            }
                        }
                    }
                    AudioCommand::Stop(reply_tx) => {
                        // Drop the stream immediately to stop recording
                        drop(active_stream.take());
                        is_rec_clone.store(false, Ordering::SeqCst);
                        let duration_sec = start_time.elapsed().as_secs_f64();

                        let raw_samples = samples_buffer
                            .lock()
                            .map(|b| b.clone())
                            .unwrap_or_default();
                        let wav_bytes =
                            encode_to_16khz_mono_wav(&raw_samples, sample_rate, channels);
                        let _ = reply_tx.send((wav_bytes, duration_sec));
                    }
                    AudioCommand::Cancel => {
                        drop(active_stream.take());
                        is_rec_clone.store(false, Ordering::SeqCst);
                        if let Ok(mut buf) = samples_buffer.lock() {
                            buf.clear();
                        }
                    }
                }
            }
        });

        Self {
            tx: Mutex::new(tx),
            is_recording,
        }
    }

    pub fn start(&self) -> Result<(), String> {
        self.tx
            .lock()
            .map_err(|e| e.to_string())?
            .send(AudioCommand::Start)
            .map_err(|e| e.to_string())
    }

    pub fn stop(&self) -> Result<(Vec<u8>, f64), String> {
        let (reply_tx, reply_rx) = mpsc::channel();
        self.tx
            .lock()
            .map_err(|e| e.to_string())?
            .send(AudioCommand::Stop(reply_tx))
            .map_err(|e| e.to_string())?;

        reply_rx.recv().map_err(|e| e.to_string())
    }

    pub fn cancel(&self) -> Result<(), String> {
        self.tx
            .lock()
            .map_err(|e| e.to_string())?
            .send(AudioCommand::Cancel)
            .map_err(|e| e.to_string())
    }

    pub fn is_recording(&self) -> bool {
        self.is_recording.load(Ordering::SeqCst)
    }
}

/// Mixes multi-channel audio down to Mono and downsamples to 16kHz PCM WAV in RAM
fn encode_to_16khz_mono_wav(samples: &[f32], src_rate: u32, channels: u16) -> Vec<u8> {
    let target_rate = 16000u32;
    let ch = channels.max(1) as usize;

    // 1. Convert interleaved stereo/multi-channel to mono
    let mono: Vec<f32> = samples
        .chunks(ch)
        .map(|frame| frame.iter().sum::<f32>() / (ch as f32))
        .collect();

    // 2. Fast linear decimation to 16kHz (Whisper's native sample rate)
    let ratio = if src_rate > 0 {
        src_rate as f64 / target_rate as f64
    } else {
        1.0
    };
    let out_len = if ratio > 0.0 {
        ((mono.len() as f64) / ratio) as usize
    } else {
        0
    };

    let spec = WavSpec {
        channels: 1,
        sample_rate: target_rate,
        bits_per_sample: 16,
        sample_format: SampleFormat::Int,
    };

    let mut cursor = Cursor::new(Vec::with_capacity(out_len * 2 + 44));
    {
        if let Ok(mut writer) = WavWriter::new(&mut cursor, spec) {
            for i in 0..out_len {
                let src_idx = ((i as f64) * ratio) as usize;
                if let Some(&sample) = mono.get(src_idx) {
                    let clamped = sample.clamp(-1.0, 1.0);
                    let pcm_i16 = (clamped * (i16::MAX as f32)) as i16;
                    let _ = writer.write_sample(pcm_i16);
                }
            }
            let _ = writer.finalize();
        }
    }

    cursor.into_inner()
}
