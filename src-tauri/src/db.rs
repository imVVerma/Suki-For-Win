use rusqlite::{params, Connection, Result};
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::sync::Mutex;
use tauri::State;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DictationEntry {
    pub id: i64,
    pub timestamp: String,
    pub raw_text: String,
    pub polished_text: String,
    pub active_app: String,
    pub duration_sec: f64,
    pub word_count: i64,
}

pub fn init_db(db_path: &Path) -> Result<Connection> {
    let conn = Connection::open(db_path)?;
    conn.execute_batch(
        "PRAGMA journal_mode = WAL;
         CREATE TABLE IF NOT EXISTS dictations (
             id INTEGER PRIMARY KEY AUTOINCREMENT,
             timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
             raw_text TEXT NOT NULL,
             polished_text TEXT NOT NULL,
             active_app TEXT NOT NULL,
             duration_sec REAL DEFAULT 0.0,
             word_count INTEGER DEFAULT 0
         );",
    )?;
    Ok(conn)
}

#[tauri::command]
pub fn insert_dictation(
    db: State<'_, Mutex<Connection>>,
    raw_text: String,
    polished_text: String,
    active_app: String,
    duration_sec: f64,
) -> Result<(), String> {
    let word_count = polished_text.split_whitespace().count() as i64;
    let conn = db.lock().map_err(|e| e.to_string())?;
    conn.execute(
        "INSERT INTO dictations (raw_text, polished_text, active_app, duration_sec, word_count)
         VALUES (?1, ?2, ?3, ?4, ?5)",
        params![raw_text, polished_text, active_app, duration_sec, word_count],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_recent_dictations(
    db: State<'_, Mutex<Connection>>,
) -> Result<Vec<DictationEntry>, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, timestamp, raw_text, polished_text, active_app, duration_sec, word_count
             FROM dictations
             ORDER BY id DESC
             LIMIT 100",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(DictationEntry {
                id: row.get(0)?,
                timestamp: row.get(1)?,
                raw_text: row.get(2)?,
                polished_text: row.get(3)?,
                active_app: row.get(4)?,
                duration_sec: row.get(5)?,
                word_count: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut entries = Vec::new();
    for entry in rows.flatten() {
        entries.push(entry);
    }
    Ok(entries)
}

#[tauri::command]
pub fn get_today_dictations(
    db: State<'_, Mutex<Connection>>,
) -> Result<Vec<DictationEntry>, String> {
    let conn = db.lock().map_err(|e| e.to_string())?;
    let mut stmt = conn
        .prepare(
            "SELECT id, timestamp, raw_text, polished_text, active_app, duration_sec, word_count
             FROM dictations
             WHERE date(timestamp) = date('now', 'localtime')
             ORDER BY id DESC
             LIMIT 100",
        )
        .map_err(|e| e.to_string())?;

    let rows = stmt
        .query_map([], |row| {
            Ok(DictationEntry {
                id: row.get(0)?,
                timestamp: row.get(1)?,
                raw_text: row.get(2)?,
                polished_text: row.get(3)?,
                active_app: row.get(4)?,
                duration_sec: row.get(5)?,
                word_count: row.get(6)?,
            })
        })
        .map_err(|e| e.to_string())?;

    let mut entries = Vec::new();
    for entry in rows.flatten() {
        entries.push(entry);
    }
    Ok(entries)
}
