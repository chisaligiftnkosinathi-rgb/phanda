import { useState } from "react";
import { ScriptureService } from "../services/scriptureService";
import { UIScriptureOriginType } from "../types/scripture.types";

export const useScriptureAction = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const elevate = async (
    originType: UIScriptureOriginType,
    originId: string,
    title: string,
    content: string,
    tags: string[] = []
  ) => {
    setLoading(true);
    setError(null);
    try {
      switch (originType) {
        case "reflection":
          return await ScriptureService.elevateFromReflection(originId, title, content, tags);
        case "work":
          return await ScriptureService.elevateFromWork(originId, title, content, tags);
        case "campaign":
          return await ScriptureService.elevateFromCampaign(originId, title, content, tags);
        case "giving":
          return await ScriptureService.elevateFromGiving(originId, title, content, tags);
        default:
          throw new Error("Unsupported elevation origin");
      }
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const lock = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      return await ScriptureService.lockScripture(id);
    } catch (e: any) {
      setError(e);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  return { elevate, lock, loading, error };
};
