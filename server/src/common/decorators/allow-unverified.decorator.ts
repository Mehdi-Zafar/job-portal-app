// src/common/decorators/allow-unverified.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const AllowUnverified = () => SetMetadata('allowUnverified', true);