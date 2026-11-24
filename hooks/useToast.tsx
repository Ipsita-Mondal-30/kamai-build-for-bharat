"use client";
import { useCallback, useState } from "react";

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null);
  const toast = useCallback((m: string) => { setMsg(m); setTimeout(() => setMsg(null), 3200); }, []);
  const node = msg ? <div className="toast">{msg}</div> : null;
  return { toast, toastNode: node };
}
