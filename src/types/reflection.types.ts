import { UIOwnedEntity } from "./master.types";

export type UIReflectionSentiment = "positive" | "neutral" | "negative";

export type UIReflection = UIOwnedEntity & {
  workId: string;
  content: string;
  sentiment?: UIReflectionSentiment;
};
