
'use server';

/**
 * @fileOverview Este archivo define un Genkit flow para chatear con una IA experta en cine.
 *
 * - chatWithAi - La función principal para interactuar con la IA del chat.
 * - ChatWithAiInput - El tipo de entrada para la función chatWithAi.
 * - ChatWithAiOutput - El tipo de salida para la función chatWithAi.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatWithAiInputSchema = z.object({
  history: z.array(z.object({
    from: z.enum(['user', 'bot']),
    text: z.string(),
  })).describe('El historial de la conversación actual.'),
  userInput: z.string().describe('El último mensaje enviado por el usuario.'),
  persona: z.enum(['experto', 'fan']).describe('La personalidad que la IA debe adoptar: "experto" para un análisis crítico y técnico, "fan" para un tono más entusiasta y personal.'),
  contentTitle: z.string().optional().describe('El título de una película, serie o documental específico que es el tema principal de la conversación, si lo hay.'),
});
export type ChatWithAiInput = z.infer<typeof ChatWithAiInputSchema>;


const ChatWithAiOutputSchema = z.object({
    response: z.string().describe('La respuesta de la IA al usuario, siguiendo la personalidad y el contexto dados.'),
});
export type ChatWithAiOutput = z.infer<typeof ChatWithAiOutputSchema>;

export async function chatWithAi(input: ChatWithAiInput): Promise<ChatWithAiOutput> {
  return chatWithAiFlow(input);
}


const chatWithAiPrompt = ai.definePrompt({
  name: 'chatWithAiPrompt',
  input: {schema: z.any()},
  output: {schema: ChatWithAiOutputSchema},
  prompt: `{{systemPrompt}}

  {{#if contentTitle}}
  El usuario quiere hablar específicamente sobre: **{{contentTitle}}**. Enfoca tu conocimiento y respuestas en este título.
  {{/if}}

  A continuación se presenta el historial de la conversación. Responde al último mensaje del usuario de manera coherente y natural, manteniendo la personalidad seleccionada.

  Historial:
  {{{formattedHistory}}}

  Usuario: {{{userInput}}}

  Respuesta de la IA:
  `,
});


const chatWithAiFlow = ai.defineFlow(
  {
    name: 'chatWithAiFlow',
    inputSchema: ChatWithAiInputSchema,
    outputSchema: ChatWithAiOutputSchema,
  },
  async (input) => {
    let systemPrompt = `Eres un asistente de IA especializado en cine y series. Tu tarea es conversar con un usuario sobre este tema.
  
  IMPORTANTE: Toda la salida de texto DEBE estar completamente en español.`;

    if (input.persona === 'experto') {
      systemPrompt += `\nAdopta la siguiente personalidad:\n**Personalidad de Experto:** Habla con un tono analítico, crítico y bien informado. Cita datos técnicos, de producción, cinematografía, contexto histórico y analiza temas profundos. Sé objetivo y formal.`;
    } else if (input.persona === 'fan') {
      systemPrompt += `\nAdopta la siguiente personalidad:\n**Personalidad de Fan:** Habla con un tono entusiasta, emocional y personal. Comparte tus momentos favoritos, teorías y lo que te hizo sentir el contenido. Sé subjetivo y cercano.`;
    }

    const formattedHistory = input.history.map(msg => 
        `${msg.from === 'user' ? 'Usuario' : 'IA'}: ${msg.text}`
    ).join('\n');


    const {output} = await chatWithAiPrompt({
      ...input,
      systemPrompt,
      formattedHistory,
    });
    return output!;
  }
);
