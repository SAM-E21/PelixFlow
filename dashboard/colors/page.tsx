"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const themes = [
  {
    name: "Glow Pop",
    id: "theme-glow-pop",
    colors: ["#FF5DA2", "#FFB26B", "#64C8FF", "#FFE86C", "#FF3C38"],
  },
  {
    name: "Neón",
    id: "theme-neon",
    colors: ["#FF914D", "#A259FF", "#A7FF57", "#3BF4FB", "#FF4F79"],
  },
  {
    name: "Cyber Blue",
    id: "theme-cyber-blue",
    colors: ["#3B82F6", "#FFFFFF", "#F3F4F6", "#6B7280"],
  },
  {
    name: "Clásico",
    id: "theme-classic",
    colors: ["#C27933", "#7D3F0F", "#99521C", "#74330B"],
  },
];

export default function ColorsPage() {
  const [activeTheme, setActiveTheme] = useState("");

  useEffect(() => {
    const savedTheme = localStorage.getItem("app-theme") || "theme-glow-pop";
    setActiveTheme(savedTheme);
    document.body.className = savedTheme;
  }, []);

  const handleThemeChange = (themeId: string) => {
    setActiveTheme(themeId);
    document.body.className = themeId;
    localStorage.setItem("app-theme", themeId);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">Selector de Temas</h1>
        <p className="text-muted-foreground">
          Elige una paleta de colores para la aplicación. (Función de prueba)
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {themes.map((theme) => (
          <Card
            key={theme.id}
            className={cn(
              "cursor-pointer transition-all hover:shadow-lg",
              activeTheme === theme.id && "ring-2 ring-primary"
            )}
            onClick={() => handleThemeChange(theme.id)}
          >
            <CardHeader>
              <CardTitle className="font-headline flex items-center justify-between">
                <span>{theme.name}</span>
                {activeTheme === theme.id && <Check className="h-5 w-5 text-primary" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                {theme.colors.map((color) => (
                  <div
                    key={color}
                    className="h-16 w-full rounded-md border"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
