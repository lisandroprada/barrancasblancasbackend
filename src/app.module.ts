import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { LoteModule } from './lote/lote.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { LeadModule } from './lead/lead.module';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    LoteModule,
    UserModule,
    AuthModule,
    LeadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
