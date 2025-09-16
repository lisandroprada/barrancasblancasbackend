import { IsString, IsEmail, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roles?: string[];
}
