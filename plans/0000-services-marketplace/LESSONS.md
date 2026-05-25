# Lessons Learned

## Testing & Mocking
- **Prisma Mocking**: Switched from manual mocks to `jest-mock-extended` using the `prismaMock` pattern. This provides much better type safety and deep mocking capabilities for complex service logic.
- **Import Order**: Discovered that `prismaMock` MUST be imported before the service being tested to ensure the `prisma` singleton is properly mocked before the service module initializes.
- **Decimal Types**: Prisma `Decimal` fields in mocks require explicit casting or using `new Prisma.Decimal()` to avoid TypeScript errors in tests.

## Internationalization (i18n) & Spanish Standardization
- **Removal of Dynamic i18n:** Discovered that dynamic translation mechanisms (such as `i18next`) and dynamic language toggles introduce unnecessary dependency bloat and runtime overhead when a project is targeted at a specific primary audience (Spanish-speaking regions). Standardizing on Spanish early simplified our controllers and validation logic immensely.
- **Direct Database Mapping:** Instead of complex browser auto-detection or runtime utility functions, mapping database localization fields (e.g., `nameEs` to `name` and `descriptionEs` to `description`) directly in the controller tier proved highly effective. This allowed us to keep the database schema unchanged while providing a clean, single-language representation to the frontend client without breaking existing UI components.

## API Documentation
- **Swagger as Source of Truth**: Using JSDoc comments (`swagger-jsdoc`) keeps documentation close to the code, but requires discipline to keep schemas in `swagger.ts` synced with Prisma models.
- **Type Safety**: The build process (`tsc`) revealed several hidden bugs in controllers (missing property checks, incorrect type casts) while setting up Swagger, proving the value of strict type checking even in "documentation" tasks.
