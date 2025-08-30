import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  @IsNotEmpty()
  license: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;
}

export class UpdateVehicleDto {
  @IsString()
  @IsNotEmpty()
  license?: string;

  @IsUUID()
  @IsNotEmpty()
  userId?: string;
}
