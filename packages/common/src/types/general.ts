import z from 'zod';

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
    console.error('Invalid get by UUID request:', result.error);
    throw new Error('Invalid get by UUID request');
  }
  return result.data;
}
