import { applyDecorators } from '@nestjs/common';
import { ApiProperty, type ApiPropertyOptions } from '@nestjs/swagger';
import { ValidateBy } from 'class-validator';
import { z } from 'zod';

/**
 * Validates a request DTO property with the matching field of a zod contract from `@pdas/core`,
 * so every limit lives in one place, and documents it in Swagger. The parsed value (trimmed,
 * coerced, defaulted) replaces the raw one, even when the property was absent.
 */
export function ContractField(schema: z.ZodType): PropertyDecorator {
    return applyDecorators(
        ApiProperty(toApiProperty(schema, 'input')),
        ValidateBy({
            name: 'contractField',
            validator: {
                validate: (value, args) => {
                    const result = schema.safeParse(value);
                    if (result.success && args) {
                        (args.object as Record<string, unknown>)[args.property] = result.data;
                    }
                    return result.success;
                },
                defaultMessage: (args) => describeFailure(schema, args?.value),
            },
        }),
    );
}

/** Documents a response DTO property in Swagger from the matching field of a zod contract. */
export function ContractProperty(schema: z.ZodType): PropertyDecorator {
    return ApiProperty(toApiProperty(schema, 'output'));
}

function toApiProperty(schema: z.ZodType, io: 'input' | 'output'): ApiPropertyOptions {
    const required = !schema.safeParse(undefined).success;
    const jsonSchema = z.toJSONSchema(schema, {
        target: 'openapi-3.0',
        io,
        unrepresentable: 'any',
    });
    // Recursive schemas (blueprints) are described by their TypeScript type alone.
    if ('definitions' in jsonSchema || '$ref' in jsonSchema) return { required };

    const { $schema: _dialect, ...property } = jsonSchema;
    // A nested object's own `required` list would clash with the property-level flag.
    const options: Record<string, unknown> = Array.isArray(property['required'])
        ? { type: 'object', allOf: [property], required }
        : { type: 'object', ...property, required };
    return options as ApiPropertyOptions;
}

function describeFailure(schema: z.ZodType, value: unknown): string {
    const result = schema.safeParse(value);
    if (result.success) return '';
    return result.error.issues
        .map(({ path, message }) => (path.length > 0 ? `${path.join('.')}: ${message}` : message))
        .join('; ');
}
