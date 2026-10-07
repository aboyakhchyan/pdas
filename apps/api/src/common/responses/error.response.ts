import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ERROR_CODES, type ErrorCode } from '../errors/error-code';

export class ErrorIssueResponse {
    @ApiProperty({ type: 'array', items: { oneOf: [{ type: 'string' }, { type: 'number' }] } })
    path: (string | number)[];

    @ApiProperty()
    message: string;
}

export class ErrorResponse {
    @ApiProperty({ example: 404 })
    statusCode: number;

    @ApiProperty({ enum: ERROR_CODES })
    code: ErrorCode;

    @ApiProperty({ description: 'Message translated to the request locale' })
    message: string;

    @ApiPropertyOptional({ type: [ErrorIssueResponse] })
    issues?: ErrorIssueResponse[];

    @ApiProperty({ description: 'Echoed in the X-Request-Id header; quote it in bug reports' })
    requestId: string;

    @ApiProperty({ example: '/v1/documents' })
    path: string;

    @ApiProperty({ format: 'date-time' })
    timestamp: string;
}
