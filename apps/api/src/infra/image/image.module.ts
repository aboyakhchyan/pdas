import { Global, Module } from '@nestjs/common';
import { ImageProcessor } from './image-processor';
import { SharpImageProcessor } from './sharp-image-processor';

@Global()
@Module({
    providers: [{ provide: ImageProcessor, useClass: SharpImageProcessor }],
    exports: [ImageProcessor],
})
export class ImageModule {}
