import { ConstitutionService } from "../services/constitutionService";

export const useConstitutionActions = () => {
  const submitAmendment = async (targetArticleId: string, justification: string) => {
    return await ConstitutionService.createAmendment(targetArticleId, justification);
  };

  return { submitAmendment };
};
