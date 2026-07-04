import { MessagesInbox } from "@/components/messages/messages-inbox";
import { getConversations, getConversationMessages } from "@/lib/data/messages";

export const metadata = { title: "Messages" };

type PageProps = {
  searchParams: Promise<{ conversation?: string }>;
};

export default async function MessagesPage({ searchParams }: PageProps) {
  const { conversation: selectedId } = await searchParams;
  const conversations = await getConversations().catch(() => []);
  const initialMessages = selectedId
    ? await getConversationMessages(selectedId).catch(() => [])
    : [];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-300/70">
          Direct messages
        </p>
        <h1 className="text-3xl font-bold text-foreground text-3d-glow">Messages</h1>
        <p className="text-sm text-muted-foreground">
          Chat with students you mutually follow. Both must follow each other to message.
        </p>
      </div>
      <MessagesInbox
        initialConversations={conversations}
        initialMessages={initialMessages}
        selectedConversationId={selectedId ?? conversations[0]?.id ?? null}
      />
    </div>
  );
}
