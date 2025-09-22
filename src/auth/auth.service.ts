import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { UserDocument } from '../user/entities/user.entity';
import { NotificationService } from '../notification/notification.service';
import { LeadService } from '../lead/lead.service'; // Import LeadService
import { LeadDocument } from '../lead/entities/lead.entity'; // Import LeadDocument
import { Types } from 'mongoose'; // Import Types

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private notificationService: NotificationService, // Inject NotificationService
    private leadService: LeadService, // Inject LeadService
  ) {}

  private generateRandomPassword(length = 10): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  async signUp(createUserDto: CreateUserDto): Promise<UserDocument> {
    const existingUser = await this.userService.findOneByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException(`User with email ${createUserDto.email} already exists`);
    }

    const generatedPassword = this.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const user = await this.userService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Check if a lead exists with this email and link it to the new user
    const existingLead = await this.leadService.findOneByEmail(createUserDto.email);
    if (existingLead) {
      existingLead.user = user._id as Types.ObjectId; // Link the lead to the newly created user
      await existingLead.save();
    }

    // Send the generated password to the user's email
    await this.notificationService.sendEmail(
      createUserDto.email,
      'Tu contraseña para Barrancas Blancas',
      `Hola ${createUserDto.name},

Tu cuenta ha sido creada exitosamente. Tu contraseña temporal es: ${generatedPassword}

Por favor, inicia sesión y cambia tu contraseña lo antes posible.

Saludos,
El equipo de Barrancas Blancas`,
    );

    return user;
  }

  async signIn(email: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.userService.findOneByEmail(email);
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException();
    }

    // Update lastLogin field
    user.lastLogin = new Date();
    await user.save();

    const payload = { username: user.email, sub: user._id, roles: user.roles };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
