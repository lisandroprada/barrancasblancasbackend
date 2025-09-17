import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UserDocument } from '../user/entities/user.entity';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() loginDto: LoginDto): Promise<{ access_token: string }> {
    try {
      return await this.authService.signIn(loginDto.email, loginDto.password);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed';
      throw new HttpException(errorMessage, HttpStatus.UNAUTHORIZED);
    }
  }

  @Public()
  @Post('register')
  async signUp(@Body() createUserDto: CreateUserDto): Promise<UserDocument> {
    return await this.authService.signUp(createUserDto);
  }
}
