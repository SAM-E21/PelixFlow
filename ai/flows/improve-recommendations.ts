
'use server';

/**
 * @fileOverview Este archivo define un Genkit flow para mejorar las recomendaciones de contenido basadas en las preferencias del usuario y su historial de visualización.
 *
 * - improveRecommendations - Una función que toma las preferencias del usuario y el historial de visualización como entrada y devuelve recomendaciones de contenido mejoradas.
 * - ImproveRecommendationsInput - El tipo de entrada para la función improveRecommendations.
 * - ImproveRecommendationsOutput - El tipo de salida para la función improveRecommendations.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveRecommendationsInputSchema = z.object({
  contentType: z.string().describe('Tipo de contenido (ej. película, serie, documental)'),
  platformPreferences: z.array(z.string()).describe('Plataformas de contenido preferidas (ej. Netflix, Disney+)'),
  genrePreferences: z.array(z.string()).describe('Géneros de contenido preferidos (ej. comedia, acción)'),
  durationPreference: z.string().describe('Duración de contenido deseada (ej. corta, media, larga)'),
  yearRangePreference: z.string().optional().describe('Rango de años de lanzamiento preferido (ej. "2020-2024", "antes-2000", "despues-2015")'),
  episodesPreference: z.string().optional().describe('Si es una serie, el número deseado de episodios por temporada (ej. cortos, medios, largos)'),
  originCountryPreference: z.string().describe('País de origen preferido para el contenido (ej. ee.uu., reino unido, cualquiera)'),
  languagePreference: z.string().describe('Idioma preferido (ej. español, inglés)'),
  subtitlesPreference: z.boolean().describe('Si se desean subtítulos'),
  dubbingPreference: z.boolean().describe('Si se desea doblaje'),
  contentThemes: z.array(z.string()).describe('Temas de contenido deseados (ej. finales felices, humor, premiadas)'),
  viewingHistory: z.array(z.string()).describe('Títulos de contenido que el usuario ya ha visto'),
  similarContent: z.string().optional().describe('Una película o serie que le gustó al usuario, para obtener recomendaciones similares'),
  feedback: z.string().optional().describe('Feedback opcional del usuario sobre recomendaciones anteriores'),
});
export type ImproveRecommendationsInput = z.infer<typeof ImproveRecommendationsInputSchema>;

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

const ImproveRecommendationsOutputSchema = z.array(RecommendationSchema).length(6).describe('Un array de exactamente 6 recomendaciones de contenido.');
export type ImproveRecommendationsOutput = z.infer<typeof ImproveRecommendationsOutputSchema>;

export async function improveRecommendations(input: ImproveRecommendationsInput): Promise<ImproveRecommendationsOutput> {
  return improveRecommendationsFlow(input);
}

const improveRecommendationsPrompt = ai.definePrompt({
  name: 'improveRecommendationsPrompt',
  input: {schema: ImproveRecommendationsInputSchema},
  output: {schema: ImproveRecommendationsOutputSchema},
  prompt: `Eres un asistente de IA experto en cine y series, diseñado para proporcionar recomendaciones de contenido (películas, series, documentales) en ESPAÑOL, basadas en las preferencias del usuario y su historial de visualización.

  IMPORTANTE: Toda la salida de texto, incluyendo sinopsis, críticas, nombres de género, etc., DEBE estar completamente en español.

  Basándote en las preferencias proporcionadas por el usuario y su historial de visualización, analiza sus gustos y sugiere 6 recomendaciones de contenido que podrían disfrutar.
  Considera las siguientes preferencias:
  
  Tipo de Contenido: {{{contentType}}}
  Preferencias de Plataforma: {{#each platformPreferences}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Preferencias de Género: {{#each genrePreferences}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  Preferencia de Duración: {{{durationPreference}}}
  {{#if yearRangePreference}}
  Preferencia de Año: {{{yearRangePreference}}}
  {{/if}}
  {{#if episodesPreference}}
  Preferencia de Episodios por Temporada: {{{episodesPreference}}}
  {{/if}}
  País de Origen: {{{originCountryPreference}}}
  Preferencia de Idioma: {{{languagePreference}}}
  Preferencia de Subtítulos: {{#if subtitlesPreference}}Sí{{else}}No{{/if}}
  Preferencia de Doblaje: {{#if dubbingPreference}}Sí{{else}}No{{/if}}
  Temas de Contenido: {{#each contentThemes}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
  {{#if similarContent}}
  Similar a: {{{similarContent}}}
  {{/if}}

  Historial de Visualización: {{#each viewingHistory}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  {{#if feedback}}
  Feedback del Usuario sobre Recomendaciones Anteriores: {{{feedback}}}
  Ten en cuenta este feedback para refinar las recomendaciones.
  {{/if}}

  Proporciona una lista de 6 recomendaciones de contenido. Para cada recomendación, incluye toda la información solicitada en el esquema de salida.
  - Asegúrate de que la plataforma de la recomendación coincida con las 'platformPreferences' del usuario.
  - Asegúrate de que el año de lanzamiento de la recomendación se ajuste a la 'yearRangePreference' del usuario.
  - El título, año, género, y plataforma.
  - Una sinopsis detallada.
  - Los actores principales (elenco).
  - Un enlace directo al contenido si está disponible.
  - Una 'puntuación de confianza' (confidenceScore) de 0 a 100 indicando qué tan seguro estás de que al usuario le gustará.
  - Un resumen detallado de las críticas y reseñas ('reviews'), mencionando varios puntos de vista.
  - El director o directores.
  - El escritor o escritores.
  - Las puntuaciones ('ratings') de sitios de críticas populares (ej. "IMDb: 8.5/10, Rotten Tomatoes: 92%").
  - El tipo de contenido ('contentType') que coincide con la preferencia del usuario.
  - El idioma original del contenido.
  - El país de origen del contenido.
  - Una lista de premios importantes ganados ('awards').
  - La clasificación por edades ('contentRating').
  - Un enlace a un trailer oficial ('trailerUrl').
  - El número de temporadas si es una serie ('seasons').

  Formatea tu salida como un array JSON de 6 recomendaciones de contenido.
  `, 
});

const improveRecommendationsFlow = ai.defineFlow(
  {
    name: 'improveRecommendationsFlow',
    inputSchema: ImproveRecommendationsInputSchema,
    outputSchema: ImproveRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await improveRecommendationsPrompt(input);
    return output!;
  }
);
