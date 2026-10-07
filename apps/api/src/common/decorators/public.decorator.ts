import { Reflector } from '@nestjs/core';

export const Public = Reflector.createDecorator<void, true>({ transform: () => true });
