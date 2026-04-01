/**
 * Utilidades para manejo de roles y permisos
 */

export type UserRole = "user" | "superadmin" | "trader";

/**
 * Define las rutas protegidas y qué roles pueden acceder
 */
export const PROTECTED_ROUTES: Record<string, UserRole[]> = {
  "/dashboard/usuarios": ["superadmin"],
  // Bots es accesible para todos los roles
  "/dashboard/traders": ["user", "superadmin", "trader"],
  // Rutas accesibles por todos
  "/dashboard": ["user", "superadmin", "trader"],
  // "/dashboard/wallets": ["user", "superadmin", "trader"],
  "/dashboard/operaciones": ["user", "superadmin", "trader"],
  "/dashboard/convert": ["user", "superadmin", "trader"],
  "/dashboard/configuracion": ["user", "superadmin", "trader"],
  "/dashboard/overview": ["user", "superadmin", "trader"],

  // Trading Models Routes
  "/dashboard/copy-trader/accounts": ["user", "superadmin", "trader"],
  "/dashboard/copy-trader/templates": ["user", "superadmin", "trader"],
  "/dashboard/copy-trader/configs": ["superadmin", "trader"],
};

/**
 * Verifica si un rol es superadmin
 */
export function isSuperAdmin(role?: string): boolean {
  return role === "superadmin";
}

/**
 * Verifica si un rol puede crear masters/templates
 */
export function canManageStrategies(role?: string): boolean {
  return role === "superadmin" || role === "trader";
}

/**
 * Verifica si un rol puede acceder a una ruta específica
 */
export function canAccessRoute(role: UserRole, path: string): boolean {
  const normalizedPath = path.endsWith("/") && path !== "/"
    ? path.slice(0, -1)
    : path;

  const allowedRoles = PROTECTED_ROUTES[normalizedPath];

  if (!allowedRoles) {
    const matchingRoute = Object.keys(PROTECTED_ROUTES).find(route =>
      normalizedPath.startsWith(route)
    );

    if (matchingRoute) {
      return PROTECTED_ROUTES[matchingRoute].includes(role);
    }

    return true;
  }

  return allowedRoles.includes(role);
}

/**
 * Items de navegación según el rol
 */
export interface NavItem {
  href: string;
  label: string;
  icon: string;
  children?: NavItem[];
}

/**
 * Obtiene los items del menú según el rol del usuario
 */
export function getMenuItems(role: UserRole): NavItem[] {
  const baseItems = [
    { href: "/dashboard", label: "HOME", icon: "Home" },
    { href: "/dashboard/overview", label: "OVERVIEW", icon: "Activity" },
    { href: "/dashboard/traders", label: "TRADERS", icon: "ChartNoAxesCombined" },
  ];

  const copyTraderGroup: NavItem = {
    href: "#",
    label: "MODELOS",
    icon: "Copy",
    children: [
      { href: "/dashboard/copy-trader/accounts", label: role === "user" ? "MIS CUENTAS" : "CUENTAS", icon: "Activity" },
      { href: "/dashboard/copy-trader/templates", label: role === "user" ? "PLANTILLAS" : "PLANTILLAS", icon: "Layout" },
    ]
  };

  if (role === "superadmin" || role === "trader") {
    // Add CONFIGS only for admins/traders
    copyTraderGroup.children?.push({
      href: "/dashboard/copy-trader/configs",
      label: "CONFIGS",
      icon: "Settings2"
    });

    const adminItems = [
      ...baseItems,
      copyTraderGroup
    ];

    if (role === "superadmin") {
      adminItems.push(
        { href: "/dashboard/requests", label: "SOLICITUDES", icon: "Mail" },
        { href: "/dashboard/usuarios", label: "USUARIOS", icon: "Users" }
      );
    }

    return adminItems;
  }

  // Usuario normal / Cliente
  return [
    ...baseItems,
    copyTraderGroup,
    // { href: "/dashboard/wallets", label: "WALLETS", icon: "Wallet" },
    // { href: "/dashboard/operaciones", label: "OPERACIONES", icon: "Activity" },
  ];
}

/**
 * Items de configuración (visible para ambos roles)
 */
export const SETTINGS_ITEM: NavItem = {
  href: "/dashboard/configuracion",
  label: "CONFIGURACION",
  icon: "Settings",
};
