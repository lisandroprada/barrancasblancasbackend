import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CreateLeadManualDto,
  CreateLeadContactDto,
} from './dto/create-lead.dto';

import { UpdateLeadDto } from './dto/update-lead.dto';
import { CreateActivityDto, ActivityType } from './dto/create-activity.dto'; // Import ActivityType
import { CreateProposalDto } from './dto/create-proposal.dto';
import { CreatePurchaseTicketDto } from './dto/create-purchase-ticket.dto';
import {
  Lead,
  LeadDocument,
  LeadSource,
  LeadStatus,
  LeadRequestType,
} from './entities/lead.entity';
import { Activity, ActivityDocument } from './entities/activity.entity';
import { Proposal, ProposalDocument } from './entities/proposal.entity';
import {
  PurchaseTicket,
  PurchaseTicketDocument,
} from './entities/purchase-ticket.entity';
import {
  LeadSubmission,
  LeadSubmissionDocument,
} from './entities/lead-submission.entity'; // Import LeadSubmission
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
    @InjectModel(LeadSubmission.name)
    private leadSubmissionModel: Model<LeadSubmissionDocument>, // Inject LeadSubmissionModel
    private readonly userService: UserService,
    private readonly loteService: LoteService,
  ) {}

  /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
  async createContactLead(
    createLeadContactDto: CreateLeadContactDto,
  ): Promise<LeadDocument> {
    const {
      email,
      tipoSolicitud,
      lotesInteres,
      fechaVisitaPreferida,
      mensaje,
      ...rest
    } = createLeadContactDto;

    let estadoInicial: LeadStatus;
    switch (tipoSolicitud) {
      case LeadRequestType.COTIZACION_SIMPLE:
      case LeadRequestType.COTIZACION_MULTIPLE:
        estadoInicial = LeadStatus.NUEVO; // Or a more specific status like 'Nuevo - Cotización'
        break;
      case LeadRequestType.COORDINAR_VISITA:
        estadoInicial = LeadStatus.NUEVO; // Or 'Nuevo - Visita Programada'
        break;
      case LeadRequestType.FINANCIACION:
        estadoInicial = LeadStatus.NUEVO; // Or 'Nuevo - Financiación'
        break;
      case LeadRequestType.INFORMACION_GENERAL:
      default:
        estadoInicial = LeadStatus.NUEVO;
        break;
    }

    // 1. Check if a lead with this email already exists
    let savedLead: LeadDocument; // Declare savedLead here
    const existingLead = await this.leadModel.findOne({ email }).exec();

    if (existingLead) {
      // Update existing lead
      existingLead.set({
        ...rest,
        fuente: LeadSource.FRONTEND, // Always update source to frontend for contact forms
        tipoSolicitud,
        mensaje,
        lotesInteres,
        fechaVisitaPreferida,
        // Do not update 'user' field here if it's already linked, unless explicitly intended.
        // The 'user' field is primarily managed during user registration/linking.
      });
      savedLead = await existingLead.save();
    } else {
      // 2. If no existing lead, check if a user with this email exists
      let userObjectId: Types.ObjectId | undefined;
      const existingUser = await this.userService.findOneByEmail(email);
      if (existingUser) {
        userObjectId = new Types.ObjectId(existingUser._id as string);
      }

      // 3. Create a new lead
      const createdLead = new this.leadModel({
        ...rest,
        email,
        fuente: LeadSource.FRONTEND,
        estado: estadoInicial,
        fechaCreacion: new Date(),
        user: userObjectId, // Link to existing user if found
        tipoSolicitud,
        mensaje,
        lotesInteres,
        fechaVisitaPreferida,
      });

      savedLead = await createdLead.save();
    }

    // Create a new LeadSubmission record for every contact form submission
    const newSubmission = new this.leadSubmissionModel({
      lead: savedLead._id, // Link to the lead (either new or updated existing)
      tipoSolicitud: createLeadContactDto.tipoSolicitud,
      mensaje: createLeadContactDto.mensaje,
      lotesInteres: createLeadContactDto.lotesInteres,
      fechaVisitaPreferida: createLeadContactDto.fechaVisitaPreferida,
      fechaEnvio: new Date(),
    });
    await newSubmission.save();

    // If it's a visit coordination request, create an activity
    if (
      tipoSolicitud === LeadRequestType.COORDINAR_VISITA &&
      fechaVisitaPreferida
    ) {
      console.log(
        'Creating activity for visit for lead',
        String(savedLead._id),
        'on',
        fechaVisitaPreferida?.toISOString(),
      );
    }
    return savedLead;
  }

  create(createLeadManualDto: CreateLeadManualDto): Promise<LeadDocument> {
    const createdLead = new this.leadModel(createLeadManualDto);
    return createdLead.save();
  }

  findAll(): Promise<LeadDocument[]> {
    return this.leadModel.find().exec();
  }

  findOne(id: string): Promise<LeadDocument | null> {
    return this.leadModel.findById(id).exec();
  }

  findOneByEmail(email: string): Promise<LeadDocument | null> {
    return this.leadModel.findOne({ email }).exec();
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
    const userWithoutPassword = newUser.toObject();
    delete userWithoutPassword.password;

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

  findSubmissionsByLeadId(leadId: string): Promise<LeadSubmissionDocument[]> {
    return this.leadSubmissionModel
      .find({ lead: leadId })
      .populate('lead')
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
    const update = { ...updateLeadDto } as any;
    if (updateLeadDto.asignadoA !== undefined) {
      if (updateLeadDto.asignadoA) {
        if (!Types.ObjectId.isValid(updateLeadDto.asignadoA)) {
          throw new BadRequestException('Invalid user ID for asignadoA.');
        }
        update.asignadoA = new Types.ObjectId(updateLeadDto.asignadoA);
      } else {
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
