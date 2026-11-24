"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

// GET an endpoint that needs a login. Sends signed-out visitors to /join, then back here.
export function useApi<T = any>(path: string) {
  const router = useRouter();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    try { setData(await api<T>(path)); setError(null); }
    catch (e: any) { if (e.status === 401) router.replace("/join?next=" + encodeURIComponent(path.includes("vendor") ? "/vendor" : path.includes("lender") ? "/lender" : "/insurer")); else setError(e.message); }
  }, [path, router]);
  useEffect(() => { reload(); }, [reload]);
  return { data, error, reload };
}
