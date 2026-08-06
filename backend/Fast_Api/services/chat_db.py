import sqlite3
import os
import uuid
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'chatbot.db')

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()
    
    # Create sessions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            session_id TEXT PRIMARY KEY,
            student_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # Create messages table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            session_id TEXT NOT NULL,
            role TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(session_id) REFERENCES sessions(session_id)
        )
    ''')
    
    conn.commit()
    conn.close()

def create_session(student_id):
    session_id = str(uuid.uuid4())
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO sessions (session_id, student_id) VALUES (?, ?)',
        (session_id, student_id)
    )
    conn.commit()
    conn.close()
    return session_id

def verify_session(session_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT student_id FROM sessions WHERE session_id = ?', (session_id,))
    row = cursor.fetchone()
    conn.close()
    return row is not None

def add_message(session_id, role, content):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO messages (session_id, role, content) VALUES (?, ?, ?)',
        (session_id, role, content)
    )
    conn.commit()
    conn.close()

def get_session_history(session_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute(
        'SELECT role, content, created_at FROM messages WHERE session_id = ? ORDER BY id ASC',
        (session_id,)
    )
    rows = cursor.fetchall()
    conn.close()
    return [{"role": row["role"], "content": row["content"], "created_at": row["created_at"]} for row in rows]

# Initialize the database tables on module load
init_db()