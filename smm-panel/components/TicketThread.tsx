import { Time } from "./Time";

export interface TicketMessage {
  id: number;
  body: string;
  is_staff: boolean;
  created_at: Date;
  author: string | null;
}

export function TicketThread({ messages, viewerIsStaff }: { messages: TicketMessage[]; viewerIsStaff: boolean }) {
  return (
    <div className="thread">
      {messages.map((m) => (
        <div key={m.id} className={`msg ${m.is_staff === viewerIsStaff ? "mine" : ""}`}>
          <div className="meta">
            {m.is_staff ? "Support" : m.author ?? "Customer"} · <Time value={m.created_at} />
          </div>
          {m.body}
        </div>
      ))}
    </div>
  );
}
