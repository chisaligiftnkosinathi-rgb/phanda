import { UIOwnedEntity, UIMoney } from "./master.types";
import { UICommerceStatus } from "./master.types";

export type UIInvoiceItem = {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type UIInvoice = UIOwnedEntity & {
  quoteId: string;
  leadId: string;

  status: UICommerceStatus;

  items: UIInvoiceItem[];

  subtotal: UIMoney;
  tax?: UIMoney;
  total: UIMoney;

  dueDate: string;
  issuedAt: string;
};
