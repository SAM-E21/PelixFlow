
"use client";

import { RecommendationCard } from "@/components/recommendation-card";
import { useRecommendationContext } from "@/hooks/use-recommendation-context";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ListDetailPage() {
  const { listId } = useParams();
  const { lists } = useRecommendationContext();
  const router = useRouter();
  
  const list = lists.find((l) => l.id === listId);

  if (!list) {
    return (
      <div className="text-center">
        <p>Cargando lista o no encontrada...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
         <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4"/> Volver a las listas
         </Button>
        <h1 className="text-3xl font-bold font-headline">{list.name}</h1>
        <p className="text-muted-foreground">
          {list.items.length} {list.items.length === 1 ? "elemento" : "elementos"} en esta lista.
        </p>
      </header>

       {list.items.length === 0 ? (
        <Card className="flex items-center justify-center h-96 border-dashed">
          <CardContent className="text-center p-6">
            <h2 className="mt-4 text-xl font-semibold font-headline">Esta lista está vacía</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Añade contenido a esta lista desde la página de detalles de cualquier película o serie.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {list.items.map((rec, index) => (
            <RecommendationCard key={`${rec.title}-${index}`} recommendation={rec} listId={list.id}/>
          ))}
        </div>
      )}
    </div>
  );
}
