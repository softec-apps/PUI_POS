export enum RoleEnum {
  Admin = 1,
  Cashier = 2,
  Manager = 3,
  Inventory = 4,
  Customer = 5,
}

export const ROLES = {
  ADMIN: 'admin',
  CASHIER: 'cashier',
  MANAGER: 'manager',
  INVENTORY: 'inventory',
  CUSTOMER: 'customer',
} as const
