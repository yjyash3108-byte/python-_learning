export type Club = {
  id: string;
  name: string;
  description: string;
  category: string;
  emoji: string;
  color: string;
  creator_id: string;
  school_name: string | null;
  member_count: number;
  is_verified: boolean;
  is_member: boolean;
  my_role: string | null;
  created_at: string;
};

export type ClubDetail = Club & {
  creator: {
    id: string;
    full_name: string;
    profile_picture_url: string | null;
  };
  admin_count: number;
};

export type ClubMember = {
  id: string;
  user_id: string;
  full_name: string;
  profile_picture_url: string | null;
  school_name: string;
  grade: number;
  role: string;
  joined_at: string;
};

export type ClubLimits = {
  is_pro: boolean;
  clubs_created: number;
  max_clubs_created: number | null;
  can_create_club: boolean;
  upgrade_required: boolean;
};

export type ClubActionResponse = {
  message: string;
  club: Club;
};
