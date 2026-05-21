export type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

export type AIChatStorage = {
  messages: ChatMessage[];
  replyIndex: number;
  nextId: number;
};
