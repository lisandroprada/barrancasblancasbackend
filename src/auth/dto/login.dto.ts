import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'El email debe ser un correo electrónico válido.' })
  @IsNotEmpty({ message: 'El email es requerido.' })
  email: string;

  @IsString({ message: 'La contraseña debe ser un texto.' })
  @IsNotEmpty({ message: 'La contraseña es requerida.' })
  password: string;
}
