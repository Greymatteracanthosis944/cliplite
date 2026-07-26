use rusqlite::{Connection, params};
use serde::{Deserialize, Serialize};
use std::sync::Mutex;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClipEntry {
    pub id: i64,
    pub content: String,
    pub content_type: String, // "text" or "image"
    pub source_app: Option<String>,
    pub pinned: bool,
    pub created_at: String,
}

pub struct Database {
    pub conn: Mutex<Connection>,
}

impl Database {
    pub fn new(db_path: &str) -> Result<Self, String> {
        let conn = Connection::open(db_path).map_err(|e| format!("Failed to open DB: {}", e))?;

        conn.execute_batch(
            "CREATE TABLE IF NOT EXISTS clips (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content TEXT NOT NULL,
                content_type TEXT NOT NULL DEFAULT 'text',
                source_app TEXT,
                pinned INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL DEFAULT (datetime('now'))
            );

            CREATE INDEX IF NOT EXISTS idx_clips_created ON clips(created_at DESC);

            CREATE INDEX IF NOT EXISTS idx_clips_content ON clips(content);
            ",
        )
        .map_err(|e| format!("Failed to create tables: {}", e))?;

        Ok(Database {
            conn: Mutex::new(conn),
        })
    }

    pub fn add_clip(&self, content: &str, content_type: &str) -> Result<ClipEntry, String> {
        let conn = self.conn.lock().map_err(|e| format!("Lock error: {}", e))?;

        // Check if this exact content already exists as the most recent entry
        let exists: bool = conn
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM clips ORDER BY id DESC LIMIT 1) AND
                 (SELECT content FROM clips ORDER BY id DESC LIMIT 1) = ?1",
                params![content],
                |row| row.get(0),
            )
            .map_err(|e| format!("Query error: {}", e))?;

        if exists {
            // Update timestamp of existing entry instead of duplicating
            conn.execute(
                "UPDATE clips SET created_at = datetime('now') WHERE id = (SELECT id FROM clips ORDER BY id DESC LIMIT 1)",
                [],
            )
            .map_err(|e| format!("Update error: {}", e))?;

            return conn
                .query_row(
                    "SELECT id, content, content_type, source_app, pinned, created_at FROM clips ORDER BY id DESC LIMIT 1",
                    [],
                    |row| {
                        Ok(ClipEntry {
                            id: row.get(0)?,
                            content: row.get(1)?,
                            content_type: row.get(2)?,
                            source_app: row.get(3)?,
                            pinned: row.get(4)?,
                            created_at: row.get(5)?,
                        })
                    },
                )
                .map_err(|e| format!("Query error: {}", e));
        }

        conn.execute(
            "INSERT INTO clips (content, content_type) VALUES (?1, ?2)",
            params![content, content_type],
        )
        .map_err(|e| format!("Insert error: {}", e))?;

        let id = conn.last_insert_rowid();

        // Keep only last 500 entries, delete older ones (except pinned)
        conn.execute(
            "DELETE FROM clips WHERE id NOT IN (
                SELECT id FROM clips ORDER BY id DESC LIMIT 500
            ) AND pinned = 0",
            [],
        )
        .map_err(|e| format!("Cleanup error: {}", e))?;

        Ok(ClipEntry {
            id,
            content: content.to_string(),
            content_type: content_type.to_string(),
            source_app: None,
            pinned: false,
            created_at: chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string(),
        })
    }

    pub fn clear_all(&self) -> Result<u64, String> {
        let conn = self.conn.lock().map_err(|e| format!("Lock error: {}", e))?;

        let deleted = conn
            .execute("DELETE FROM clips WHERE pinned = 0", [])
            .map_err(|e| format!("Clear error: {}", e))?;

        Ok(deleted as u64)
    }

    /// Get a single clip by ID — used by paste_clip to avoid the "top 50 only" bug.
    pub fn get_clip_by_id(&self, id: i64) -> Result<Option<ClipEntry>, String> {
        let conn = self.conn.lock().map_err(|e| format!("Lock error: {}", e))?;

        let result = conn
            .query_row(
                "SELECT id, content, content_type, source_app, pinned, created_at
                 FROM clips WHERE id = ?1",
                params![id],
                |row| {
                    Ok(ClipEntry {
                        id: row.get(0)?,
                        content: row.get(1)?,
                        content_type: row.get(2)?,
                        source_app: row.get(3)?,
                        pinned: row.get(4)?,
                        created_at: row.get(5)?,
                    })
                },
            );

        match result {
            Ok(entry) => Ok(Some(entry)),
            Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
            Err(e) => Err(format!("Query error: {}", e)),
        }
    }

    pub fn get_clips(&self, limit: i64, offset: i64, search: &str) -> Result<Vec<ClipEntry>, String> {
        let conn = self.conn.lock().map_err(|e| format!("Lock error: {}", e))?;

        // BUGFIX #2: Parameterized LIKE instead of string interpolation.
        // The search pattern is built in Rust and bound via ?1, eliminating
        // SQL injection risk and quote-escaping edge cases.
        let (query, params): (String, Vec<Box<dyn rusqlite::types::ToSql>>) = if search.is_empty() {
            (
                "SELECT id, content, content_type, source_app, pinned, created_at
                 FROM clips ORDER BY id DESC LIMIT ?1 OFFSET ?2".to_string(),
                vec![Box::new(limit), Box::new(offset)],
            )
        } else {
            let pattern = format!("%{}%", search);
            (
                "SELECT id, content, content_type, source_app, pinned, created_at
                 FROM clips WHERE content LIKE ?1 ORDER BY id DESC LIMIT ?2 OFFSET ?3".to_string(),
                vec![Box::new(pattern), Box::new(limit), Box::new(offset)],
            )
        };

        let mut stmt = conn.prepare(&query).map_err(|e| format!("Prepare error: {}", e))?;

        let param_refs: Vec<&dyn rusqlite::types::ToSql> = params.iter().map(|p| p.as_ref()).collect();

        let clips = stmt
            .query_map(param_refs.as_slice(), |row| {
                Ok(ClipEntry {
                    id: row.get(0)?,
                    content: row.get(1)?,
                    content_type: row.get(2)?,
                    source_app: row.get(3)?,
                    pinned: row.get(4)?,
                    created_at: row.get(5)?,
                })
            })
            .map_err(|e| format!("Query error: {}", e))?
            .filter_map(|r| r.ok())
            .collect();

        Ok(clips)
    }

    pub fn toggle_pin(&self, id: i64) -> Result<bool, String> {
        let conn = self.conn.lock().map_err(|e| format!("Lock error: {}", e))?;

        conn.execute(
            "UPDATE clips SET pinned = CASE WHEN pinned = 0 THEN 1 ELSE 0 END WHERE id = ?1",
            params![id],
        )
        .map_err(|e| format!("Update error: {}", e))?;

        let pinned: bool = conn
            .query_row("SELECT pinned FROM clips WHERE id = ?1", params![id], |row| {
                row.get(0)
            })
            .map_err(|e| format!("Query error: {}", e))?;

        Ok(pinned)
    }

    pub fn delete_clip(&self, id: i64) -> Result<(), String> {
        let conn = self.conn.lock().map_err(|e| format!("Lock error: {}", e))?;

        conn.execute("DELETE FROM clips WHERE id = ?1", params![id])
            .map_err(|e| format!("Delete error: {}", e))?;

        Ok(())
    }

    pub fn get_clip_count(&self) -> Result<i64, String> {
        let conn = self.conn.lock().map_err(|e| format!("Lock error: {}", e))?;

        conn.query_row("SELECT COUNT(*) FROM clips", [], |row| row.get(0))
            .map_err(|e| format!("Count error: {}", e))
    }
}
