"""Entry point for parent digest cron."""

from scripts.parent_digest import send_parent_digest

if __name__ == "__main__":
    send_parent_digest()
