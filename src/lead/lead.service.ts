import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateLeadDto } from './dto/create-lead.dto';
import { CreateContactLeadDto } from './dto/create-contact-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { CreateActivityDto } from './dto/create-activity.dto';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { CreatePurchaseTicketDto } from './dto/create-purchase-ticket.dto';
import { Lead, LeadDocument, LeadSource, LeadStatus } from './entities/lead.entity';
import { Activity, ActivityDocument } from './entities/activity.entity';
import { Proposal, ProposalDocument } from './entities/proposal.entity';
import { PurchaseTicket, PurchaseTicketDocument } from './entities/purchase-ticket.entity';
import { UserService } from '../user/user.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoteService } from '../lote/lote.service';

@Injectable()
export class LeadService {
  constructor(
    @InjectModel(Lead.name) private leadModel: Model<LeadDocument>,
    @InjectModel(Activity.name) private activityModel: Model<ActivityDocument>,
    @InjectModel(Proposal.name) private proposalModel: Model<ProposalDocument>, // Inject Proposal model
    @InjectModel(PurchaseTicket.name) private purchaseTicketModel: Model<PurchaseTicketDocument>, // Inject PurchaseTicket model
    private readonly userService: UserService,
    private readonly loteService: LoteService, // Inject LoteService
  ) {}

  async createContactLead(createContactLeadDto: CreateContactLeadDto): Promise<LeadDocument> {
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

  async registerLeadAsUser(leadId: string): Promise<{ user: any; temporaryPassword: string }> {
    const lead = await this.leadModel.findById(leadId).exec();

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${leadId} not found`);
    }

    if (lead.user) {
      throw new BadRequestException(`Lead with ID ${leadId} already has an associated user`);
    }

    const existingUser = await this.userService.findOneByEmail(lead.email);
    if (existingUser) {
      throw new ConflictException(`User with email ${lead.email} already exists`);
    }

    const temporaryPassword = Math.random().toString(36).slice(-8);

    const createUserDto: CreateUserDto = {
      name: lead.nombre,
      email: lead.email,
      password: temporaryPassword,
      roles: ['user'],
    };

    const newUser = await this.userService.create(createUserDto);

    lead.user = newUser._id as Types.ObjectId;
    await lead.save();

    // Return user object without password
    const userWithoutPassword = newUser.toObject();
    delete userWithoutPassword.password;

    return { user: userWithoutPassword, temporaryPassword };
  }

  async createActivity(createActivityDto: CreateActivityDto, userId: string): Promise<ActivityDocument> {
    const { leadId, ...activityData } = createActivityDto;
    const lead = await this.leadModel.findById(leadId).exec();

    if (!lead) {
      throw new NotFoundException(`Lead with ID ${leadId} not found`);
    }

    const createdActivity = new this.activityModel({
      ...activityData,
      lead: new Types.ObjectId(leadId),
      creadoPor: new Types.ObjectId(userId),
    });
    return createdActivity.save();
  }

  findActivitiesByLeadId(leadId: string): Promise<ActivityDocument[]> {
    return this.activityModel.find({ lead: leadId }).populate('creadoPor').exec();
  }

  async createProposal(createProposalDto: CreateProposalDto, userId: string): Promise<ProposalDocument> {
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
      lead: new Types.ObjectId(leadId),
      lote: new Types.ObjectId(loteId),
      generadaPor: new Types.ObjectId(userId),
      documentUrl,
    });
    return createdProposal.save();
  }

  async createPurchaseTicket(createPurchaseTicketDto: CreatePurchaseTicketDto, userId: string): Promise<PurchaseTicketDocument> {
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
      lead: new Types.ObjectId(leadId),
      lote: new Types.ObjectId(loteId),
      generadoPor: new Types.ObjectId(userId),
      documentUrl,
    });
    return createdPurchaseTicket.save();
  }

  update(id: string, updateLeadDto: UpdateLeadDto): Promise<LeadDocument | null> {
    return this.leadModel.findByIdAndUpdate(id, updateLeadDto, { new: true }).exec();
  }

  remove(id: string): Promise<LeadDocument | null> {
    return this.leadModel.findByIdAndDelete(id).exec();
  }
}