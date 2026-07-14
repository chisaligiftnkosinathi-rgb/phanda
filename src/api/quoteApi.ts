import { apiClient } from "./client";

// -------------------------------------------------------
// LINE ITEM TYPE
// -------------------------------------------------------
export interface QuoteLineItem {
  name: string;
  description?: string;
  category: string;
  quantity: number;
  unit: string;
  unit_price: number;
  line_total: number;
}

// -------------------------------------------------------
// QUOTE OUTPUT TYPE (used by all screens)
// -------------------------------------------------------
export interface QuoteOut {
  id: string;
  status: string;
  customer_name: string;
  customer_phone?: string;
  description?: string;
  amount: number;
  created_at: string;
  quote_template_version?: string;
  line_items?: QuoteLineItem[];
  structured_terms?: {
    planning?: {
      expected_labour_hours?: string | number | null;
      expected_travel_km?: string | number | null;
      expected_material_cost?: string | number | null;
      expected_notes?: string | null;
    };
  };
}

// -------------------------------------------------------
// CORE API OBJECT
// -------------------------------------------------------
export const quoteApi = {
  getAll: () => apiClient.get("quotes"),

  getById: (id: string) => apiClient.get(`quotes/${id}`),

  generateFromLead: (leadId: string) =>
    apiClient.post(`leads/${leadId}/quote/generate`),

  send: (id: string) => apiClient.post(`quotes/${id}/send`),

  accept: (id: string) => apiClient.post(`quotes/${id}/accept`),

  reject: (id: string) => apiClient.post(`quotes/${id}/reject`),
};

// -------------------------------------------------------
// NAMED FUNCTION EXPORTS (consumed by screens directly)
// -------------------------------------------------------

/** Fetch a single quote by ID (authenticated). */
export async function fetchQuoteDetail(id: string): Promise<QuoteOut> {
  const res = await apiClient.get<QuoteOut>(`quotes/${id}`);
  return res.data;
}

/** Accept a quote by ID (authenticated). */
export async function acceptQuote(id: string): Promise<QuoteOut> {
  const res = await apiClient.post<QuoteOut>(`quotes/${id}/accept`);
  return res.data;
}

/** Fetch all quotes belonging to the current steward (authenticated). */
export async function fetchMyQuotes(): Promise<QuoteOut[]> {
  const res = await apiClient.get<QuoteOut[]>("quotes");
  return res.data;
}

/** Fetch a single quote using a public share token (unauthenticated). */
export async function publicFetchQuoteDetail(token: string): Promise<QuoteOut> {
  const res = await apiClient.get<QuoteOut>(`quotes/public/${token}`);
  return res.data;
}

/** Accept a quote using a public share token (unauthenticated). */
export async function publicAcceptQuote(token: string): Promise<QuoteOut> {
  const res = await apiClient.post<QuoteOut>(`quotes/public/${token}/accept`);
  return res.data;
}

