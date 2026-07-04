"use client";

import { useMemo, useState } from "react";
import { Camera, ChevronLeft, ChevronRight, GraduationCap, Sparkles } from "lucide-react";
import { completeOnboarding, type OnboardingData } from "@/actions/onboarding";
import { apiUpload } from "@/lib/api/client";
import { MAX_GRADE, MIN_GRADE } from "@/lib/constants";
import type { UserProfile } from "@/types/models";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const STEPS = [
  { title: "Profile", subtitle: "Photo, name & @username" },
  { title: "School", subtitle: "Class & campus" },
  { title: "About you", subtitle: "City & bio" },
  { title: "Strengths", subtitle: "Skills & interests" },
  { title: "Goals", subtitle: "Where you're headed" },
] as const;

interface OnboardingWizardProps {
  profile: UserProfile;
}

function parseCommaList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function OnboardingWizard({ profile }: OnboardingWizardProps) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profile.profile_picture_url
  );

  const [fullName, setFullName] = useState(profile.full_name);
  const [schoolName, setSchoolName] = useState(profile.school_name);
  const [grade, setGrade] = useState(String(profile.grade));
  const [city, setCity] = useState(profile.city ?? "");
  const [bio, setBio] = useState(profile.bio ?? "");
  const [skills, setSkills] = useState((profile.skills ?? []).join(", "));
  const [interests, setInterests] = useState((profile.interests ?? []).join(", "));
  const [careerGoals, setCareerGoals] = useState(profile.career_goals ?? "");
  const [username, setUsername] = useState(profile.username ?? "");

  const USERNAME_PATTERN = /^[a-z0-9_]{3,30}$/;

  const initials = useMemo(
    () =>
      fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "?",
    [fullName]
  );

  const progress = ((step + 1) / STEPS.length) * 100;

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const updated = await apiUpload<{ profile_picture_url: string | null }>(
        "/users/me/avatar",
        fd
      );
      setAvatarPreview(updated.profile_picture_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Photo upload failed");
    } finally {
      setLoading(false);
    }
  }

  function validateStep(current: number): string | null {
    if (current === 0 && fullName.trim().length < 2) {
      return "Please enter your full name";
    }
    if (current === 0 && username.trim() && !USERNAME_PATTERN.test(username.trim().toLowerCase())) {
      return "Username: 3–30 chars, lowercase letters, numbers, underscores only";
    }
    if (current === 1) {
      if (schoolName.trim().length < 2) return "Please enter your school name";
      const g = Number(grade);
      if (!g || g < MIN_GRADE || g > MAX_GRADE) {
        return `Please select a class between ${MIN_GRADE} and ${MAX_GRADE}`;
      }
    }
    return null;
  }

  function goNext() {
    const validationError = validateStep(step);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  async function handleFinish() {
    const validationError = validateStep(0) ?? validateStep(1);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    const payload: OnboardingData = {
      fullName: fullName.trim(),
      schoolName: schoolName.trim(),
      grade: Number(grade),
      city: city.trim() || undefined,
      bio: bio.trim() || undefined,
      skills: parseCommaList(skills),
      interests: parseCommaList(interests),
      careerGoals: careerGoals.trim() || undefined,
      username: username.trim().toLowerCase() || undefined,
    };

    const result = await completeOnboarding(payload);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <GlassPanel depth="lg" tilt className="mx-auto w-full max-w-xl p-6 sm:p-10">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-500/30 text-indigo-200 panel-3d-depth">
          <GraduationCap className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300/70">
            Welcome to ScholarNet
          </p>
          <h1 className="text-xl font-bold text-white text-3d-glow sm:text-2xl">
            Set up your profile
          </h1>
        </div>
      </div>

      <div className="mb-8 space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Step {step + 1} of {STEPS.length}
          </span>
          <span>{STEPS[step].title}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="hidden justify-between gap-1 sm:flex">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className={`flex-1 rounded-lg px-2 py-1.5 text-center text-[10px] uppercase tracking-wide transition-colors ${
                i === step
                  ? "bg-indigo-500/25 text-indigo-200"
                  : i < step
                    ? "text-indigo-300/60"
                    : "text-muted-foreground"
              }`}
            >
              {s.subtitle}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="min-h-[280px] space-y-5">
        {step === 0 && (
          <>
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
              <div className="relative">
                <Avatar className="h-24 w-24 border-4 border-background ring-4 ring-indigo-500/30">
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt={fullName} />
                  ) : null}
                  <AvatarFallback className="bg-indigo-500/30 text-2xl">{initials}</AvatarFallback>
                </Avatar>
                <label
                  htmlFor="onboarding-avatar"
                  className="absolute -bottom-1 -right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-indigo-600 text-white shadow-lg transition hover:bg-indigo-500"
                >
                  <Camera className="h-4 w-4" />
                </label>
                <input
                  id="onboarding-avatar"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleAvatarChange}
                  disabled={loading}
                />
              </div>
              <div className="flex-1 space-y-1 text-center sm:text-left">
                <p className="font-medium text-white">Profile photo</p>
                <p className="text-sm text-muted-foreground">
                  Optional — add a photo so classmates recognize you.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="onboarding-username">Public @username</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                <Input
                  id="onboarding-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="yashraj"
                  className="pl-7"
                  maxLength={30}
                />
              </div>
              <p className="text-xs text-muted-foreground">Your shareable portfolio link: scholarnet.in/@username</p>
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="schoolName">School name</Label>
              <Input
                id="schoolName"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                required
                placeholder="Your school"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade">Class / Grade</Label>
              <Select value={grade} onValueChange={setGrade}>
                <SelectTrigger id="grade" className="w-full bg-transparent">
                  <SelectValue placeholder="Select your class" />
                </SelectTrigger>
                <SelectContent className="z-[200] border-border bg-popover text-popover-foreground">
                  {Array.from({ length: MAX_GRADE - MIN_GRADE + 1 }, (_, i) => {
                    const g = MIN_GRADE + i;
                    return (
                      <SelectItem key={g} value={String(g)}>
                        Class {g}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Classes {MIN_GRADE}–{MAX_GRADE} only.
              </p>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Where do you live? (optional)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                placeholder="Tell classmates a little about yourself… (optional)"
                maxLength={500}
              />
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="space-y-2">
              <Label htmlFor="skills">Skills</Label>
              <Input
                id="skills"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                placeholder="e.g. Python, Debate, Football (optional)"
              />
              <p className="text-xs text-muted-foreground">Separate with commas.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="interests">Interests</Label>
              <Input
                id="interests"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="e.g. Robotics, Music, Startups (optional)"
              />
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div className="flex items-start gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-4">
              <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-indigo-300" />
              <p className="text-sm text-slate-300">
                Share what you want to explore — careers, college paths, or dream roles. This helps
                ScholarNet surface the right opportunities for you.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="careerGoals">Career goals</Label>
              <Textarea
                id="careerGoals"
                value={careerGoals}
                onChange={(e) => setCareerGoals(e.target.value)}
                rows={5}
                placeholder="What do you want to become or explore? (optional)"
                maxLength={500}
              />
            </div>
          </>
        )}
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {step > 0 && (
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={loading}
              className="gap-1 border-white/15 bg-white/5"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          {step >= 2 && step < STEPS.length - 1 && (
            <Button
              type="button"
              variant="ghost"
              onClick={goNext}
              disabled={loading}
              className="text-muted-foreground"
            >
              Skip
            </Button>
          )}
        </div>

        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={goNext} disabled={loading} className="btn-3d gap-1">
            Continue
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="button" onClick={handleFinish} disabled={loading} className="btn-3d gap-1">
            {loading ? "Saving…" : "Enter dashboard"}
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </GlassPanel>
  );
}
