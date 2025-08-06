"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";
import { useRecommendationContext } from "@/hooks/use-recommendation-context";
import { RecommendationCard } from "@/components/recommendation-card";

export default function FavoritesPage() {
  const { favorites } = useRecommendationContext();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">Favoritos</h1>
        <p className="text-muted-foreground">Tu contenido guardado para ver más tarde.</p>
      </header>
      
      {favorites.length === 0 ? (
        <Card className="flex items-center justify-center h-96 border-dashed">
          <CardContent className="text-center p-6">
            <Star className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="mt-4 text-xl font-semibold font-headline">Nada por aquí</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Aún no has agregado nada a favoritos.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((rec, index) => (
            <RecommendationCard key={`${rec.title}-${index}`} recommendation={rec} />
          ))}
        </div>
      )}
    </div>
  );
}
