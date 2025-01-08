
import { z } from 'zod';

export const enableDisableUserSchema = z.object({
  isEnabled: z.boolean(),
});
