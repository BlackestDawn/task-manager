import z from 'zod';
import { BadRequestError } from '../classes/errors';

const DoByUUIDRequestSchema = z.object({
  id: z.uuid(),
});

export type DoByUUIDRequest = z.infer<typeof DoByUUIDRequestSchema>;

export function validateDoByUUIDRequest(item: unknown): DoByUUIDRequest {
  if (typeof item === 'string') {
    item = { id: item };
  }
  const result = DoByUUIDRequestSchema.safeParse(item);
  if (!result.success) {
    console.error('Invalid/malformed UUID:', result.error);
    throw new BadRequestError('Invalid/malformed UUID');
  }
  return result.data;
}
