import { UIOwnedEntity, UIMoney } from "./master.types";

export type WorkStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "paused"
  | "completed"
  | "verified"
  | "reflection_pending"
  | "reflected";

export type WorkType =
  | "job_card"
  | "field_service"
  | "delivery"
  | "installation"
  | "maintenance";

export type WorkExpense = {
  id: string;
  type: "travel" | "fuel" | "materials" | "other";
  amount: UIMoney;
  description?: string;
};

export type WorkItem = {
  id: string;
  name: string;
  quantity: number;
};

export type UIWork = UIOwnedEntity & {
  quoteId: string;
  invoiceId: string;

  title: string;
  description?: string;

  type: WorkType;
  status: WorkStatus;

  assignedTo?: string;

  items: WorkItem[];
  expenses: WorkExpense[];

  laborCost: UIMoney;
  totalCost: UIMoney;

  startedAt?: string;
  completedAt?: string;
};
