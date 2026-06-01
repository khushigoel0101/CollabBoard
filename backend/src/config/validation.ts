import { z } from 'zod';

export const MoveCardSchema = z.object({
  cardId: z.string().min(1, 'Card ID is required'),
  fromListId: z.string().min(1, 'Source List ID is required'),
  toListId: z.string().min(1, 'Destination List ID is required'),
  newIndex: z.number().int().nonnegative('Index must be a non-negative integer')
});

export const CreateCardSchema = z.object({
  listId: z.string().min(1, 'List ID is required'),
  title: z.string().min(1, 'Card title cannot be empty').max(100, 'Title too long'),
  description: z.string().optional(),
  tags: z.array(z.string()).optional()
});

export const CreateListSchema = z.object({
  title: z.string().min(1, 'List title cannot be empty').max(50, 'Title too long')
});