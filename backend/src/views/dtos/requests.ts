import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AttendanceStatus, RegionKind, RoleName } from '../../models/entities';

const ROLES: RoleName[] = ['admin', 'operator', 'pastor', 'viewer'];

export class LoginRequest {
  @IsEmail({}, { message: 'Ingrese un correo electrónico válido' })
  email!: string;

  @IsString()
  @MinLength(1, { message: 'La contraseña es obligatoria' })
  password!: string;
}

export class CreateUserRequest {
  @IsEmail({}, { message: 'Ingrese un correo electrónico válido' })
  email!: string;

  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password!: string;

  @IsString()
  @MinLength(3, { message: 'El nombre completo es obligatorio' })
  fullName!: string;

  @IsIn(ROLES)
  role!: RoleName;
}

export class UpdateRoleRequest {
  @IsIn(ROLES)
  role!: RoleName;
}

export class CreateRegionRequest {
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100)
  name!: string;

  @IsIn(['departamento', 'region'])
  kind!: RegionKind;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  country?: string;
}

export class CreateDistrictRequest {
  @IsUUID()
  regionId!: string;

  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100)
  name!: string;
}

export class CreateChurchRequest {
  @IsUUID()
  districtId!: string;

  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @IsOptional()
  @IsUUID()
  leadPastorId?: string | null;
}

export class AssignPastorRequest {
  @IsOptional()
  @IsUUID()
  leadPastorId?: string | null;
}

export class CreatePastorRequest {
  @IsOptional()
  @IsUUID()
  churchId?: string | null;

  @IsString()
  @MinLength(2, { message: 'El nombre es obligatorio' })
  @MaxLength(80)
  firstName!: string;

  @IsString()
  @MinLength(2, { message: 'El apellido es obligatorio' })
  @MaxLength(80)
  lastName!: string;
}

export class RegisterAttendanceRequest {
  @IsUUID()
  eventId!: string;

  @IsUUID()
  pastorId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  notes?: string;
}

export class CancelAttendanceRequest {
  @IsOptional()
  @IsIn(['registered', 'confirmed', 'cancelled'])
  status?: AttendanceStatus;
}

export class UpdateNameRequest {
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(150)
  name!: string;
}

export class UpdateActiveRequest {
  @IsBoolean()
  isActive!: boolean;
}

export class UpdatePastorRequest {
  @IsOptional()
  @IsUUID()
  churchId?: string | null;

  @IsString()
  @MinLength(2, { message: 'El nombre es obligatorio' })
  @MaxLength(80)
  firstName!: string;

  @IsString()
  @MinLength(2, { message: 'El apellido es obligatorio' })
  @MaxLength(80)
  lastName!: string;
}

export class UpdateChurchRequest {
  @IsOptional()
  @IsUUID()
  districtId?: string;

  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(150)
  name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;
}
