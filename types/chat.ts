export type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
  /** 该条 assistant 回复是否伴随记账成功 */
  expenseRecorded?: boolean;
};

export type AIChatStorage = {
  messages: ChatMessage[];
  replyIndex: number;
  nextId: number;
};
