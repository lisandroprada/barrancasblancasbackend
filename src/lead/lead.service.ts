import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateLeadDto } from './dto/create-lead.dto';
import { CreateContactLeadDto } from './dto/create-contact-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { CreateActivityDto, ActivityType } from './dto/create-activity.dto'; // Import ActivityType
import { CreateProposalDto } from './dto/create-proposal.dto';
import { CreatePurchaseTicketDto } from './dto/create-purchase-ticket.dto';
import {
  Lead,
  LeadDocument,
  LeadSource,
  LeadStatus,
} from './entities/lead.entity';
import { Activity, ActivityDocument } from './entities/activity.entity';
import { Proposal, ProposalDocument } from './entities/proposal.entity';
import {
  PurchaseTicket,
  PurchaseTicketDocument,
} from './entities/purchase-ticket.entity';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoteService } from '../lote/lote.service';

@Injectable()
export class LeadService {
  constructor(
    @InjectModel(Lead.name) private leadModel: Model<LeadDocument>,
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
    @InjectModel(Proposal.name) private proposalModel: Model<ProposalDocument>,
    @InjectModel(PurchaseTicket.name)
    private purchaseTicketModel: Model<PurchaseTicketDocument>,
    private readonly userService: UserService,
    private readonly loteService: LoteService,
  ) {}

  async createContactLead(
    createContactLeadDto: CreateContactLeadDto,
  ): Promise<LeadDocument> {
    const createdLead = new this.leadModel({
      ...createContactLeadDto,
      fuente: LeadSource.FRONTEND,
      estado: LeadStatus.NUEVO,
      fechaCreacion: new Date(),
    });
    // Optionally, send internal notification here
    return createdLead.save();
  }

  create(createLeadDto: CreateLeadDto): Promise<LeadDocument> {
    const createdLead = new this.leadModel(createLeadDto);
    return createdLead.save();
  }

  findAll(): Promise<LeadDocument[]> {
    return this.leadModel.find().exec();
  }

  findOne(id: string): Promise<LeadDocument | null> {
    return this.leadModel.findById(id).exec();
  }

  async registerLeadAsUser(
    leadId: string,
  ): Promise<{ user: any; temporaryPassword: string }> {
    const lead = await this.leadModel.findById(leadId).exec();

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${leadId} not found`);
    }

    if (lead.user) {
      throw new BadRequestException(
        `Lead with ID ${leadId} already has an associated user`,
      );
    }

    const existingUser = await this.userService.findOneByEmail(lead.email);
    if (existingUser) {
      throw new ConflictException(
        `User with email ${lead.email} already exists`,
      );
    }

    const temporaryPassword = Math.random().toString(36).slice(-8);

    const createUserDto: CreateUserDto = {
      name: lead.nombre,
      email: lead.email,
      password: temporaryPassword,
      roles: ['user'],
    };

    const newUser = await this.userService.create(createUserDto);

    lead.user = new Types.ObjectId(newUser._id as string); // Assign the ObjectId directly
    await lead.save();

    // Return user object without password
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userWithoutPassword = newUser.toObject();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete userWithoutPassword.password;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    return { user: userWithoutPassword, temporaryPassword };
  }

  async createActivity(
    leadId: string,
    createActivityDto: CreateActivityDto,
    userId: string,
  ): Promise<ActivityDocument> {
    const lead = await this.leadModel.findById(leadId).exec();

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${leadId} not found`);
    }

    const activityData = {
      ...createActivityDto,
      lead: lead._id, // Use the ObjectId from the fetched lead document
      registradoPor: new Types.ObjectId(userId),
      fechaProgramada: createActivityDto.fechaProgramada
        ? new Date(createActivityDto.fechaProgramada)
        : createActivityDto.fechaProgramada,
      fechaVencimientoTarea: createActivityDto.fechaVencimientoTarea
        ? new Date(createActivityDto.fechaVencimientoTarea)
        : createActivityDto.fechaVencimientoTarea,
    };

    // Conditional logic based on ActivityType
    switch (activityData.tipoActividad) {
      case ActivityType.VISIT:
      case ActivityType.MEETING:
        if (activityData.fechaProgramada) {
          // Future: Call calendarService to create an event
          // await this.calendarService.createEvent({
          //   title: `${activityData.tipoActividad} con ${lead.nombre}`,
          //   description: activityData.comentarios,
          //   startTime: activityData.fechaProgramada,
          //   location: activityData.ubicacion,
          //   leadId: lead._id,
          //   assignedToUserId: userId, // Or lead.asignadoA if applicable
          // });
        }
        break;
      case ActivityType.CALL:
        if (activityData.fechaProgramada) {
          // Future: Call calendarService to create an event for a scheduled call
          // await this.calendarService.createEvent({
          //   title: `Llamada programada con ${lead.nombre}`,
          //   description: activityData.comentarios,
          //   startTime: activityData.fechaProgramada,
          //   leadId: lead._id,
          //   assignedToUserId: userId,
          // });
        }
        // Future: Potentially check if numeroContacto is present on lead or activityData
        break;
      case ActivityType.INTERNAL_TASK:
        // Future: Call taskService to create a new task
        // await this.taskService.createTask({
        // title: `Tarea para Lead: ${lead.nombre}`,
        // description: activityData.comentarios,
        // dueDate: activityData.fechaVencimientoTarea,
        // assignedToUserId: activityData.responsableTareaId || userId,
        // leadId: lead._id,
        // });
        break;
      case ActivityType.EMAIL:
        // Future: Potentially log email details or trigger an email sending service
        break;
      case ActivityType.WHATSAPP:
        // Future: Potentially log WhatsApp message details
        break;
      case ActivityType.DOCUMENT_SENT:
        // Future: Potentially log document details or link to a document management system
        break;
      case ActivityType.OTHER:
        // Generic handling
        break;
    }

    const createdActivity = new this.activityModel(activityData);
    return createdActivity.save();
  }

  findActivitiesByLeadId(leadId: string): Promise<ActivityDocument[]> {
    return this.activityModel
      .find({ lead: leadId })
      .populate('registradoPor')
      .exec();
  }

  async createProposal(
    createProposalDto: CreateProposalDto,
    userId: string,
  ): Promise<ProposalDocument> {
    const { leadId, loteId, ...proposalData } = createProposalDto;

    const lead = await this.leadModel.findById(leadId).exec();
    if (!lead) {
      throw new NotFoundException(`Lead with ID ${leadId} not found`);
    }

    const lote = await this.loteService.findOne(loteId);
    if (!lote) {
      throw new NotFoundException(`Lote with ID ${loteId} not found`);
    }

    // TODO: Implement PDF generation logic here
    const documentUrl = 'placeholder_proposal_url.pdf'; // Placeholder

    const createdProposal = new this.proposalModel({
      ...proposalData,
      lead: lead._id, // Use the ObjectId from the fetched lead document
      lote: lote._id, // Use the ObjectId from the fetched lote document
      generadaPor: new Types.ObjectId(userId),
      documentUrl,
    });
    return createdProposal.save();
  }

  async createPurchaseTicket(
    createPurchaseTicketDto: CreatePurchaseTicketDto,
    userId: string,
  ): Promise<PurchaseTicketDocument> {
    const { leadId, loteId, ...purchaseTicketData } = createPurchaseTicketDto;

    const lead = await this.leadModel.findById(leadId).exec();
    if (!lead) {
      throw new NotFoundException(`Lead with ID ${leadId} not found`);
    }

    const lote = await this.loteService.findOne(loteId);
    if (!lote) {
      throw new NotFoundException(`Lote with ID ${loteId} not found`);
    }

    // TODO: Implement PDF generation logic here
    const documentUrl = 'placeholder_purchase_ticket_url.pdf'; // Placeholder

    const createdPurchaseTicket = new this.purchaseTicketModel({
      ...purchaseTicketData,
      lead: lead._id, // Use the ObjectId from the fetched lead document
      lote: lote._id, // Use the ObjectId from the fetched lote document
      generadoPor: new Types.ObjectId(userId),
      documentUrl,
    });
    return createdPurchaseTicket.save();
  }

  update(
    id: string,
    updateLeadDto: UpdateLeadDto,
  ): Promise<LeadDocument | null> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const update = { ...updateLeadDto } as any;
    if (updateLeadDto.asignadoA !== undefined) {
      if (updateLeadDto.asignadoA) {
        if (!Types.ObjectId.isValid(updateLeadDto.asignadoA)) {
          throw new BadRequestException('Invalid user ID for asignadoA.');
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        update.asignadoA = new Types.ObjectId(updateLeadDto.asignadoA);
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        update.asignadoA = null;
      }
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.leadModel.findByIdAndUpdate(id, update, { new: true }).exec();
  }

  remove(id: string): Promise<LeadDocument | null> {
    return this.leadModel.findByIdAndDelete(id).exec();
  }
}
