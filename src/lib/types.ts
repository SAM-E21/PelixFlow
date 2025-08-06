import { z } from "zod";

export const preferenceFormSchema = z.object({
  contentType: z.string({
    required_error: "Debes seleccionar un tipo de contenido.",
  }),
  platforms: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Debes seleccionar al menos una plataforma.",
  }),
  genres: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "Debes seleccionar al menos un género.",
  }),
  duration: z.string({
    required_error: "Debes seleccionar una duración.",
  }),
  yearRange: z.string({
    required_error: "Debes seleccionar un rango de años.",
  }),
  episodes: z.string().optional(),
  originCountry: z.string({
    required_error: "Debes seleccionar un país de origen.",
  }),
  language: z.string({
    required_error: "Debes seleccionar un idioma.",
  }),
  subtitles: z.boolean().default(false),
  dubbing: z.boolean().default(false),
  contentThemes: z.array(z.string()).optional(),
  similarContent: z.string().optional(),
});

export type PreferenceFormValues = z.infer<typeof preferenceFormSchema>;
