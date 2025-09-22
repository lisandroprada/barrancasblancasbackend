import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
} from '@nestjs/common';
import { LeadService } from './lead.service';
import { CreateLeadManualDto, CreateLeadContactDto } from './dto/create-lead.dto';

import { UpdateLeadDto } from './dto/update-lead.dto';
import { CreateActivityDto } from './dto/create-activity.dto'; // Import CreateActivityDto
import { Public, Roles } from '../auth/roles.decorator'; // Import Public and Roles decorator
import { Request } from 'express'; // Import Request from express
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

// Augment the Request type to include the user property
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    // Add other user properties if they exist, e.g., roles: string[];
  };
}

@Controller('leads')
@UseGuards(JwtAuthGuard) // Temporarily remove RolesGuard
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Public()
  @Post('contact')
  createContact(@Body() createLeadContactDto: CreateLeadContactDto) {
    return this.leadService.createContactLead(createLeadContactDto);
  }

  @Post()
  @Roles('admin') // Protect this endpoint for admin-created leads
  create(@Body() createLeadManualDto: CreateLeadManualDto) {
    return this.leadService.create(createLeadManualDto);
  }

  @Post(':id/register-user')
  @Roles('admin') // Only admin can trigger this simplified registration
  registerLeadAsUser(@Param('id') id: string) {
    return this.leadService.registerLeadAsUser(id);
  }

  @Post(':id/activity')
  @Roles('admin', 'vendedor') // Admin or salesperson can create activities
  createActivity(
    @Param('id') leadId: string,
    @Body() createActivityDto: CreateActivityDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user?.userId; // This is undefined
    console.log('req.user in createActivity:', req.user);
    if (!userId) {
      throw new Error('Authenticated user ID is required');
    }
    return this.leadService.createActivity(leadId, createActivityDto, userId);
  }

  @Get(':id/activity')
  @Roles('admin', 'vendedor') // Admin or salesperson can view activities
  findActivities(@Param('id') leadId: string) {
    return this.leadService.findActivitiesByLeadId(leadId);
  }

  @Get(':id/submissions')
  @Roles('admin', 'vendedor') // Admin or salesperson can view submissions
  findSubmissions(@Param('id') leadId: string) {
    return this.leadService.findSubmissionsByLeadId(leadId);
  }

  @Get()
  findAll() {
    return this.leadService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leadService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
    return this.leadService.update(id, updateLeadDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leadService.remove(id);
  }
}
