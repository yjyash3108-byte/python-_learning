"""Opportunity skill matching helpers."""

from __future__ import annotations

from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.models import Opportunity

DEFAULT_OPPORTUNITIES = [
    {
        "title": "Summer AI Fellowship",
        "organization": "TechFuture Labs",
        "opportunity_type": "internship",
        "description": "12-week paid fellowship for students building AI projects.",
        "skills_required": ["Python", "AI/ML", "Machine Learning"],
        "link_url": "https://www.python.org/about/gettingstarted/",
        "deadline": date.today() + timedelta(days=45),
    },
    {
        "title": "National Science Fair",
        "organization": "STEM Alliance",
        "opportunity_type": "competition",
        "description": "Showcase your science project at the national level.",
        "skills_required": ["Science", "Research", "Presentation"],
        "link_url": "https://www.sciencebuddies.org/science-fair-projects",
        "deadline": date.today() + timedelta(days=60),
    },
    {
        "title": "Young Founders Grant",
        "organization": "Venture Youth",
        "opportunity_type": "funding",
        "description": "Seed funding for student-led startups and social ventures.",
        "skills_required": ["Entrepreneurship", "Leadership", "Business"],
        "link_url": "https://www.ycombinator.com/library/startup-advice-for-students",
        "deadline": date.today() + timedelta(days=30),
    },
    {
        "title": "Robotics Hackathon",
        "organization": "RoboNation",
        "opportunity_type": "competition",
        "description": "48-hour robotics build challenge for school teams.",
        "skills_required": ["Robotics", "Arduino", "Teamwork"],
        "link_url": "https://www.firstinspires.org/robotics",
        "deadline": date.today() + timedelta(days=21),
    },
    {
        "title": "Web Dev Internship",
        "organization": "CodeSpring",
        "opportunity_type": "internship",
        "description": "Remote internship building React and Next.js apps.",
        "skills_required": ["JavaScript", "React", "Web Dev"],
        "link_url": "https://nextjs.org/learn",
        "deadline": date.today() + timedelta(days=14),
    },
]


def seed_opportunities(db: Session) -> None:
    if db.query(Opportunity).count() > 0:
        sync_demo_links(db)
        return
    for item in DEFAULT_OPPORTUNITIES:
        db.add(Opportunity(**item))
    db.commit()


def sync_demo_links(db: Session) -> None:
    """Keep demo opportunity URLs in sync with DEFAULT_OPPORTUNITIES (dev convenience)."""
    by_title = {item["title"]: item["link_url"] for item in DEFAULT_OPPORTUNITIES}
    updated = False
    for opp in db.query(Opportunity).all():
        if opp.title in by_title and opp.link_url != by_title[opp.title]:
            opp.link_url = by_title[opp.title]
            updated = True
    if updated:
        db.commit()


# Groups of equivalent / related skill labels for student profiles vs job listings.
SKILL_GROUPS: list[set[str]] = [
    {"python", "py", "programming", "coding"},
    {"javascript", "js", "web dev", "web development", "react", "next.js", "nextjs"},
    {"machine learning", "ml", "ai", "ai/ml", "artificial intelligence", "deep learning"},
    {"science", "research", "biology", "chemistry", "physics"},
    {"robotics", "arduino", "engineering", "electronics"},
    {"entrepreneurship", "business", "leadership", "startup", "startups"},
    {"presentation", "public speaking", "communication", "debate"},
    {"teamwork", "collaboration", "community"},
]


def _tokens(skill: str) -> set[str]:
    s = skill.lower().strip()
    if not s:
        return set()
    parts = {s}
    for chunk in s.replace("/", " ").replace("-", " ").replace("&", " ").split():
        chunk = chunk.strip(".,")
        if len(chunk) > 1:
            parts.add(chunk)
    expanded = set(parts)
    for part in parts:
        for group in SKILL_GROUPS:
            if part in group or any(part in g or g in part for g in group):
                expanded.update(group)
    return expanded


def get_matched_skills(user_skills: list[str], required: list[str]) -> list[str]:
    """Return required skills that match the user's profile (for UI hints)."""
    if not user_skills or not required:
        return []
    user_tokens: set[str] = set()
    for skill in user_skills:
        user_tokens.update(_tokens(skill))

    matched: list[str] = []
    for req in required:
        req_tokens = _tokens(req)
        if req_tokens & user_tokens:
            matched.append(req)
            continue
        if any(
            rt in ut or ut in rt
            for rt in req_tokens
            for ut in user_tokens
            if len(rt) > 2 and len(ut) > 2
        ):
            matched.append(req)
    return matched


def compute_match_score(user_skills: list[str], required: list[str]) -> int:
    if not required:
        return 0
    user_tokens: set[str] = set()
    for skill in user_skills:
        user_tokens.update(_tokens(skill))
    if not user_tokens:
        return 0

    req_tokens_list = [_tokens(r) for r in required if r.strip()]
    if not req_tokens_list:
        return 0

    matched = 0.0
    for req_tokens in req_tokens_list:
        if req_tokens & user_tokens:
            matched += 1.0
            continue
        partial = any(
            rt in ut or ut in rt
            for rt in req_tokens
            for ut in user_tokens
            if len(rt) > 2 and len(ut) > 2
        )
        if partial:
            matched += 0.5

    return min(100, int((matched / len(req_tokens_list)) * 100))
