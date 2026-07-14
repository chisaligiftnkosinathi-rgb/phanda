import { useEffect, useState } from "react";
import { ScriptureService } from "../services/scriptureService";
import { UIScripture } from "../types/scripture.types";

export const useScripture = (id: string) => {
  const [data, setData] = useState<UIScripture | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await ScriptureService.getScriptureById(id);
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      load();
    }
  }, [id]);

  return { data, loading };
};
