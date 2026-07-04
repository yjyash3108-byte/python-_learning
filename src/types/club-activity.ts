export type ClubEvent = {
  id: string;
  club_id: string;
  creator_id: string;
  title: string;
  description: string;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  rsvp_count: number;
  is_rsvped: boolean;
  created_at: string;
};

export type ClubAnnouncement = {
  id: string;
  club_id: string;
  author_id: string;
  author_name: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
};
