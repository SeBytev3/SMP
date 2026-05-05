import { z } from 'zod';

const registerProviderSchema = z.object({
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

const testData = {
  body: {
    serviceCategoryId: 'cat-locksmith',
    bio: 'Se todo sobre tubos',
    locationCity: 'Cali',
    locationRegion: 'Valle del Cauca',
    availabilityNotes: '',
    certifications: []
  }
};

try {
  registerProviderSchema.parse(testData);
  console.log('✅ Zod validation passed');
} catch (error) {
  console.log('❌ Zod validation failed');
  console.log(JSON.stringify(error, null, 2));
}
