import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { LeadService } from './lead.service';
import { CreateLeadDto } from './dto/create-lead.dto'; // This will be used for admin-created leads
import { CreateContactLeadDto } from './dto/create-contact-lead.dto'; // For public contact form
import { UpdateLeadDto } from './dto/update-lead.dto';
import { CreateActivityDto } from './dto/create-activity.dto'; // Import CreateActivityDto
import { Public, Roles } from '../auth/roles.decorator'; // Import Public and Roles decorator
import { Request } from 'express'; // Import Request from express

// Augment the Request type to include the user property
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    // Add other user properties if they exist, e.g., roles: string[];
  };
}

@Controller('leads')
export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  @Public()
  @Post('contact')
  createContact(@Body() createContactLeadDto: CreateContactLeadDto) {
    return this.leadService.createContactLead(createContactLeadDto);
  }

  @Post()
  @Roles('admin') // Protect this endpoint for admin-created leads
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadService.create(createLeadDto);
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
    const userId = req.user?.userId;
    if (!userId) {
      throw new Error('Authenticated user ID is required');
    }
    // Ensure the leadId in the DTO matches the param for consistency
    createActivityDto.leadId = leadId;
    return this.leadService.createActivity(createActivityDto, userId);
  }

  @Get(':id/activity')
  @Roles('admin', 'vendedor') // Admin or salesperson can view activities
  findActivities(@Param('id') leadId: string) {
    return this.leadService.findActivitiesByLeadId(leadId);
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
