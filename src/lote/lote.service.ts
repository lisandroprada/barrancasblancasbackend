import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { Lote, LoteDocument, LoteStatus } from './entities/lote.entity';

@Injectable()
export class LoteService {
  constructor(@InjectModel(Lote.name) private loteModel: Model<LoteDocument>) {}

  create(createLoteDto: CreateLoteDto): Promise<LoteDocument> {
    const createdLote = new this.loteModel({
      ...createLoteDto,
      client: createLoteDto.clientId ? new Types.ObjectId(createLoteDto.clientId) : null,
      featured: createLoteDto.featured || false,
    });
    return createdLote.save();
  }

  findAll(): Promise<LoteDocument[]> {
    return this.loteModel.find().populate('client').exec();
  }

  findAvailable(): Promise<LoteDocument[]> {
    return this.loteModel.find({ status: LoteStatus.DISPONIBLE }).populate('client').exec();
  }

  findFeaturedLots(): Promise<LoteDocument[]> {
    return this.loteModel.find({ featured: true, status: LoteStatus.DISPONIBLE })
      .limit(6)
      .populate('client')
      .exec();
  }

  findOne(id: string): Promise<LoteDocument | null> {
    return this.loteModel.findById(id).populate('client').exec();
  }

  async update(
    id: string,
    updateLoteDto: UpdateLoteDto,
    userId: string, // This would come from the authenticated user in the controller
  ): Promise<LoteDocument | null> {
    const existingLote = await this.loteModel.findById(id).exec();

    if (!existingLote) {
      return null;
    }

    if (updateLoteDto.status && updateLoteDto.status !== existingLote.status) {
      existingLote.lastStatusModifiedAt = new Date();
      existingLote.statusChangeLog.push({
        status: updateLoteDto.status,
        changedBy: new Types.ObjectId(userId), // Convert userId to ObjectId
        changedAt: new Date(),
      });
    }

    // Handle client update
    if (updateLoteDto.clientId !== undefined) {
      existingLote.client = updateLoteDto.clientId ? new Types.ObjectId(updateLoteDto.clientId) : null;
    }

    // Apply other updates
    Object.assign(existingLote, updateLoteDto);

    return existingLote.save();
  }

  remove(id: string): Promise<LoteDocument | null> {
    return this.loteModel.findByIdAndDelete(id).exec();
  }

  async findAllPublicLots(): Promise<{ lots: LoteDocument[]; metadata: any }> {
    const lots = await this.loteModel.find({}, { propietario: 0, client: 0 }).exec();

    const metadata = lots.reduce((acc, lot) => {
      if (!acc[lot.manzana]) {
        acc[lot.manzana] = { disponible: 0, reservado: 0, vendido: 0 };
      }
      acc[lot.manzana][lot.status]++;
      return acc;
    }, {});

    return { lots, metadata };
  }
}
