
'use server';

/**
 * @fileOverview Este archivo define un Genkit flow para el ajuste de preferencias asistido por IA.
 *
 * El flow analiza las respuestas del usuario de un formulario de preferencias y sugiere refinamientos
 * para asegurar que los usuarios no se pierdan contenido que les podría gustar.
 *
 * @exported adjustPreferences - La función principal para activar el flow de ajuste de preferencias.
 * @exported AdjustPreferencesInput - El tipo de entrada para la función adjustPreferences.
 * @exported AdjustPreferencesOutput - El tipo de salida para la función adjustPreferences.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define el esquema de entrada para el formulario de preferencias
const AdjustPreferencesInputSchema = z.object({
  platforms: z.array(z.string()).describe('Lista de plataformas de streaming que el usuario prefiere (ej., Netflix, Disney+, HBO).'),
  genres: z.array(z.string()).describe('Lista de géneros preferidos (ej., comedia, romance, acción).'),
  duration: z.string().describe('Duración deseada de episodios o películas.'),
  language: z.string().describe('Idioma preferido (ej., español, inglés, japonés).'),
  subtitles: z.boolean().describe('Si el usuario prefiere subtítulos.'),
  dubbing: z.boolean().describe('Si el usuario prefiere doblaje.'),
  contentThemes: z.array(z.string()).describe('Lista de temas de contenido preferidos (ej., finales felices, humor, sin escenas tristes).'),
  similarContent: z.string().describe('Título de una película o serie que le gustó al usuario, para recomendaciones de similitud.'),
});

export type AdjustPreferencesInput = z.infer<typeof AdjustPreferencesInputSchema>;

// Define el esquema de salida para los ajustes de preferencias sugeridos
const AdjustPreferencesOutputSchema = z.object({
  refinedPlatforms: z.array(z.string()).describe('Plataformas sugeridas basadas en las preferencias del usuario.'),
  refinedGenres: z.array(z.string()).describe('Géneros sugeridos para explorar basados en las preferencias iniciales.'),
  refinedDuration: z.string().describe('Ajustes de duración sugeridos basados en la preferencia.'),
  refinedLanguage: z.string().describe('Opciones de idioma sugeridas basadas en la preferencia.'),
  refinedSubtitles: z.boolean().describe('Sugerencia para habilitar o deshabilitar subtítulos según el contenido.'),
  refinedDubbing: z.boolean().describe('Sugerencia para habilitar o deshabilitar el doblaje según el contenido.'),
  refinedContentThemes: z.array(z.string()).describe('Temas de contenido sugeridos que se alinean con los gustos del usuario.'),
});

export type AdjustPreferencesOutput = z.infer<typeof AdjustPreferencesOutputSchema>;

// Define la función principal que llama al flow
export async function adjustPreferences(input: AdjustPreferencesInput): Promise<AdjustPreferencesOutput> {
  return aiAssistedPreferenceAdjustmentFlow(input);
}

// Define el prompt para el ajuste de preferencias asistido por IA
const adjustPreferencesPrompt = ai.definePrompt({
  name: 'adjustPreferencesPrompt',
  input: {schema: AdjustPreferencesInputSchema},
  output: {schema: AdjustPreferencesOutputSchema},
  prompt: `Analiza las preferencias del usuario a continuación y sugiere refinamientos para ayudarle a descubrir más contenido que podría disfrutar.

Considera expandir sus horizontes sugiriendo géneros, plataformas o temas de contenido relacionados que se alineen con sus gustos declarados.
Explica cada sugerencia.

Preferencias del Usuario:
Plataformas: {{platforms}}
Géneros: {{genres}}
Duración: {{duration}}
Idioma: {{language}}
Subtítulos: {{subtitles}}
Doblaje: {{dubbing}}
Temas de Contenido: {{contentThemes}}
Contenido Similar: {{similarContent}}

Preferencias Refinadas:
Plataformas Refinadas: 
Géneros Refinados:
Duración Refinada:
Idioma Refinado:
Subtítulos Refinados:
Doblaje Refinado:
Temas de Contenido Refinados:`,  
});

// Define el Genkit flow para el ajuste de preferencias asistido por IA
const aiAssistedPreferenceAdjustmentFlow = ai.defineFlow(
  {
    name: 'aiAssistedPreferenceAdjustmentFlow',
    inputSchema: AdjustPreferencesInputSchema,
    outputSchema: AdjustPreferencesOutputSchema,
  },
  async input => {
    const {output} = await adjustPreferencesPrompt(input);
    return output!;
  }
);
