// src/database/database.module.ts
import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { databaseProviders } from './database.providers';

@Global() // Makes the module available globally
@Module({
  imports: [ConfigModule],
  providers: [...databaseProviders],
  exports: [...databaseProviders],
})
export class DatabaseModule {}