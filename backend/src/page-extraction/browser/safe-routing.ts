import type { BrowserContext, Route } from "playwright";

import { BLOCKED_RESOURCE_TYPES } from "../constants.js";
import { isAllowedPlaywrightRequestUrl } from "../security/validate-public-url.js";

async function routePublicResource(route: Route) {
  const request = route.request();
  if (BLOCKED_RESOURCE_TYPES.has(request.resourceType())) {
    await route.abort();
    return;
  }
  if (!(await isAllowedPlaywrightRequestUrl(request.url()))) {
    await route.abort();
    return;
  }
  await route.continue();
}

export async function installSafeRouting(context: BrowserContext) {
  await context.route("**/*", routePublicResource);
}
