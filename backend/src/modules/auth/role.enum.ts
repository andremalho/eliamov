export enum Role {
  FEMALE_USER = 'female_user',
  PERSONAL_TRAINER = 'personal_trainer',
  FAMILY_COMPANION = 'family_companion',
  ACADEMY_ADMIN = 'academy_admin',
  ACADEMY_MANAGER = 'academy_manager',
  SUPER_ADMIN = 'super_admin',
}

// Backwards compatibility mapping
export const ROLE_ALIASES: Record<string, string> = {
  user: Role.FEMALE_USER,
  professional: Role.PERSONAL_TRAINER,
  admin: Role.SUPER_ADMIN,
  tenant_admin: Role.ACADEMY_ADMIN,
};

export function resolveRole(role: string): string {
  return ROLE_ALIASES[role] ?? role;
}

// Admin-level roles that can manage content/tenants
export const ADMIN_ROLES = [
  Role.SUPER_ADMIN,
  Role.ACADEMY_ADMIN,
  Role.ACADEMY_MANAGER,
  'admin',
  'tenant_admin',
];

// Female-zone roles (can access cycle, mood, etc)
export const FEMALE_ZONE_ROLES = [Role.FEMALE_USER, 'user'];
