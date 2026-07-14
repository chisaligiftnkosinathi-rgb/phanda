export type UIBaseEntity = {
  id: string;
  createdAt: string;
  updatedAt?: string;
};

export type UIOwnedEntity = UIBaseEntity & {
  ownerId: string;
  ownerName?: string;
  ownerAvatar?: string;
};

export type UIStatus =
  | "draft"
  | "active"
  | "pending"
  | "completed"
  | "closed"
  | "cancelled"
  | "rejected";

export type UIMoney = {
  amount: number;
  currency: "ZAR" | "USD" | "EUR" | "GBP";
};

export type UITrustMetrics = {
  trustScore: number;        // 0–100
  verificationLevel: 0 | 1 | 2 | 3;
  isVerified: boolean;
};

export type UIMedia = {
  id?: string;
  type: "image" | "video" | "audio" | "document";
  url: string;
  thumbnail?: string;
};

export type UIPaginated<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  hasNext: boolean;
};

export type UIDomainError = {
  code:
    | "NETWORK_ERROR"
    | "VALIDATION_ERROR"
    | "PERMISSION_DENIED"
    | "NOT_FOUND"
    | "UNKNOWN";
  message: string;
};

export type UIRelation = {
  type: "opportunity" | "lead" | "job" | "profile";
  id: string;
};

export type UICommerceStatus =
  | "draft"
  | "sent"
  | "viewed"
  | "accepted"
  | "rejected"
  | "expired"
  | "paid"
  | "partially_paid";

export type UIConversionChain = {
  leadId: string;
  quoteId?: string;
  invoiceId?: string;
  paymentId?: string;
};
