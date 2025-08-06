
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Star, Clapperboard, Clock, Search, Wand2, User, MessageSquare, List, Palette } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { name: "Mis recomendaciones", href: "/dashboard", icon: Home },
  { name: "Favoritos", href: "/dashboard/favorites", icon: Star },
  { name: "Buscar", href: "/dashboard/search", icon: Search },
  { name: "Explorar", href: "/dashboard/explore", icon: Clapperboard },
  { name: "Chat", href: "/dashboard/chat", icon: MessageSquare },
  { name: "Mis Listas", href: "/dashboard/lists", icon: List },
  { name: "Historial", href: "/dashboard/history", icon: Clock },
  { name: "Preferencias", href: "/dashboard/preferences", icon: Wand2 },
  { name: "Perfil", href: "/dashboard/profile", icon: User },
  { name: "Colores", href: "/dashboard/colors", icon: Palette },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4 gap-1">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted",
            pathname === link.href || (link.href !== "/dashboard" && pathname.startsWith(link.href)) ? "bg-primary/10 text-primary" : ""
          )}
        >
          <link.icon className="h-4 w-4" />
          {link.name}
        </Link>
      ))}
    </nav>
  );
}
