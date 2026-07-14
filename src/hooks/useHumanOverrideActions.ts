import { HumanOverrideService } from "../services/humanOverrideService";

export const useHumanOverrideActions = () => {
  const submitDecision = async (requestId: string, selectedOptionId: string, actor: string) => {
    return await HumanOverrideService.recordHumanDecision(requestId, selectedOptionId, actor);
  };

  return { submitDecision };
};
