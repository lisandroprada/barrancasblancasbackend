import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req, // Import Req
} from '@nestjs/common';
import { LoteService } from './lote.service';
import { CreateLoteDto } from './dto/create-lote.dto';
import { UpdateLoteDto } from './dto/update-lote.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles, Public } from '../auth/roles.decorator';
import { LoteDocument } from './entities/lote.entity';
import { Request } from 'express'; // Import Request from express

// Augment the Request type to include the user property
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    // Add other user properties if they exist, e.g., roles: string[];
  };
}

@Controller('lote')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoteController {
  constructor(private readonly loteService: LoteService) {}

  @Public()
  @Get('available')
  findAvailable(): Promise<LoteDocument[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return this.loteService.findAvailable();
  }

  @Public()
  @Get('featured')
  findFeatured(): Promise<LoteDocument[]> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return this.loteService.findFeaturedLots();
  }

  @Public()
  @Get('public-all')
  findAllPublic(): Promise<{ lots: LoteDocument[]; metadata: any }> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    return this.loteService.findAllPublicLots();
  }

  @Post()
  @Roles('admin')
  create(@Body() createLoteDto: CreateLoteDto) {
    console.log('Received request to create lote:', createLoteDto);
    return this.loteService.create(createLoteDto);
  }

  @Get()
  findAll() {
    return this.loteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loteService.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  update(
    @Param('id') id: string,
    @Body() updateLoteDto: UpdateLoteDto,
    @Req() req: AuthenticatedRequest, // Use AuthenticatedRequest
  ) {
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('Authenticated user ID is required');
    }
    return this.loteService.update(id, updateLoteDto, userId);
  }

  @Delete(':id')
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.loteService.remove(id);
  }

  @Delete('admin/clear-client-references')
  @Roles('admin')
  async clearClientReferences() {
    const updatedCount = await this.loteService.clearClientReferences();
    return { message: `Cleared client references for ${updatedCount} lots.` };
  }
}
