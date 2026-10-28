// Collects every module's pages and menu items automatically.
const routeFiles = import.meta.glob('../modules/*/routes.jsx', { eager: true });
const navFiles = import.meta.glob('../modules/*/nav.js', { eager: true });

export function getModuleRoutes() {
  const routes = [];
  for (const file of Object.values(routeFiles)) {
    routes.push(...file.default);
  }
  return routes;
}

export function getNavItems(role) {
  const items = [];
  for (const file of Object.values(navFiles)) {
    items.push(...file.default);
  }
  const visible = items.filter((item) => !item.roles || item.roles.includes(role));
  return visible.sort((first, second) => first.order - second.order);
}
