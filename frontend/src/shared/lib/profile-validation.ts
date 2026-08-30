import { z } from 'zod';

const forbiddenName =
  /(еблан|дебил|идиот|мудак|пидор|пидр|хуй|хуе|бля|сука|сучка|шлюха|мразь|гандон|гондон|чмо|уеб|уёб)/i;

export const nameSchema = z.object({
  fullName: z.string().trim().min(1, 'Введите имя.')
    .max(100, 'Имя не должно превышать 100 символов.')
    .refine((value) => !forbiddenName.test(value), 'Введите корректное имя.'),
});

export const emailSchema = z.object({
  email: z.string().trim().min(1, 'Введите email.')
    .email('Введите корректный email.')
    .transform((value) => value.toLowerCase()),
});

export type NameFormValues = z.infer<typeof nameSchema>;
export type EmailFormInput = z.input<typeof emailSchema>;
export type EmailFormValues = z.output<typeof emailSchema>;
