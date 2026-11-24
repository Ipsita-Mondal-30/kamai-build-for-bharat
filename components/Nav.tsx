"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Nav() {
  const path = (usePathname() || "/").replace(/\/$/, "") || "/";
  const router = useRouter();
  const [me, setMe] = useState<{ name: string; role: string } | null | undefined>(undefined);
  useEffect(() => { api("/api/me").then(r => setMe(r.user)).catch(() => setMe(null)); }, [path]);
  const home = me ? "/" + me.role : "/join";
  const link = (h: string, t: string) => <Link key={h} href={h} style={path === h ? { textDecoration: "underline", textUnderlineOffset: 6 } : undefined}>{t}</Link>;
  return (
    <nav>
      <div className="wrap">
        <Link href="/" style={{ margin: 0, fontWeight: 800, fontSize: 18 }}>Kamai · कमाई</Link>
        <div>
          {link("/", "Home")}
          {link("/problem", "The problem")}
          {me ? <>
            {link(home, "My app")}
            <a href="#" onClick={async e => { e.preventDefault(); await api("/api/auth/logout", {}); setMe(null); router.push("/"); }}>Log out ({me.name.split(" ")[0]})</a>
          </> : me === null && link("/join", "Log in / Sign up")}
        </div>
      </div>
    </nav>
  );
}
