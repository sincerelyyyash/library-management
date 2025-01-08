
import { z } from 'zod';

export const payFineSchema = z.object({
  userId: z.number().int(),
  borrowedBookId: z.number().int(),
});

export const generateInvoiceSchema = z.object({
  userId: z.number().int(),
});
