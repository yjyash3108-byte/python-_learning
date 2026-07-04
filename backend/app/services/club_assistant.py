import json
from urllib.error import URLError
from urllib.request import Request, urlopen

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import Club, ClubAnnouncement, ClubEvent, ClubMember
from app.services.clubs import club_member_count, creator_has_pro, get_club_analytics


def _fallback_reply(club: Club, db: Session, user_message: str) -> str:
    stats = get_club_analytics(db, club.id)
    events = (
        db.query(ClubEvent)
        .filter(ClubEvent.club_id == club.id)
        .order_by(ClubEvent.starts_at.asc())
        .limit(3)
        .all()
    )
    announcements = (
        db.query(ClubAnnouncement)
        .filter(ClubAnnouncement.club_id == club.id)
        .order_by(ClubAnnouncement.created_at.desc())
        .limit(2)
        .all()
    )
    msg = user_message.lower().strip()

    if any(w in msg for w in ("member", "growth", "analytics")):
        return (
            f"{club.name} has {stats['member_count']} members "
            f"({stats['new_members_7d']} joined in the last 7 days). "
            f"There are {stats['upcoming_events']} upcoming events."
        )
    if any(w in msg for w in ("event", "meetup", "schedule")):
        if not events:
            return f"No upcoming events for {club.name} yet. Admins can create one from the Events tab."
        lines = [f"Upcoming events for {club.name}:"]
        for e in events:
            lines.append(f"• {e.title} — {e.starts_at.strftime('%b %d at %H:%M UTC')}")
        return "\n".join(lines)
    if any(w in msg for w in ("announce", "news", "update")):
        if not announcements:
            return "No announcements posted yet. Check back soon!"
        return "Latest: " + " | ".join(f"{a.title}: {a.content[:80]}…" for a in announcements)
    if any(w in msg for w in ("help", "what can you")):
        return (
            "I can help with club events, member stats, announcements, and growth tips. "
            "Try asking: 'How many members do we have?' or 'What events are coming up?'"
        )
    return (
        f"I'm the {club.name} assistant. We have {stats['member_count']} members and "
        f"{stats['event_count']} events. Ask me about events, members, or announcements!"
    )


def generate_club_assistant_reply(db: Session, club: Club, user_message: str) -> tuple[str, str]:
    if not creator_has_pro(db, club):
        return (
            "ScholarNet Pro is required for the AI Club Assistant.",
            "scholarnet",
        )

    if settings.openai_configured:
        try:
            stats = get_club_analytics(db, club.id)
            member_count = club_member_count(db, club.id)
            context = (
                f"Club: {club.name}\nCategory: {club.category}\n"
                f"Members: {member_count}\nEvents: {stats['event_count']}\n"
                f"Announcements: {stats['announcement_count']}\n"
                f"Description: {club.description[:500]}"
            )
            payload = json.dumps(
                {
                    "model": settings.OPENAI_MODEL,
                    "messages": [
                        {
                            "role": "system",
                            "content": (
                                "You are ScholarNet Pro Club Assistant. Help club admins and members "
                                "with events, engagement, and growth. Be concise and friendly.\n\n"
                                f"Club context:\n{context}"
                            ),
                        },
                        {"role": "user", "content": user_message},
                    ],
                    "max_tokens": 400,
                }
            ).encode()
            req = Request(
                "https://api.openai.com/v1/chat/completions",
                data=payload,
                headers={
                    "Authorization": f"Bearer {settings.OPENAI_API_KEY}",
                    "Content-Type": "application/json",
                },
                method="POST",
            )
            with urlopen(req, timeout=30) as resp:
                data = json.loads(resp.read().decode())
            reply = data["choices"][0]["message"]["content"].strip()
            return reply, "openai"
        except (URLError, KeyError, IndexError, json.JSONDecodeError):
            pass

    return _fallback_reply(club, db, user_message), "scholarnet"
