
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search as SearchIcon, Bot, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { searchContent, type SearchContentOutput } from "@/ai/flows/search-content";
import { RecommendationCard } from "@/components/recommendation-card";
import { toast } from "@/hooks/use-toast";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [searchType, setSearchType] = useState<"title" | "actor">("title");
  const [results, setResults] = useState<SearchContentOutput>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!query) {
      toast({
        variant: "destructive",
        title: "El campo de búsqueda está vacío.",
        description: "Por favor, escribe algo para buscar.",
      });
      return;
    }
    setIsLoading(true);
    setResults([]);
    try {
      const searchResults = await searchContent({ query, searchType });
      if (searchResults && searchResults.length > 0) {
        setResults(searchResults);
      } else {
        toast({
          title: "No se encontraron resultados",
          description: `No pudimos encontrar nada para "${query}". Intenta con otra búsqueda.`,
        });
      }
    } catch (error) {
      console.error("Error al buscar contenido:", error);
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
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline">Búsqueda Avanzada</h1>
        <p className="text-muted-foreground">Encuentra contenido específico por título o actor.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Realizar una búsqueda</CardTitle>
          <CardDescription>
            Escribe lo que buscas y selecciona si quieres buscar por título o por actor.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-w-lg space-y-4">
            <div className="flex gap-4">
              <Input 
                placeholder="Ej: La Casa de Papel..." 
                className="flex-grow"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
              <Button onClick={handleSearch} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <SearchIcon className="mr-2 h-4 w-4" />
                )}
                Buscar
              </Button>
            </div>
            <RadioGroup 
              value={searchType}
              onValueChange={(value: "title" | "actor") => setSearchType(value)}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="title" id="title" />
                <Label htmlFor="title">Por Título</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="actor" id="actor" />
                <Label htmlFor="actor">Por Actor</Label>
              </div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>
      
      <section>
        {isLoading ? (
          <div className="text-center p-8">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-4 text-muted-foreground">Buscando...</p>
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((rec, index) => (
              <RecommendationCard key={`${rec.title}-${index}`} recommendation={rec} />
            ))}
          </div>
        ) : (
           !isLoading && query && (
             <Card className="flex items-center justify-center h-96 border-dashed mt-8">
                <CardContent className="text-center p-6">
                <Bot className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-xl font-semibold font-headline">Inicia una búsqueda</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    Los resultados de tu búsqueda aparecerán aquí.
                </p>
                </CardContent>
            </Card>
           )
        )}
      </section>
    </div>
  );
}
