
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { preferenceFormSchema, type PreferenceFormValues } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Wand2 } from "lucide-react";
import { useRecommendationContext } from "@/hooks/use-recommendation-context";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";


const platforms = [
  { id: "netflix", label: "Netflix" },
  { id: "disney+", label: "Disney+" },
  { id: "hbo", label: "HBO Max" },
  { id: "prime", label: "Amazon Prime Video" },
  { id: "apple", label: "Apple TV+" },
  { id: "hulu", label: "Hulu" },
  { id: "vix", label: "Vix" },
  { id: "roku", label: "Roku Channel" },
  { id: "crunchyroll", label: "Crunchyroll" },
  { id: "other", label: "Otro" },
];

const genres = [
  { id: "action", label: "Acción" },
  { id: "adventure", label: "Aventura" },
  { id: "comedy", label: "Comedia" },
  { id: "drama", label: "Drama" },
  { id: "fantasy", label: "Fantasía" },
  { id: "horror", label: "Terror" },
  { id: "romance", label: "Romance" },
  { id: "sci-fi", label: "Ciencia Ficción" },
  { id: "thriller", label: "Thriller" },
  { id: "crime", label: "Crimen" },
  { id: "animation", label: "Animación" },
  { id: "musical", label: "Musical" },
  { id: "family", label: "Familiar" },
  { id: "mystery", label: "Misterio" },
];

const themes = [
    { id: "happy-endings", label: "Finales felices" },
    { id: "sad-endings", label: "Finales tristes" },
    {id: "not-sad-endings", label: "Sin finales tristes" },
    { id: "feel-good", label: "Para sentirse bien" },
    { id: "mind-bending", label: "Tramas complejas que te volarán la cabeza" },
    { id: "social-critique", label: "Crítica social" },
    { id: "personal-growth", label: "Superación personal" },
    { id: "dystopian-future", label: "Futuros distópicos" },
    { id: "based-on-book", label: "Basada en un libro" },
    { id: "ensemble-cast", label: "Elenco coral" },
    { id: "dark-humor", label: "Humor negro" },
    { id: "award-winning", label: "Premiadas" },
    { id: "real-events", label: "Basadas en hechos reales" },
    { id: "technology", label: "Tecnología" },
    { id: "science", label: "Ciencia" },
];

const countries = [
    {id: "any", label: "Cualquiera"},
    {id: "us", label: "Estados Unidos"},
    {id: "uk", label: "Reino Unido"},
    {id: "spain", label: "España"},
    {id: "mexico", label: "México"},
    {id: "argentina", label: "Argentina"},
    {id: "colombia", label: "Colombia"},
    {id: "france", label: "Francia"},
    {id: "germany", label: "Alemania"},
    {id: "italy", label: "Italia"},
    {id: "japan", label: "Japón"},
    {id: "south-korea", label: "Corea del Sur"},
    {id: "canada", label: "Canadá"},
    {id: "australia", label: "Australia"},
    {id: "india", label: "India"},
];

const languages = [
    {id: "any", label: "Cualquiera"},
    {id: "es", label: "Español"},
    {id: "en", label: "Inglés"},
    {id: "jp", label: "Japonés"},
    {id: "ko", label: "Coreano"},
    {id: "fr", label: "Francés"},
    {id: "de", label: "Alemán"},
    {id: "it", label: "Italiano"},
    {id: "pt", label: "Portugués"},
];

const yearRanges = [
    { id: "any", label: "Cualquier año" },
    { id: "2020-2024", label: "Recientes (2020-2024)" },
    { id: "2010-2019", label: "Década de 2010" },
    { id: "2000-2009", label: "Década de 2000" },
    { id: "1990-1999", label: "Década de los 90" },
    { id: "before-1990", label: "Clásicos (antes de 1990)" },
];

const defaultFormValues: PreferenceFormValues = {
    contentType: "movie",
    platforms: ["netflix"],
    genres: ["comedy"],
    duration: "medium",
    yearRange: "any",
    episodes: "short",
    originCountry: "any",
    language: "es",
    subtitles: false,
    dubbing: true,
    contentThemes: [],
    similarContent: "",
};


export default function PreferencesPage() {
  const router = useRouter();
  const { getNewRecommendations, isLoading } = useRecommendationContext();
  const { userData } = useAuth();
  
  const form = useForm<PreferenceFormValues>({
    resolver: zodResolver(preferenceFormSchema),
    defaultValues: userData?.preferences || defaultFormValues,
  });

  useEffect(() => {
      if (userData?.preferences) {
          form.reset(userData.preferences);
      }
  }, [userData, form]);

  const contentType = form.watch("contentType");

  async function onSubmit(data: PreferenceFormValues) {
    if (data.contentType !== 'series') {
      delete data.episodes;
    }

    await getNewRecommendations(data);
    toast({
      title: "¡Nuevas recomendaciones listas!",
      description: "Hemos encontrado nuevo contenido para ti.",
    });
    router.push('/dashboard');
  }

  return (
    <div className="space-y-6">
       <header>
        <h1 className="text-3xl font-bold font-headline">Ajustar Preferencias</h1>
        <p className="text-muted-foreground">
          Usa la IA para mejorar tus recomendaciones. Cuéntanos qué te gusta.
        </p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Bot className="h-6 w-6"/>
            Tu Perfil de Gustos
          </CardTitle>
          <CardDescription>
            Completa este formulario para que podamos entender qué te encanta ver.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

                {/* Columna 1 */}
                <div className="space-y-8">
                   <FormField
                    control={form.control}
                    name="contentType"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base font-headline">Tipo de Contenido</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl><RadioGroupItem value="movie" /></FormControl>
                              <FormLabel className="font-normal">Película</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl><RadioGroupItem value="series" /></FormControl>
                              <FormLabel className="font-normal">Serie</FormLabel>
                            </FormItem>
                             <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl><RadioGroupItem value="documentary" /></FormControl>
                              <FormLabel className="font-normal">Documental</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="platforms"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-base font-headline">Plataformas</FormLabel>
                        <FormDescription>¿Dónde buscas contenido?</FormDescription>
                        <div className="max-h-60 overflow-y-auto pr-4">
                        {platforms.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="platforms"
                            render={({ field }) => {
                              return (
                                <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0 mt-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), item.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{item.label}</FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* Columna 2 */}
                <div className="space-y-8">
                  <FormField
                    control={form.control}
                    name="genres"
                    render={() => (
                      <FormItem>
                         <FormLabel className="text-base font-headline">Géneros</FormLabel>
                        <FormDescription>¿Qué géneros prefieres?</FormDescription>
                        <div className="max-h-60 overflow-y-auto pr-4">
                          {genres.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="genres"
                              render={({ field }) => {
                                return (
                                  <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0 mt-2">
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...(field.value || []), item.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== item.id
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">{item.label}</FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contentThemes"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-base font-headline">Temas de contenido</FormLabel>
                        <FormDescription>¿Qué tipo de historias te gustan?</FormDescription>
                        <div className="max-h-60 overflow-y-auto pr-4">
                        {themes.map((item) => (
                          <FormField
                            key={item.id}
                            control={form.control}
                            name="contentThemes"
                            render={({ field }) => {
                              return (
                                <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0 mt-2">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...(field.value || []), item.id])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item.id
                                              )
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">{item.label}</FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Columna 3 */}
                <div className="space-y-8">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem className="space-y-3">
                        <FormLabel className="text-base font-headline">Duración</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl><RadioGroupItem value="short" /></FormControl>
                              <FormLabel className="font-normal">Corta</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl><RadioGroupItem value="medium" /></FormControl>
                              <FormLabel className="font-normal">Media</FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl><RadioGroupItem value="long" /></FormControl>
                              <FormLabel className="font-normal">Larga</FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormDescription>
                          Películas: &lt;90min, 90-120min, &gt;120min. <br />
                          Episodios: &lt;30min, 30-60min, &gt;60min.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="yearRange"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-headline">Año de Lanzamiento</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un rango de años" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {yearRanges.map(range => <SelectItem key={range.id} value={range.id}>{range.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {contentType === 'series' && (
                    <FormField
                      control={form.control}
                      name="episodes"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-base font-headline">Episodios por Temporada</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="short" /></FormControl><FormLabel className="font-normal">Pocos (1-10)</FormLabel></FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="medium" /></FormControl><FormLabel className="font-normal">Estándar (10-20)</FormLabel></FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="long" /></FormControl><FormLabel className="font-normal">Muchos (20+)</FormLabel></FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="originCountry"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-headline">País de Origen</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un país" /></SelectTrigger></FormControl>
                          <SelectContent>
                            {countries.map(country => <SelectItem key={country.id} value={country.id}>{country.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-headline">Idioma Original</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger><SelectValue placeholder="Selecciona un idioma" /></SelectTrigger></FormControl>
                          <SelectContent>
                             {languages.map(lang => <SelectItem key={lang.id} value={lang.id}>{lang.label}</SelectItem>)}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex items-center space-x-4">
                    <FormField
                      control={form.control}
                      name="subtitles"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 flex-1">
                          <FormLabel className="font-normal">¿Subtítulos?</FormLabel>
                          <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                      )}
                    />
                     <FormField
                      control={form.control}
                      name="dubbing"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 flex-1">
                          <FormLabel className="font-normal">¿Doblaje?</FormLabel>
                          <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="similarContent"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-headline">Recomendar similar a...</FormLabel>
                        <FormDescription>
                          ¿Te encantó una película o serie? Dinos cuál y buscaremos joyas parecidas.
                        </FormDescription>
                        <FormControl>
                          <Input placeholder="Ej: Stranger Things" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                    />

                </div>
              </div>

              <Button type="submit" size="lg" disabled={isLoading}>
                <Wand2 className="mr-2 h-4 w-4" />
                {isLoading ? 'Buscando...' : 'Guardar y Mejorar Recomendaciones'}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
