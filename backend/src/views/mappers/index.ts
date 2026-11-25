import { AuthUser, UserDto } from '../../models/entities';

/** Elimina datos sensibles antes de responder al frontend. */
export function toPublicUser(user: AuthUser | UserDto): UserDto {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

export function fullName(firstName: string, lastName: string): string {
  return `${firstName.trim()} ${lastName.trim()}`.trim();
}
