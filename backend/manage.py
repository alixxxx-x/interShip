#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

# Fix UnicodeDecodeError caused by French-locale PostgreSQL on Windows
# PostgreSQL sends error messages in Latin-1 (Windows-1252) but psycopg2
# tries to decode them as UTF-8, causing a crash before the server starts.
os.environ.setdefault('PGCLIENTENCODING', 'UTF8')

# Monkey-patch psycopg2 to safely decode error messages
try:
    import psycopg2
    original_connect = psycopg2._connect  # noqa
    def _safe_connect(*args, **kwargs):
        try:
            return original_connect(*args, **kwargs)
        except UnicodeDecodeError:
            raise psycopg2.OperationalError(
                "PostgreSQL connection failed. Check DB name, user, and password in settings.py."
            )
    psycopg2._connect = _safe_connect
except Exception:
    pass


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
