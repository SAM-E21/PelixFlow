
"use client";

import Link from "next/link";
import { Menu, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DashboardNav } from "@/components/dashboard-nav";
import { UserNav } from "@/components/user-nav";
import { RecommendationProvider } from "@/hooks/use-recommendation-context";
import { ChatProvider } from "@/hooks/use-chat-context";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { auth } from "@/lib/firebase";
import { Logo } from "@/components/logo";


function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);
  
  useEffect(() => {
    // On mount, set the theme from localStorage
    const savedTheme = localStorage.getItem("app-theme") || "theme-glow-pop";
    document.body.className = savedTheme;
  }, []);

  if (loading || !user) {
    return (
       <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
            <p>Cargando...</p>
        </div>
      </div>
    )
  }

  const handleLogout = async () => {
    await auth.signOut();
    router.push('/');
  }

  return (
    <RecommendationProvider>
      <ChatProvider>
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
          <div className="hidden border-r bg-card md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
              <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 font-semibold font-headline"
                >
                  <Logo className="h-8 w-auto"/>
                </Link>
              </div>
              <div className="flex-1 py-4">
                <DashboardNav />
              </div>
              <div className="mt-auto p-4">
                 <Button size="sm" className="w-full" variant="outline" onClick={handleLogout}>
                   <LogOut className="mr-2 h-4 w-4" />
                   Cerrar Sesión
                 </Button>
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0 md:hidden"
                  >
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle navigation menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col">
                  <nav className="grid gap-2 text-lg font-medium">
                    <Link
                      href="/dashboard"
                      className="flex items-center gap-2 text-lg font-semibold mb-4"
                    >
                      <Logo className="h-8 w-auto"/>
                    </Link>
                    <DashboardNav />
                  </nav>
                  <div className="mt-auto">
                    <Button size="sm" className="w-full" variant="outline" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Cerrar Sesión
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              <div className="w-full flex-1">
                {/* Future search bar can go here */}
              </div>
              <UserNav />
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
            </main>
          </div>
        </div>
      </ChatProvider>
    </RecommendationProvider>
  )
}


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // We wrap the content in AuthProvider but it's not available in the RootLayout
  // So we move it to RootLayout to make it available everywhere.
  return (
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
  );
}
