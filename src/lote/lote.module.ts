import { Module } from '@nestjs/common';
import { LoteService } from './lote.service';
import { LoteController } from './lote.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Lote, LoteSchema } from './entities/lote.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Lote.name, schema: LoteSchema }]),
  ],
  controllers: [LoteController],
  providers: [LoteService],
})
export class LoteModule {}
