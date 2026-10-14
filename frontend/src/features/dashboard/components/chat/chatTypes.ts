export type ChatMessage = {
  id: string;
  text: string;
  createdAt: string; // ISO date-time
  mine: boolean; // true = sent by the current user (right side, filled)
};
