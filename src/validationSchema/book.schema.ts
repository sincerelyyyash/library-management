import z from "zod"

export const createBookSchema = z.object({
  isbn: z.string().min(10).max(13),
  title: z.string().min(1),
  copies: z.number().int().min(1),
});

export const updateBookSchema = z.object({
  title: z.string().optional(),
  copies: z.number().int().min(1).optional(),
});

