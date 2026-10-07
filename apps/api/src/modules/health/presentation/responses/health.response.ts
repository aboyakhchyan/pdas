import { ApiProperty } from '@nestjs/swagger';

export class HealthResponse {
    @ApiProperty({ enum: ['ok'] })
    status: 'ok';

    @ApiProperty({ description: 'Translated status message' })
    message: string;

    @ApiProperty({ description: 'Process uptime in seconds' })
    uptime: number;
}
