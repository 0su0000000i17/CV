import assert from "node:assert/strict";
import test from "node:test";

import {
  isBlockedHostname,
  isBlockedIpAddress,
} from "./ip-address-guards.js";

test("blocks non-public IPv4 and IPv6 address ranges", () => {
  const blocked = [
    "127.0.0.1",
    "10.0.0.1",
    "100.64.0.1",
    "169.254.169.254",
    "172.31.0.1",
    "192.168.1.1",
    "224.0.0.1",
    "::1",
    "fe90::1",
    "ff02::1",
    "fc00::1",
    "2001:db8::1",
    "::ffff:127.0.0.1",
    "::ffff:7f00:1",
  ];

  blocked.forEach((address) => assert.equal(isBlockedIpAddress(address), true));
});

test("allows globally routable unicast addresses", () => {
  assert.equal(isBlockedIpAddress("8.8.8.8"), false);
  assert.equal(isBlockedIpAddress("2606:4700:4700::1111"), false);
});

test("blocks local hostnames and bracketed private literals", () => {
  assert.equal(isBlockedHostname("localhost"), true);
  assert.equal(isBlockedHostname("api.localhost"), true);
  assert.equal(isBlockedHostname("[::1]"), true);
});
