import assert from "node:assert/strict";
import { test } from "node:test";
import { trafficSource } from "../src/lib/traffic-source";

test("a link tag wins over the referrer", () => {
  assert.equal(trafficSource("Resume", "https://www.google.com/", "portfolio.jmraut.dev"), "resume");
});

test("the referring site is reduced to its host", () => {
  assert.equal(trafficSource(undefined, "https://www.linkedin.com/feed/?x=1", "portfolio.jmraut.dev"), "linkedin.com");
});

test("own site, junk and unsafe tags give no source", () => {
  assert.equal(trafficSource(undefined, "https://portfolio.jmraut.dev/notes", "portfolio.jmraut.dev:443"), null);
  assert.equal(trafficSource(undefined, "", "portfolio.jmraut.dev"), null);
  assert.equal(trafficSource(undefined, "javascript:alert(1)", "portfolio.jmraut.dev"), null);
  assert.equal(trafficSource("<script>", undefined, "x"), null);
});
