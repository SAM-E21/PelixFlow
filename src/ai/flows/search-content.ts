
'use server';

/**
 * @fileOverview Este archivo define un Genkit flow para buscar contenido por título o actor.
 *
 * - searchContent - Una función que toma una consulta de búsqueda y un tipo de búsqueda, y devuelve una lista de contenido coincidente.
 * - SearchContentInput - El tipo de entrada para la función searchContent.
 * - SearchContentOutput - El tipo de salida para la función searchContent (usa el mismo esquema que las recomendaciones).
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { ImproveRecommendationsOutput } from './improve-recommendations';


const SearchContentInputSchema = z.object({
  query: z.string().describe('El título de la película/serie o el nombre del actor a buscar.'),
  searchType: z.enum(['title', 'actor']).describe("El tipo de búsqueda a realizar: 'title' para buscar por título, 'actor' para buscar por actor."),
});
export type SearchContentInput = z.infer<typeof SearchContentInputSchema>;

export type SearchContentOutput = ImproveRecommendationsOutput;

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

const SearchContentOutputSchema = z.array(RecommendationSchema).length(6).describe('Un array de hasta 6 resultados de búsqueda de contenido.');


export async function searchContent(input: SearchContentInput): Promise<SearchContentOutput> {
  return searchContentFlow(input);
}


const searchContentPrompt = ai.definePrompt({
  name: 'searchContentPrompt',
  input: {schema: SearchContentInputSchema},
  output: {schema: SearchContentOutputSchema},
  prompt: `Eres un motor de búsqueda de una base de datos de películas y series. Tu tarea es encontrar contenido basado en una consulta de usuario.
  
  IMPORTANTE: Toda la salida de texto, incluyendo sinopsis, críticas, nombres de género, etc., DEBE estar completamente en español.

  El usuario está buscando por {{searchType}}: "{{query}}".

  Encuentra hasta 6 películas, series o documentales que coincidan con la búsqueda.
  Para cada resultado, proporciona toda la información solicitada en el esquema de salida, incluyendo:
  - Título, año, género, plataforma.
  - Una sinopsis detallada.
  - Actores principales.
  - Puntuación de confianza (confidenceScore) de 0 a 100 indicando qué tan relevante es el resultado para la búsqueda.
  - Un resumen de críticas.
  - Director, escritor.
  - Puntuaciones de sitios de críticas.
  - Tipo de contenido, idioma, país de origen, premios, clasificación y un enlace al tráiler si es posible.

  Si no encuentras resultados, devuelve un array vacío.
  Formatea tu salida como un array JSON de hasta 6 resultados.
  `, 
});


const searchContentFlow = ai.defineFlow(
  {
    name: 'searchContentFlow',
    inputSchema: SearchContentInputSchema,
    outputSchema: SearchContentOutputSchema,
  },
  async input => {
    const {output} = await searchContentPrompt(input);
    return output!;
  }
);
