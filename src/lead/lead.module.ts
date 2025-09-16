import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadService } from './lead.service';
import { LeadController } from './lead.controller';
import { Lead, LeadSchema } from './entities/lead.entity';
import { Activity, ActivitySchema } from './entities/activity.entity';
import { Proposal, ProposalSchema } from './entities/proposal.entity';
import { PurchaseTicket, PurchaseTicketSchema } from './entities/purchase-ticket.entity';
import { UserService } from '../user/user.service'; // Import UserService
import { UserModule } from '../user/user.module'; // Import UserModule
import { LoteModule } from '../lote/lote.module'; // Import LoteModule

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lead.name, schema: LeadSchema },
      { name: Activity.name, schema: ActivitySchema },
      { name: Proposal.name, schema: ProposalSchema },
      { name: PurchaseTicket.name, schema: PurchaseTicketSchema },
    ]),
    UserModule, // Import UserModule to make UserService available
    LoteModule, // Import LoteModule to make LoteService available
  ],
  controllers: [LeadController],
  providers: [LeadService],
})
export class LeadModule {}

