export type Opportunity = {
  id: string;
  title: string;
  organization: string;
  opportunity_type: string;
  description: string;
  skills_required: string[];
  link_url: string | null;
  deadline: string | null;
  match_score: number;
  matched_skills?: string[];
  has_applied: boolean;
  is_saved: boolean;
  created_at: string;
};
