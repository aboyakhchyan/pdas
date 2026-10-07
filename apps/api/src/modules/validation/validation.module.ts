import { Module } from '@nestjs/common';
import { ContentValidationService } from './application/services/content-validation.service';

@Module({
    providers: [ContentValidationService],
    exports: [ContentValidationService],
})
export class ValidationModule {}
