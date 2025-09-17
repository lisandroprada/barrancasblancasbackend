import { IsString, IsEmail, IsNotEmpty, IsArray, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsOptional()
  password?: string; // Made optional as backend will generate it for simplified registration

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roles?: string[];
}
