import { useEffect, useState, useCallback } from "react";
import { ScriptureService } from "../services/scriptureService";
import { UIScripture } from "../types/scripture.types";

export const useScriptures = () => {
  const [data, setData] = useState<UIScripture[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ScriptureService.getScriptures();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, refresh: fetch };
};
