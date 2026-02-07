/**
 * Utilidades para manejo de roles y permisos
 */

export type UserRole = "user" | "superadmin";

/**
 * Define las rutas protegidas y qué roles pueden acceder
 */
export const PROTECTED_ROUTES: Record<string, UserRole[]> = {
  "/dashboard/usuarios": ["superadmin"],
  // Bots es accesible para ambos roles
  "/dashboard/traders": ["user", "superadmin"],
  // Rutas accesibles solo por users
  "/dashboard": ["user", "superadmin"],
  "/dashboard/wallets": ["user", "superadmin"],
  "/dashboard/operaciones": ["user", "superadmin"],
  "/dashboard/convert": ["user", "superadmin"],
  "/dashboard/configuracion": ["user", "superadmin"],
  "/dashboard/overview": ["user", "superadmin"],
};

/**
 * Verifica si un rol es superadmin
 */
export function isSuperAdmin(role?: string): boolean {
  return role === "superadmin";
}

/**
 * Verifica si un rol puede acceder a una ruta específica
 */
export function canAccessRoute(role: UserRole, path: string): boolean {
  // Normalizar path (remover trailing slash)
  const normalizedPath = path.endsWith("/") && path !== "/" 
    ? path.slice(0, -1) 
    : path;

  // Buscar la ruta exacta o el prefijo más específico
  const allowedRoles = PROTECTED_ROUTES[normalizedPath];
  
  if (!allowedRoles) {
    // Si la ruta no está en la lista, buscar por prefijo
    const matchingRoute = Object.keys(PROTECTED_ROUTES).find(route => 
      normalizedPath.startsWith(route)
    );
    
    if (matchingRoute) {
      return PROTECTED_ROUTES[matchingRoute].includes(role);
    }
    
    // Por defecto, permitir acceso si no hay restricción específica
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
  icon: string; // Nombre del icono de lucide-react
}

/**
 * Obtiene los items del menú según el rol del usuario
 */
export function getMenuItems(role: UserRole): NavItem[] {
  if (role === "superadmin") {
    return [
      { href: "/dashboard", label: "HOME", icon: "Home" },
      { href: "/dashboard/overview", label: "OVERVIEW", icon: "Activity" },
      { href: "/dashboard/requests", label: "SOLICITUDES", icon: "Mail" },
      { href: "/dashboard/traders", label: "TRADERS", icon: "ChartNoAxesCombined" },
      { href: "/dashboard/usuarios", label: "USUARIOS", icon: "Users" },
    ];
  }

  // Usuario normal
  return [
    { href: "/dashboard", label: "HOME", icon: "Home" },
    { href: "/dashboard/overview", label: "OVERVIEW", icon: "Activity" },
    { href: "/dashboard/traders", label: "TRADERS", icon: "ChartNoAxesCombined" },
    { href: "/dashboard/wallets", label: "WALLETS", icon: "Wallet" },
    { href: "/dashboard/operaciones", label: "OPERACIONES", icon: "Activity" },
    { href: "/dashboard/convert", label: "CONVERSOR", icon: "Calculator" },
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
