import os
import sqlite3
from pathlib import Path
from contextlib import contextmanager

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    str(Path(__file__).resolve().parents[2] / "spv.db")
)

@contextmanager
def get_db_connection():
    db = sqlite3.connect(DATABASE_URL, check_same_thread=False)
    db.row_factory = sqlite3.Row
    try:
        yield db
    finally:
        db.close()

def get_db():
    db = sqlite3.connect(DATABASE_URL, check_same_thread=False)
    db.row_factory = sqlite3.Row
    try:
        yield db
    finally:
        db.close()
