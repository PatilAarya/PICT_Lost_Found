// Finds every module's pages and menu items automatically, so adding a module
// never means editing a shared router. import.meta.glob is a Vite feature: at build
// time it collects all files matching the pattern, as if we had imported each by hand.
// Frozen after Phase 0.

// eager: true loads them straight away, so we get the modules, not promises.
const routeFiles = import.meta.glob('../modules/*/routes.jsx', { eager: true });
const navFiles = import.meta.glob('../modules/*/nav.js', { eager: true });

// Every route from every modules/<name>/routes.jsx: [{ path, element, roles? }].
export function getModuleRoutes() {
  const routes = [];
  for (const file of Object.values(routeFiles)) {
    routes.push(...file.default);
  }
  return routes;
}

// The menu items this role may see, sorted by their `order` number.
export function getNavItems(role) {
  const items = [];
  for (const file of Object.values(navFiles)) {
    items.push(...file.default);
  }
  const visible = items.filter((item) => !item.roles || item.roles.includes(role));
  return visible.sort((first, second) => first.order - second.order);
}
