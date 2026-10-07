import { z } from "zod";

export const CURRENCIES = ["AMD", "USD", "EUR", "RUB"] as const;
export const currencySchema = z.enum(CURRENCIES);
export type Currency = z.infer<typeof currencySchema>;

export const moneySchema = z.object({
  amount: z.number().int(),
  currency: currencySchema,
});
export type Money = z.infer<typeof moneySchema>;
