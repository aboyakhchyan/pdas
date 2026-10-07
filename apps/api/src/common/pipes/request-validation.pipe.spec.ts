import type { ArgumentMetadata } from '@nestjs/common';
import { createDocumentSchema, listDocumentsQuerySchema } from '@pdas/core';
import { ContractField } from '../decorators/contract.decorator';
import { RequestInvalidError } from '../errors/domain-error';
import { RequestValidationPipe } from './request-validation.pipe';

class TitleRequest {
    @ContractField(createDocumentSchema.shape.title)
    title: string;
}

class PageRequest {
    @ContractField(listDocumentsQuerySchema.shape.limit)
    limit: number;
}

describe('RequestValidationPipe', () => {
    const pipe = new RequestValidationPipe();
    const body = (metatype: ArgumentMetadata['metatype']): ArgumentMetadata => ({
        type: 'body',
        metatype,
    });

    it('returns the class instance with values parsed by the contract', async () => {
        const result = await pipe.transform({ title: '  Լիազորագիր  ' }, body(TitleRequest));

        expect(result).toBeInstanceOf(TitleRequest);
        expect(result).toEqual({ title: 'Լիազորագիր' });
    });

    it('coerces query strings and applies contract defaults to absent fields', async () => {
        await expect(pipe.transform({ limit: '10' }, body(PageRequest))).resolves.toEqual({
            limit: 10,
        });
        await expect(pipe.transform({}, body(PageRequest))).resolves.toEqual({ limit: 20 });
    });

    it('reports contract violations with the property path', async () => {
        const error = await pipe
            .transform({ title: '' }, body(TitleRequest))
            .catch((e: unknown) => e);

        expect(error).toBeInstanceOf(RequestInvalidError);
        expect((error as RequestInvalidError).issues).toEqual([
            { path: ['title'], message: expect.any(String) },
        ]);
    });

    it('rejects properties the request class does not declare', async () => {
        const error = await pipe
            .transform({ title: 'ok', ownerId: 'someone-else' }, body(TitleRequest))
            .catch((e: unknown) => e);

        expect((error as RequestInvalidError).issues).toEqual([
            { path: ['ownerId'], message: expect.stringContaining('should not exist') },
        ]);
    });
});
