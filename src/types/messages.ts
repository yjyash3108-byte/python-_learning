export type Conversation = {
  id: string;
  other_user: {
    id: string;
    full_name: string;
    profile_picture_url: string | null;
  };
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
};

export type DirectMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
  is_mine: boolean;
};

export type CanMessage = {
  can_message: boolean;
  reason: string | null;
};
