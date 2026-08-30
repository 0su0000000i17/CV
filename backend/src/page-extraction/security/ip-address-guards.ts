import { lookup } from "node:dns/promises";
import ipaddr from "ipaddr.js";

import { BLOCKED_HOSTNAMES } from "../constants.js";

export function isBlockedHostname(hostname: string): boolean {
  const normalizedHostname = normalizeHostname(hostname);

  if (BLOCKED_HOSTNAMES.has(normalizedHostname)) {
    return true;
  }

  if (normalizedHostname.endsWith(".localhost")) {
    return true;
  }

  if (ipaddr.isValid(normalizedHostname)) {
    return isBlockedIpAddress(normalizedHostname);
  }

  return false;
}

export async function assertPublicHostname(hostname: string) {
  const normalizedHostname = normalizeHostname(hostname);

  if (isBlockedHostname(normalizedHostname)) {
    throw new Error("Blocked hostname");
  }

  if (ipaddr.isValid(normalizedHostname)) {
    if (isBlockedIpAddress(normalizedHostname)) {
      throw new Error("Blocked IP address");
    }

    return;
  }

  const addresses = await lookup(normalizedHostname, {
    all: true,
    verbatim: true,
  });

  if (!addresses.length) {
    throw new Error("Hostname does not resolve");
  }

  const blockedAddress = addresses.find(({ address }) =>
    isBlockedIpAddress(address)
  );

  if (blockedAddress) {
    throw new Error("Hostname resolves to blocked IP address");
  }
}

export function isBlockedIpAddress(address: string): boolean {
  try {
    const parsed = ipaddr.parse(normalizeHostname(address));

    if (parsed instanceof ipaddr.IPv6 && parsed.isIPv4MappedAddress()) {
      return isBlockedIpAddress(parsed.toIPv4Address().toString());
    }

    return parsed.range() !== "unicast";
  } catch {
    return true;
  }
}

function normalizeHostname(hostname: string) {
  const normalized = hostname.trim().toLowerCase();
  return normalized.startsWith("[") && normalized.endsWith("]")
    ? normalized.slice(1, -1)
    : normalized;
}
