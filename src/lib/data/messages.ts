import { serverFetch, serverFetchOptional } from "@/lib/api/server-client";
import type { CanMessage, Conversation, DirectMessage } from "@/types/messages";

export async function getConversations(): Promise<Conversation[]> {
  return serverFetch<Conversation[]>("/api/v1/messages/conversations");
}

export async function getConversationMessages(conversationId: string): Promise<DirectMessage[]> {
  return serverFetch<DirectMessage[]>(`/api/v1/messages/conversations/${conversationId}/messages`);
}

export async function canMessageUser(userId: string): Promise<CanMessage | null> {
  return serverFetchOptional<CanMessage>(`/api/v1/messages/can-message/${userId}`);
}
