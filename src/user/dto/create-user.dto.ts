import { IsString, IsEmail, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString({ message: 'El nombre debe ser un texto.' })
  @IsNotEmpty({ message: 'El nombre es requerido.' })
  name: string;

  @IsEmail({}, { message: 'El email debe ser un correo electrónico válido.' })
  @IsNotEmpty({ message: 'El email es requerido.' })
  email: string;

  @IsString({ message: 'La contraseña debe ser un texto.' })
  @IsOptional()
  password?: string; // Made optional as backend will generate it for simplified registration

  @IsArray({ message: 'Los roles deben ser un arreglo.' })
  @IsString({ each: true, message: 'Cada rol debe ser un texto.' })
  @IsOptional()
  roles?: string[];
}
