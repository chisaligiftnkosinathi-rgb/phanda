export type UIGiveType =
  | "appreciation"
  | "gratitude"
  | "support"
  | "blessing"
  | "gift";

export interface UIGiving {
  id: string;
  giverId: string;
  receiverId?: string;

  workId?: string;
  reflectionId?: string;

  type: UIGiveType;

  message?: string;

  // Symbolic only — NOT ledger-bound
  value?: {
    amount: number;
    currency: string;
    symbolic: true;
  };

  createdAt: string;
}
