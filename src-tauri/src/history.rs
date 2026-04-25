use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryEntry {
    pub id: String,
    pub text: String,
    pub created_at: u64,
    pub engine: String,
    pub microphone: String,
}

fn history_path(app_dir: &PathBuf) -> PathBuf {
    app_dir.join("history.json")
}

pub fn load_history(app_dir: &PathBuf) -> Vec<HistoryEntry> {
    let path = history_path(app_dir);
    match fs::read_to_string(path) {
        Ok(contents) => serde_json::from_str(&contents).unwrap_or_default(),
        Err(_) => Vec::new(),
    }
}

fn save_history(app_dir: &PathBuf, entries: &[HistoryEntry]) -> Result<(), String> {
    fs::create_dir_all(app_dir).map_err(|e| e.to_string())?;
    let json = serde_json::to_string_pretty(entries).map_err(|e| e.to_string())?;
    fs::write(history_path(app_dir), json).map_err(|e| e.to_string())
}

pub fn append_history_entry(
    app_dir: &PathBuf,
    text: &str,
    engine: &str,
    microphone: &str,
) -> Result<HistoryEntry, String> {
    let mut entries = load_history(app_dir);
    let created_at = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_millis() as u64;

    let entry = HistoryEntry {
        id: format!("hist-{}", created_at),
        text: text.to_string(),
        created_at,
        engine: engine.to_string(),
        microphone: microphone.to_string(),
    };

    entries.insert(0, entry.clone());
    if entries.len() > 100 {
        entries.truncate(100);
    }

    save_history(app_dir, &entries)?;
    Ok(entry)
}

pub fn delete_history_entry(app_dir: &PathBuf, entry_id: &str) -> Result<(), String> {
    let mut entries = load_history(app_dir);
    entries.retain(|entry| entry.id != entry_id);
    save_history(app_dir, &entries)
}

pub fn clear_history(app_dir: &PathBuf) -> Result<(), String> {
    save_history(app_dir, &[])
}

pub fn get_history_entry(app_dir: &PathBuf, entry_id: &str) -> Result<HistoryEntry, String> {
    load_history(app_dir)
        .into_iter()
        .find(|entry| entry.id == entry_id)
        .ok_or("History entry not found".to_string())
}
