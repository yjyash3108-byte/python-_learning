export type ClubAnalytics = {
  member_count: number;
  event_count: number;
  announcement_count: number;
  upcoming_events: number;
  new_members_7d: number;
  total_rsvps: number;
  member_growth: { date: string; joins: number }[];
  is_pro: boolean;
  can_view_advanced: boolean;
};
