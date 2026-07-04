"use client";

import { useState } from "react";
import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api/client";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AdminUser, SystemStatus } from "@/lib/data/admin";
import type { Opportunity } from "@/types/opportunity";

type AdminPanelProps = {
  initialUsers: AdminUser[];
  initialOpportunities: Opportunity[];
  systemStatus: SystemStatus | null;
};

export function AdminPanel({
  initialUsers,
  initialOpportunities,
  systemStatus,
}: AdminPanelProps) {
  const [tab, setTab] = useState<"users" | "opportunities" | "reports" | "verify">("users");
  const [users, setUsers] = useState(initialUsers);
  const [opportunities, setOpportunities] = useState(initialOpportunities);
  const [reports, setReports] = useState<Array<{
    id: string;
    target_type: string;
    target_id: string;
    reason: string;
    status: string;
    created_at: string;
  }>>([]);
  const [editingOppId, setEditingOppId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [schoolName, setSchoolName] = useState("");
  const [schoolCity, setSchoolCity] = useState("");
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reportAction(reportId: string, action: string) {
    setLoading(true);
    setError(null);
    try {
      const res = await apiPost<{ status: string }>(
        `/reports/admin/${reportId}/action?action=${encodeURIComponent(action)}`
      );
      setReports((prev) =>
        prev.map((x) => (x.id === reportId ? { ...x, status: res.status } : x))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setLoading(false);
    }
  }

  async function toggleUserVerified(userId: string, verified: boolean) {
    setLoading(true);
    setError(null);
    try {
      await apiPatch(`/admin/users/${userId}/verify?verified=${verified}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_verified: verified } : u))
      );
      setVerifyMessage(verified ? "Student verified." : "Verification removed.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification update failed");
    } finally {
      setLoading(false);
    }
  }

  async function verifySchool(verified: boolean) {
    if (!schoolName.trim()) {
      setError("School name is required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await apiPost("/admin/schools/verify", {
        school_name: schoolName.trim(),
        city: schoolCity.trim() || null,
        is_verified: verified,
      });
      setVerifyMessage(verified ? `"${schoolName}" marked verified.` : `"${schoolName}" verification removed.`);
      setSchoolName("");
      setSchoolCity("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "School verification failed");
    } finally {
      setLoading(false);
    }
  }

  async function toggleUser(userId: string, activate: boolean) {
    setLoading(true);
    setError(null);
    try {
      await apiPatch(`/admin/users/${userId}/${activate ? "activate" : "deactivate"}`);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: activate } : u))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateOpp(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const form = event.currentTarget;
    const fd = new FormData(form);
    try {
      const created = await apiPost<Opportunity>("/admin/opportunities", {
        title: String(fd.get("title")),
        organization: String(fd.get("organization")),
        opportunity_type: String(fd.get("opportunity_type") || "internship"),
        description: String(fd.get("description") || ""),
        skills_required: String(fd.get("skills") || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        link_url: String(fd.get("link_url") || "") || null,
      });
      setOpportunities((prev) => [created, ...prev]);
      form.reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Create failed");
    } finally {
      setLoading(false);
    }
  }

  async function deleteOpp(id: string) {
    if (!confirm("Delete this opportunity?")) return;
    setLoading(true);
    try {
      await apiDelete(`/admin/opportunities/${id}`);
      setOpportunities((prev) => prev.filter((o) => o.id !== id));
      if (editingOppId === id) setEditingOppId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateOpp(event: React.FormEvent<HTMLFormElement>, oppId: string) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const fd = new FormData(event.currentTarget);
    try {
      const updated = await apiPatch<Opportunity>(`/admin/opportunities/${oppId}`, {
        title: String(fd.get("title")),
        organization: String(fd.get("organization")),
        opportunity_type: String(fd.get("opportunity_type") || "internship"),
        description: String(fd.get("description") || ""),
        skills_required: String(fd.get("skills") || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        link_url: String(fd.get("link_url") || "") || null,
      });
      setOpportunities((prev) => prev.map((o) => (o.id === oppId ? updated : o)));
      setEditingOppId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {systemStatus && (
        <GlassPanel depth="sm" className="grid gap-2 p-4 text-sm sm:grid-cols-2">
          <p>Email (SMTP): {systemStatus.smtp_configured ? "✓ Configured" : "✗ Not configured"}</p>
          <p>Cloudinary: {systemStatus.cloudinary_configured ? "✓" : "✗"}</p>
          <p>Razorpay: {systemStatus.razorpay_configured ? "✓" : "✗ (add later)"}</p>
          <p>From: {systemStatus.email_from}</p>
        </GlassPanel>
      )}

      <div className="flex flex-wrap gap-2">
        {(["users", "opportunities", "reports", "verify"] as const).map((t) => (
          <Button
            key={t}
            size="sm"
            variant={tab === t ? "default" : "outline"}
            onClick={() => {
              setTab(t);
              if (t === "reports" && reports.length === 0) {
                apiGet<typeof reports>("/reports/admin").then(setReports).catch(() => {});
              }
            }}
            className={tab === t ? "btn-3d capitalize" : "capitalize"}
          >
            {t}
          </Button>
        ))}
      </div>

      {tab === "users" && (
        <div className="space-y-3">
          {users.map((u) => (
            <GlassPanel key={u.id} depth="sm" className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">
                  {u.full_name}
                  {u.is_verified && (
                    <span className="ml-2 text-xs font-normal text-cyan-400">Verified</span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{u.email}</p>
                {u.school_name && (
                  <p className="text-xs text-muted-foreground">{u.school_name}</p>
                )}
                {!u.is_active && (
                  <span className="text-xs text-destructive">Deactivated</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={u.is_verified ? "outline" : "default"}
                  disabled={loading}
                  onClick={() => toggleUserVerified(u.id, !u.is_verified)}
                >
                  {u.is_verified ? "Unverify" : "Verify student"}
                </Button>
                <Button
                  size="sm"
                  variant={u.is_active ? "destructive" : "default"}
                  disabled={loading}
                  onClick={() => toggleUser(u.id, !u.is_active)}
                >
                  {u.is_active ? "Deactivate" : "Activate"}
                </Button>
              </div>
            </GlassPanel>
          ))}
        </div>
      )}

      {tab === "opportunities" && (
        <div className="space-y-6">
          <GlassPanel depth="sm" className="p-4">
            <h3 className="mb-4 font-semibold">Add opportunity</h3>
            <form onSubmit={handleCreateOpp} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" name="title" required />
                </div>
                <div>
                  <Label htmlFor="organization">Organization</Label>
                  <Input id="organization" name="organization" required />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" rows={2} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label htmlFor="opportunity_type">Type</Label>
                  <Input id="opportunity_type" name="opportunity_type" placeholder="internship" />
                </div>
                <div>
                  <Label htmlFor="skills">Skills (comma-separated)</Label>
                  <Input id="skills" name="skills" placeholder="Python, Robotics" />
                </div>
              </div>
              <Input name="link_url" placeholder="https://apply-link.com" />
              <Button type="submit" className="btn-3d" disabled={loading}>
                Add opportunity
              </Button>
            </form>
          </GlassPanel>

          {opportunities.map((o) => (
            <GlassPanel key={o.id} depth="sm" className="p-4">
              {editingOppId === o.id ? (
                <form onSubmit={(e) => handleUpdateOpp(e, o.id)} className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input name="title" defaultValue={o.title} required />
                    <Input name="organization" defaultValue={o.organization} required />
                  </div>
                  <Textarea name="description" rows={2} defaultValue={o.description} />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input name="opportunity_type" defaultValue={o.opportunity_type} />
                    <Input
                      name="skills"
                      defaultValue={(o.skills_required ?? []).join(", ")}
                    />
                  </div>
                  <Input name="link_url" defaultValue={o.link_url ?? ""} />
                  <div className="flex gap-2">
                    <Button type="submit" size="sm" className="btn-3d" disabled={loading}>
                      Save
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingOppId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">{o.title}</p>
                    <p className="text-sm text-muted-foreground">{o.organization}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={loading}
                      onClick={() => setEditingOppId(o.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={loading}
                      onClick={() => deleteOpp(o.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </GlassPanel>
          ))}
        </div>
      )}

      {tab === "reports" && (
        <div className="space-y-3">
          {reports.length === 0 ? (
            <GlassPanel depth="sm" className="p-4 text-sm text-muted-foreground">
              No reports yet.
            </GlassPanel>
          ) : (
            reports.map((r) => (
              <GlassPanel key={r.id} depth="sm" className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium capitalize">{r.target_type} report</p>
                    <p className="text-sm text-muted-foreground">{r.reason}</p>
                    <p className="text-xs text-muted-foreground">Target: {r.target_id}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs uppercase text-amber-300">{r.status}</span>
                    {r.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={loading}
                          onClick={() => reportAction(r.id, "dismiss")}
                        >
                          Dismiss
                        </Button>
                        {r.target_type === "user" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={loading}
                            onClick={() => reportAction(r.id, "deactivate_user")}
                          >
                            Deactivate user
                          </Button>
                        )}
                        {r.target_type === "post" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={loading}
                            onClick={() => reportAction(r.id, "deactivate_post")}
                          >
                            Remove post
                          </Button>
                        )}
                      </>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={loading}
                      onClick={async () => {
                        await apiPatch(`/reports/admin/${r.id}?status=reviewed`);
                        setReports((prev) =>
                          prev.map((x) => (x.id === r.id ? { ...x, status: "reviewed" } : x))
                        );
                      }}
                    >
                      Mark reviewed
                    </Button>
                  </div>
                </div>
              </GlassPanel>
            ))
          )}
        </div>
      )}

      {tab === "verify" && (
        <div className="space-y-6">
          <GlassPanel depth="sm" className="space-y-4 p-4">
            <h3 className="font-semibold">Verify school</h3>
            <p className="text-sm text-muted-foreground">
              Add or update a school in verified_schools. Verified schools show a badge on school pages.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="school-name">School name</Label>
                <Input
                  id="school-name"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Delhi Public School"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="school-city">City (optional)</Label>
                <Input
                  id="school-city"
                  value={schoolCity}
                  onChange={(e) => setSchoolCity(e.target.value)}
                  placeholder="New Delhi"
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                className="btn-3d"
                disabled={loading}
                onClick={() => verifySchool(true)}
              >
                Mark verified
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={loading}
                onClick={() => verifySchool(false)}
              >
                Remove verification
              </Button>
            </div>
          </GlassPanel>
          {verifyMessage && (
            <p className="text-sm text-emerald-400">{verifyMessage}</p>
          )}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
