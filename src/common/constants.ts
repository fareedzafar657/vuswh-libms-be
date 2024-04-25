import { SetMetadata } from '@nestjs/common';

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}
export const ROLE_SERVICE = 'ROLE_SERVICE';
export const PERMISSION_SERVICE = 'PERMISSION_SERVICE';
export const USER_SERVICE = 'USER_SERVICE';
export const DESIGNATION_SERVICE = 'DESIGNATION_SERVICE';
export const DEPARTMENT_SERVICE = 'DEPARTMENT_SERVICE';
export const LOCATION_SERVICE = 'LOCATION_SERVICE';
export const PUBLISHER_SERVICE = 'PUBLISHER_SERVICE';
export const MATERIAL_TYPE_SERVICE = 'MATERIAL_TYPE_SERVICE';
export const LANGUAGE_SERVICE = 'LANGUAGE_SERVICE';
export const CATEGORY_SERVICE = 'CATEGORY_SERVICE';
export const CURRENCY_SERVICE = 'CURRENCY_SERVICE';
export const AUTHOR_SERVICE = 'AUTHOR_SERVICE';

export const DUE_DATE = () => {
  const due_date = new Date();
  due_date.setMonth(due_date.getMonth() + 1);
  return due_date;
};

export const RE_DUE_DATE = (due_date: Date) => {
  const re_due_date = new Date(due_date);
  re_due_date.setDate(re_due_date.getDate() + 15);
  return re_due_date;
};

export const IS_PUBLIC_KEY = 'isPublic';
export const PUBLIC = () => SetMetadata(IS_PUBLIC_KEY, true);

export const ROLES_KEY = 'roles';
export const ROLES = (roles: string[]) => SetMetadata(ROLES_KEY, roles);

export const jwtConstants = {
  secret: 'PAK1STAN1947',
};

export const saltOrRounds = 10;
