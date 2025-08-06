
"use client";

import { RecommendationCard } from "@/components/recommendation-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, Wand2 } from "lucide-react";
import Link from 'next/link';
import { useRecommendationContext } from "@/hooks/use-recommendation-context";

export default function DashboardPage() {
  const { recommendations, isLoading } = useRecommendationContext();

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold font-headline tracking-tight">Bienvenido a PelixFlow</h1>
        <p className="text-muted-foreground">Sugerencias curadas para ti basadas en tus gustos.</p>
      </div>

      <section>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold font-headline">Tus Recomendaciones</h2>
          <Button asChild>
            <Link href="/dashboard/preferences">
              <Wand2 className="mr-2 h-4 w-4" />
              Obtener Recomendaciones
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <p>Buscando recomendaciones...</p>
        ) : recommendations.length === 0 ? (
          <Card className="flex items-center justify-center h-96 border-dashed">
            <CardContent className="text-center p-6">
              <Bot className="mx-auto h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-semibold font-headline">Aún no hay recomendaciones</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Haz clic en &quot;Obtener Recomendaciones&quot; para empezar.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recommendations.map((rec, index) => (
              <RecommendationCard key={`${rec.title}-${index}`} recommendation={rec} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
