
'use server';

/**
 * @fileOverview Este archivo define un Genkit flow para "fusionar" contenido y crear una recomendación única.
 *
 * - fuseContent - Una función que toma 2 o 3 títulos y genera una recomendación basada en su combinación.
 * - FuseContentInput - El tipo de entrada para la función fuseContent.
 * - FuseContentOutput - El tipo de salida para la función fuseContent.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FuseContentInputSchema = z.object({
  titles: z.array(z.string()).min(2).max(3).describe('Una lista de 2 o 3 títulos de películas o series para fusionar.'),
});
export type FuseContentInput = z.infer<typeof FuseContentInputSchema>;


const FuseContentOutputSchema = z.object({
    recommendation: z.string().describe('Un párrafo de recomendación que describe una película o serie ficticia que combina los elementos de los títulos de entrada. Debe ser creativo y sonar como una sinopsis real.'),
});
export type FuseContentOutput = z.infer<typeof FuseContentOutputSchema>;

export async function fuseContent(input: FuseContentInput): Promise<FuseContentOutput> {
  return fuseContentFlow(input);
}


const fuseContentPrompt = ai.definePrompt({
  name: 'fuseContentPrompt',
  input: {schema: FuseContentInputSchema},
  output: {schema: FuseContentOutputSchema},
  prompt: `Eres un guionista de Hollywood extremadamente creativo. Tu tarea es tomar los siguientes títulos de películas/series y crear una "fusión": una recomendación para una nueva película o serie ficticia que combine los mejores elementos de los títulos proporcionados.

  IMPORTANTE: Toda la salida de texto DEBE estar completamente en español.

  Títulos a fusionar:
  {{#each titles}}
  - {{{this}}}
  {{/each}}

  Analiza los géneros, temas, tonos y estilos de los títulos. Luego, escribe una sinopsis para una nueva película o serie que capture la esencia de todos ellos. Sé imaginativo y convincente.

  Por ejemplo, si los títulos son "The Matrix" y "Pride and Prejudice", podrías sugerir una historia sobre una joven en la Inglaterra de la Regencia que descubre que su realidad social es una simulación controlada por máquinas, y debe usar su ingenio tanto en el salón de baile como en el combate digital para liberar a la humanidad.

  Ahora, genera la fusión para los títulos proporcionados.
  `, 
});


const fuseContentFlow = ai.defineFlow(
  {
    name: 'fuseContentFlow',
    inputSchema: FuseContentInputSchema,
    outputSchema: FuseContentOutputSchema,
  },
  async input => {
    const {output} = await fuseContentPrompt(input);
    return output!;
  }
);
