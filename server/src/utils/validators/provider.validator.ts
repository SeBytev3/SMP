import { z } from 'zod';

export const registerProviderSchema = z.object({
  body: z.object({
    serviceCategoryId: z.string().min(1, 'Category ID is required'),
    bio: z.string().max(2000).optional(),
    locationCity: z.string().max(100).optional(),
    locationRegion: z.string().max(100).optional(),
    locationLat: z.number().min(-90).max(90).optional(),
    locationLng: z.number().min(-180).max(180).optional(),
    certifications: z.array(z.string()).max(20).optional(),
    availabilityNotes: z.string().max(2000).optional(),
  }),
});

export const updateProviderSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    serviceCategoryId: z.string().min(1, 'Category ID is required').optional(),
    bio: z.string().max(2000).optional(),
    locationCity: z.string().max(100).optional(),
    locationRegion: z.string().max(100).optional(),
    locationLat: z.number().min(-90).max(90).optional(),
    locationLng: z.number().min(-180).max(180).optional(),
    certifications: z.array(z.string()).max(20).optional(),
    availabilityNotes: z.string().max(2000).optional(),
  }),
});

export const searchProvidersSchema = z.object({
  query: z.object({
    categoryId: z.string().min(1).optional(),
    city: z.string().max(100).optional(),
    minRating: z.coerce.number().min(0).max(5).optional(),
    sort: z.enum(['rating', 'recent']).optional().default('recent'),
    page: z.coerce.number().min(1).optional().default(1),
    limit: z.coerce.number().min(1).max(100).optional().default(20),
  }),
});
