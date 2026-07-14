import {
  UIOwnedEntity,
  UIMoney,
  UITrustMetrics,
  UICommerceStatus
} from "./master.types";

export type QuoteItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type UIQuote = UIOwnedEntity & {
  leadId: string;

  title: string;
  description?: string;

  status: UICommerceStatus;

  items: QuoteItem[];

  subtotal: UIMoney;
  tax?: UIMoney;
  total: UIMoney;

  trustSnapshot: UITrustMetrics;

  expiresAt?: string;
};
