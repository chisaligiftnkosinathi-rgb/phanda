import {
  UIOwnedEntity,
  UIStatus,
  UITrustMetrics,
  UIMedia,
  UIMoney
} from "./master.types";

export type LeadStatus =
  | UIStatus
  | "new"
  | "contacted"
  | "qualified"
  | "quoted"
  | "converted"
  | "invoiced";

export type UILead = UIOwnedEntity & {
  title: string;
  description: string;

  status: LeadStatus;

  trust: UITrustMetrics;
  media: UIMedia[];

  potentialValue?: UIMoney;
  convertedToQuoteId?: string;
  convertedToInvoiceId?: string;

  isQualified: boolean;
};
