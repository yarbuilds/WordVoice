use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DictionaryEntry {
    pub id: String,
    pub heard: String,
    pub replacement: String,
    pub created_at: u64,
}

fn dictionary_path(app_dir: &PathBuf) -> PathBuf {
    app_dir.join("dictionary.json")
}

pub fn load_dictionary(app_dir: &PathBuf) -> Vec<DictionaryEntry> {
    let path = dictionary_path(app_dir);
    match fs::read_to_string(path) {
        Ok(contents) => serde_json::from_str(&contents).unwrap_or_default(),
        Err(_) => Vec::new(),
    }
}

fn save_dictionary(app_dir: &PathBuf, entries: &[DictionaryEntry]) -> Result<(), String> {
    fs::create_dir_all(app_dir).map_err(|e| e.to_string())?;
    let json = serde_json::to_string_pretty(entries).map_err(|e| e.to_string())?;
    fs::write(dictionary_path(app_dir), json).map_err(|e| e.to_string())
}

pub fn upsert_dictionary_entry(
    app_dir: &PathBuf,
    heard: &str,
    replacement: &str,
) -> Result<DictionaryEntry, String> {
    let heard = heard.trim();
    let replacement = replacement.trim();

    if heard.is_empty() || replacement.is_empty() {
        return Err("Both 'heard' and 'replacement' are required".to_string());
    }

    let mut entries = load_dictionary(app_dir);
    if let Some(index) = entries
        .iter()
        .position(|entry| entry.heard.eq_ignore_ascii_case(heard))
    {
        entries[index].replacement = replacement.to_string();
        let updated = entries[index].clone();
        save_dictionary(app_dir, &entries)?;
        return Ok(updated);
    }

    let created_at = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map_err(|e| e.to_string())?
        .as_millis() as u64;

    let entry = DictionaryEntry {
        id: format!("dict-{}", created_at),
        heard: heard.to_string(),
        replacement: replacement.to_string(),
        created_at,
    };

    entries.insert(0, entry.clone());
    save_dictionary(app_dir, &entries)?;
    Ok(entry)
}

pub fn delete_dictionary_entry(app_dir: &PathBuf, entry_id: &str) -> Result<(), String> {
    let mut entries = load_dictionary(app_dir);
    entries.retain(|entry| entry.id != entry_id);
    save_dictionary(app_dir, &entries)
}

pub fn clear_dictionary(app_dir: &PathBuf) -> Result<(), String> {
    save_dictionary(app_dir, &[])
}

fn is_word_char(ch: char) -> bool {
    ch.is_alphanumeric() || ch == '_'
}

fn replace_case_insensitive(text: &str, from: &str, to: &str) -> String {
    let lower_text = text.to_lowercase();
    let lower_from = from.to_lowercase();
    let mut result = String::with_capacity(text.len());
    let mut search_start = 0usize;
    let from_is_single_word = !from.chars().any(char::is_whitespace);

    while let Some(found) = lower_text[search_start..].find(&lower_from) {
        let start = search_start + found;
        let end = start + lower_from.len();

        if from_is_single_word {
            let prev_char = text[..start].chars().next_back();
            let next_char = text[end..].chars().next();
            let touches_word =
                prev_char.is_some_and(is_word_char) || next_char.is_some_and(is_word_char);
            if touches_word {
                let skip = text[start..]
                    .chars()
                    .next()
                    .map(|ch| ch.len_utf8())
                    .unwrap_or(1);
                result.push_str(&text[search_start..start + skip]);
                search_start = start + skip;
                continue;
            }
        }

        result.push_str(&text[search_start..start]);
        result.push_str(to);
        search_start = end;
    }

    result.push_str(&text[search_start..]);
    result
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_single_word_replacement_respects_word_boundaries() {
        let entries = vec![DictionaryEntry {
            id: "1".to_string(),
            heard: "ai".to_string(),
            replacement: "AI".to_string(),
            created_at: 0,
        }];

        assert_eq!(apply_dictionary("ai tools", &entries), "AI tools");
        assert_eq!(
            apply_dictionary("said it plainly", &entries),
            "said it plainly"
        );
    }

    #[test]
    fn test_multi_word_replacement_still_matches_phrase() {
        let entries = vec![DictionaryEntry {
            id: "1".to_string(),
            heard: "open ai".to_string(),
            replacement: "OpenAI".to_string(),
            created_at: 0,
        }];

        assert_eq!(
            apply_dictionary("open ai shipped an update", &entries),
            "OpenAI shipped an update"
        );
    }
}

pub fn apply_dictionary(text: &str, entries: &[DictionaryEntry]) -> String {
    entries.iter().fold(text.to_string(), |current, entry| {
        replace_case_insensitive(&current, &entry.heard, &entry.replacement)
    })
}
