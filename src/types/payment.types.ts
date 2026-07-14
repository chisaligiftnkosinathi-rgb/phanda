import { UIMoney } from "./master.types";

export type UIPaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export type UIPayment = {
  id: string;
  invoiceId: string;

  amount: UIMoney;
  status: UIPaymentStatus;

  method: "card" | "bank" | "wallet";

  createdAt: string;
};
