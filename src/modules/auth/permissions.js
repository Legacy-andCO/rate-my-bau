export const ROLES = {
  ADMIN: "admin",
  OWNER: "owner",
  MANAGER: "manager",
  CASHIER: "cashier",
  INVENTORY: "inventory_staff",
};

export const PERMISSIONS = {
  ORDER_CREATE: "order.create",
  ORDER_REFUND: "order.refund",
  ORDER_VOID: "order.void",
  MENU_MANAGE: "menu.manage",
  INVENTORY_MANAGE: "inventory.manage",
  REPORTS_VIEW: "reports.view",
  USERS_MANAGE: "users.manage",
  SETTINGS_MANAGE: "settings.manage",
  ATTENDANCE_MANAGE: "attendance.manage",
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: Object.values(PERMISSIONS),
  [ROLES.OWNER]: Object.values(PERMISSIONS),
  [ROLES.MANAGER]: [
    PERMISSIONS.ORDER_CREATE,
    PERMISSIONS.ORDER_REFUND,
    PERMISSIONS.ORDER_VOID,
    PERMISSIONS.MENU_MANAGE,
    PERMISSIONS.INVENTORY_MANAGE,
    PERMISSIONS.REPORTS_VIEW,
    PERMISSIONS.ATTENDANCE_MANAGE,
  ],
  [ROLES.CASHIER]: [PERMISSIONS.ORDER_CREATE],
  [ROLES.INVENTORY]: [PERMISSIONS.INVENTORY_MANAGE, PERMISSIONS.REPORTS_VIEW],
};

export function hasPermission(role, permission) {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
