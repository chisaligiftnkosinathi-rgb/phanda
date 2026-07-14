export interface UIConstitutionClause {
  id: string;
  text: string;
}

export interface UIConstitutionArticle {
  id: string;
  title: string;
  clauses: UIConstitutionClause[];
}

export interface UIConstitutionVersion {
  version: string;
  preamble: string;
  articles: UIConstitutionArticle[];
}

export interface UIConstitutionViolation {
  id: string;
  timestamp: string;
  sourceLayer: "A+" | "A" | "B" | "C" | "C+" | "C++" | "D" | "E" | "F";
  violatedArticleId: string;
  description: string;
}

export interface UIConstitutionAmendment {
  id: string;
  targetArticleId: string;
  proposedClauses: UIConstitutionClause[];
  justification: string;
  status: "pending" | "approved" | "rejected";
  effectiveVersion?: string;
  approvalHistory: { actor: string, timestamp: string }[];
}
