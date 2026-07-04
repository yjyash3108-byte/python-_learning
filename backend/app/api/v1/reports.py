from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.deps import get_current_admin, get_current_user
from app.db.session import get_db
from app.models import Report, User

router = APIRouter(prefix="/reports", tags=["reports"])


class ReportCreate(BaseModel):
    target_type: str = Field(pattern="^(user|post|message|club)$")
    target_id: str = Field(min_length=1, max_length=100)
    reason: str = Field(min_length=3, max_length=120)
    details: str = Field(default="", max_length=1000)


@router.post("", status_code=201)
def create_report(
    body: ReportCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    report = Report(
        reporter_id=user.id,
        target_type=body.target_type,
        target_id=body.target_id,
        reason=body.reason.strip(),
        details=body.details.strip(),
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return {"message": "Report submitted. Our team will review it.", "id": str(report.id)}


@router.get("/admin")
def list_reports(
    admin: Annotated[User, Depends(get_current_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    reports = db.query(Report).order_by(Report.created_at.desc()).limit(100).all()
    return [
        {
            "id": str(r.id),
            "reporter_id": str(r.reporter_id),
            "target_type": r.target_type,
            "target_id": r.target_id,
            "reason": r.reason,
            "details": r.details,
            "status": r.status,
            "created_at": r.created_at.isoformat(),
        }
        for r in reports
    ]


@router.patch("/admin/{report_id}")
def update_report_status(
    report_id: UUID,
    status: str,
    admin: Annotated[User, Depends(get_current_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    if status not in {"pending", "reviewed", "dismissed", "action_taken"}:
        raise HTTPException(status_code=400, detail="Invalid status")
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    report.status = status
    db.commit()
    return {"message": "Report updated"}


@router.post("/admin/{report_id}/action")
def admin_report_action(
    report_id: UUID,
    action: str,
    admin: Annotated[User, Depends(get_current_admin)],
    db: Annotated[Session, Depends(get_db)],
):
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    if action == "dismiss":
        report.status = "dismissed"
    elif action == "deactivate_user" and report.target_type == "user":
        try:
            target_id = UUID(report.target_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid user target")
        target = db.query(User).filter(User.id == target_id).first()
        if target and target.id != admin.id:
            target.is_active = False
        report.status = "action_taken"
    elif action == "deactivate_post" and report.target_type == "post":
        from app.models import Post

        try:
            post_id = UUID(report.target_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid post target")
        post = db.query(Post).filter(Post.id == post_id).first()
        if post:
            db.delete(post)
        report.status = "action_taken"
    else:
        raise HTTPException(status_code=400, detail="Unknown action")
    db.commit()
    return {"message": "Action applied", "status": report.status}
