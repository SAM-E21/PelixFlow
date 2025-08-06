
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Laugh, BrainCircuit, Rocket, Heart, Ghost, Drama, Wand2, Loader2, Bot } from "lucide-react";
import { getMoodRecommendations, type GetMoodRecommendationsOutput } from "@/ai/flows/get-mood-recommendations";
import { toast } from "@/hooks/use-toast";
import { RecommendationCard } from "@/components/recommendation-card";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const moods = [
  { name: "Para reír", icon: Laugh },
  { name: "Para pensar", icon: BrainCircuit },
  { name: "Relajante", icon: Sparkles },
  { name: "Adrenalina pura", icon: Rocket },
  { name: "Romance", icon: Heart },
  { name: "Drama", icon: Drama },
  { name: "Terror", icon: Ghost },
];

export default function ExplorePage() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<GetMoodRecommendationsOutput>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleMoodClick = async (moodName: string) => {
    setSelectedMood(moodName);
    setIsLoading(true);
    setRecommendations([]);
    try {
      const results = await getMoodRecommendations({ mood: moodName });
       if (results && results.length > 0) {
        setRecommendations(results);
      } else {
        toast({
          title: "No se encontraron recomendaciones",
          description: `No pudimos encontrar nada para el estado de ánimo "${moodName}". Intenta de nuevo.`,
        });
      }
    } catch (error) {
      console.error("Error al obtener recomendaciones por ánimo:", error);
      toast({
        variant: "destructive",
        title: "Error en la búsqueda",
        description: "Hubo un problema al conectar con la IA. Inténtalo de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Explorar por estado de ánimo</h1>
        <p className="text-muted-foreground">Encuentra algo para ver según cómo te sientes hoy.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {moods.map((mood) => (
          <Button 
            key={mood.name} 
            variant="outline" 
            className={cn(
              "h-32 text-lg flex flex-col gap-2 hover:bg-primary/10 hover:border-primary transition-all duration-300",
              selectedMood === mood.name && "bg-primary/10 border-primary"
            )}
            onClick={() => handleMoodClick(mood.name)}
            disabled={isLoading}
          >
            {isLoading && selectedMood === mood.name ? (
              <Loader2 className="h-10 w-10 animate-spin" />
            ) : (
              <mood.icon className="h-10 w-10 text-primary/80" />
            )}
            <span>{mood.name}</span>
          </Button>
        ))}
      </div>
      
      <section>
        {isLoading ? (
            <div className="text-center p-8">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Buscando recomendaciones para sentirte &quot;{selectedMood}&quot;...</p>
            </div>
        ) : recommendations.length > 0 ? (
            <>
                <h2 className="text-2xl font-bold font-headline mb-4">Sugerencias &quot;{selectedMood}&quot;</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                    {recommendations.map((rec, index) => (
                        <RecommendationCard key={`${rec.title}-${index}`} recommendation={rec} />
                    ))}
                </div>
                 <div className="text-center mt-8">
                    <Button size="lg" onClick={() => selectedMood && handleMoodClick(selectedMood)} disabled={isLoading}>
                        <Wand2 className="mr-2 h-5 w-5" />
                        Sugerir de nuevo
                    </Button>
                </div>
            </>
        ) : (
            <Card className="flex items-center justify-center h-80 border-dashed mt-8">
                <CardContent className="text-center p-6">
                <Bot className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-semibold font-headline">Selecciona un estado de ánimo</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Las recomendaciones para el ánimo que elijas aparecerán aquí.
                </p>
                </CardContent>
            </Card>
        )}
      </section>
    </div>
  );
}
