
'use server';

/**
 * @fileOverview Este archivo define un Genkit flow para obtener recomendaciones de contenido basadas en un estado de ánimo.
 *
 * - getMoodRecommendations - Una función que toma un estado de ánimo y devuelve una lista de recomendaciones de contenido.
 * - GetMoodRecommendationsInput - El tipo de entrada para la función getMoodRecommendations.
 * - GetMoodRecommendationsOutput - El tipo de salida para la función getMoodRecommendations.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { ImproveRecommendationsOutput } from './improve-recommendations';

const GetMoodRecommendationsInputSchema = z.object({
  mood: z.string().describe('El estado de ánimo seleccionado por el usuario (ej. "Para reír", "Adrenalina pura").'),
});
export type GetMoodRecommendationsInput = z.infer<typeof GetMoodRecommendationsInputSchema>;

export type GetMoodRecommendationsOutput = ImproveRecommendationsOutput;


const RecommendationSchema = z.object({
  title: z.string().describe('Título del contenido recomendado'),
  year: z.string().describe('Año de lanzamiento'),
  genre: z.string().describe('Género del contenido'),
  platform: z.string().describe('Plataforma donde el contenido está disponible'),
  synopsis: z.string().describe('Resumen breve del contenido'),
  mainActors: z.array(z.string()).describe('Lista de actores principales en el contenido'),
  directLink: z.string().optional().describe('Enlace directo al contenido, si está disponible'),
  confidenceScore: z.number().describe('Un porcentaje de 0 a 100 que indica qué tan seguro estás de que al usuario le gustará esta recomendación.'),
  reviews: z.string().describe('Un resumen detallado de las críticas y reseñas del contenido, citando diferentes puntos de vista si es posible.'),
  director: z.string().describe('Director o directores del contenido.'),
  writer: z.string().describe('Escritor o escritores del contenido.'),
  ratings: z.string().describe('Puntuaciones de sitios de críticas populares (ej. "IMDb: 8.5, Rotten Tomatoes: 92%").'),
  contentType: z.string().describe('El tipo de contenido (película, serie o documental).'),
  language: z.string().describe('El idioma original del contenido.'),
  originCountry: z.string().describe('El país de origen del contenido.'),
  awards: z.string().optional().describe('Lista de premios importantes ganados por el contenido (ej. "Oscar a Mejor Película, Globo de Oro a Mejor Actriz").'),
  contentRating: z.string().optional().describe('Clasificación por edades del contenido (ej. "PG-13", "TV-MA").'),
  trailerUrl: z.string().optional().describe('URL de un trailer oficial en YouTube o similar.'),
  seasons: z.string().optional().describe('Número de temporadas, si es una serie (ej. "3 Temporadas").'),
});

const GetMoodRecommendationsOutputSchema = z.array(RecommendationSchema).length(6).describe('Un array de exactamente 6 recomendaciones de contenido.');


export async function getMoodRecommendations(input: GetMoodRecommendationsInput): Promise<GetMoodRecommendationsOutput> {
  return getMoodRecommendationsFlow(input);
}


const getMoodRecommendationsPrompt = ai.definePrompt({
  name: 'getMoodRecommendationsPrompt',
  input: {schema: GetMoodRecommendationsInputSchema},
  output: {schema: GetMoodRecommendationsOutputSchema},
  prompt: `Eres un asistente de IA experto en cine y series, y tu tarea es recomendar contenido basado en el estado de ánimo del usuario.
  
  IMPORTANTE: Toda la salida de texto, incluyendo sinopsis, críticas, nombres de género, etc., DEBE estar completamente en español.

  El estado de ánimo del usuario es: "{{mood}}".

  Genera 6 recomendaciones de películas, series o documentales que se ajusten perfectamente a este estado de ánimo.
  Para cada recomendación, proporciona toda la información solicitada en el esquema de salida.
  - Varía las plataformas (Netflix, Disney+, HBO, etc.) en las recomendaciones.
  - Asegúrate de que las recomendaciones sean variadas y de alta calidad.

  Formatea tu salida como un array JSON de 6 recomendaciones.
  `, 
});


const getMoodRecommendationsFlow = ai.defineFlow(
  {
    name: 'getMoodRecommendationsFlow',
    inputSchema: GetMoodRecommendationsInputSchema,
    outputSchema: GetMoodRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await getMoodRecommendationsPrompt(input);
    return output!;
  }
);
