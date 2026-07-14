export type UIScriptureType =
  | "reflection_insight"
  | "execution_lesson"
  | "giving_meaning"
  | "campaign_statement"
  | "system_principle";

export type UIScriptureOriginType = 
  | "reflection" 
  | "work" 
  | "campaign" 
  | "giving"
  | "system";

export interface UIScripture {
  id: string;
  title: string;
  content: string; // canonical text
  
  originType: UIScriptureOriginType;
  originId?: string; // read-only link

  tags: string[]; // meaning classification
  weight: number; // importance score — non-financial
  
  locked: boolean; // prevents mutation
  
  createdAt: string;
}
