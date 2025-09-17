import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LeadService } from './lead.service';
import { LeadController } from './lead.controller';
import { Lead, LeadSchema } from './entities/lead.entity';
import { Activity, ActivitySchema } from './entities/activity.entity';
import { Proposal, ProposalSchema } from './entities/proposal.entity';
import { PurchaseTicket, PurchaseTicketSchema } from './entities/purchase-ticket.entity';
import { UserModule } from '../user/user.module';
import { LoteModule } from '../lote/lote.module';
import { APP_GUARD } from '@nestjs/core'; // Import APP_GUARD
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Import JwtAuthGuard

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Lead.name, schema: LeadSchema },
      { name: Activity.name, schema: ActivitySchema },
      { name: Proposal.name, schema: ProposalSchema },
      { name: PurchaseTicket.name, schema: PurchaseTicketSchema },
    ]),
    UserModule,
    LoteModule,
  ],
  controllers: [LeadController],
  providers: [
    LeadService,
    {
      provide: APP_GUARD, // Provide JwtAuthGuard globally for this module
      useClass: JwtAuthGuard,
    },
  ],
})
export class LeadModule {}

