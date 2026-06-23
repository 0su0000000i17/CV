import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

import { BLOCKED_HOSTNAMES } from "../constants.js";

export function isBlockedHostname(hostname: string): boolean {
  const normalizedHostname = hostname.toLowerCase();

  if (BLOCKED_HOSTNAMES.has(normalizedHostname)) {
    return true;
  }

  if (normalizedHostname.endsWith(".localhost")) {
    return true;
  }

  const ipVersion = isIP(normalizedHostname);

  if (ipVersion) {
    return isBlockedIpAddress(normalizedHostname);
  }

  return false;
}

export async function assertPublicHostname(hostname: string) {
  if (isBlockedHostname(hostname)) {
    throw new Error("Blocked hostname");
  }

  const ipVersion = isIP(hostname);

  if (ipVersion) {
    if (isBlockedIpAddress(hostname)) {
      throw new Error("Blocked IP address");
    }

    return;
  }

  const addresses = await lookup(hostname, {
    all: true,
    verbatim: false,
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
  const ipVersion = isIP(address);

  if (ipVersion === 4) {
    const [first, second, third] = address.split(".").map(Number);

    return (
      first === 0 ||
      first === 10 ||
      first === 127 ||
      first >= 224 ||
      (first === 100 && second >= 64 && second <= 127) ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 168) ||
      (first === 192 && second === 0 && third === 0) ||
      (first === 192 && second === 0 && third === 2) ||
      (first === 198 && (second === 18 || second === 19)) ||
      (first === 198 && second === 51 && third === 100) ||
      (first === 203 && second === 0 && third === 113)
    );
  }

  if (ipVersion === 6) {
    const normalizedAddress = address.toLowerCase();

    if (
      normalizedAddress === "::" ||
      normalizedAddress === "::1" ||
      normalizedAddress.startsWith("fe80:") ||
      normalizedAddress.startsWith("fc") ||
      normalizedAddress.startsWith("fd")
    ) {
      return true;
    }

    if (normalizedAddress.startsWith("::ffff:")) {
      const mappedIpv4 = normalizedAddress.split(":").at(-1);

      return mappedIpv4 ? isBlockedIpAddress(mappedIpv4) : true;
    }
  }

  return false;
}