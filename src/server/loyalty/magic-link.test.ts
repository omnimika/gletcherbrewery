import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  _hashForTests,
  _safeEqualForTests,
  isDeploymentLikeEnvironment,
  isMagicLinkDebugEnabled,
} from "./magic-link";
import { getMagicLinkDelivery } from "./mail";

describe("magic-link hashing", () => {
  it("hashes deterministically and compares safely", () => {
    const a = _hashForTests("token-one");
    const b = _hashForTests("token-one");
    const c = _hashForTests("token-two");
    assert.equal(a, b);
    assert.notEqual(a, c);
    assert.equal(_safeEqualForTests(a, b), true);
    assert.equal(_safeEqualForTests(a, c), false);
  });
});

describe("R04 magic-link debug guard", () => {
  it("allows debug only when flag=1 and not deployment-like", () => {
    assert.equal(
      isMagicLinkDebugEnabled({
        LOYALTY_MAGIC_LINK_DEBUG: "1",
        NODE_ENV: "development",
      }),
      true,
    );
    assert.equal(
      isMagicLinkDebugEnabled({
        LOYALTY_MAGIC_LINK_DEBUG: "0",
        NODE_ENV: "development",
      }),
      false,
    );
  });

  it("fail-closes debug on production / cloud markers even if DEBUG=1", () => {
    assert.equal(
      isMagicLinkDebugEnabled({
        LOYALTY_MAGIC_LINK_DEBUG: "1",
        NODE_ENV: "production",
      }),
      false,
    );
    assert.equal(
      isMagicLinkDebugEnabled({
        LOYALTY_MAGIC_LINK_DEBUG: "1",
        NODE_ENV: "development",
        VERCEL: "1",
      }),
      false,
    );
    assert.equal(
      isMagicLinkDebugEnabled({
        LOYALTY_MAGIC_LINK_DEBUG: "1",
        NODE_ENV: "development",
        YANDEX_CLOUD: "1",
      }),
      false,
    );
    assert.equal(
      isMagicLinkDebugEnabled({
        LOYALTY_MAGIC_LINK_DEBUG: "1",
        NODE_ENV: "development",
        LOYALTY_FORCE_SECURE_AUTH: "1",
      }),
      false,
    );
  });

  it("getMagicLinkDelivery follows the same guard", () => {
    assert.equal(
      getMagicLinkDelivery({
        LOYALTY_MAGIC_LINK_DEBUG: "1",
        NODE_ENV: "production",
      }).mode,
      "none",
    );
    assert.equal(
      getMagicLinkDelivery({
        LOYALTY_MAGIC_LINK_DEBUG: "1",
        NODE_ENV: "development",
      }).mode,
      "debug",
    );
  });

  it("detects deployment-like env", () => {
    assert.equal(isDeploymentLikeEnvironment({ NODE_ENV: "production" }), true);
    assert.equal(
      isDeploymentLikeEnvironment({ NODE_ENV: "development" }),
      false,
    );
  });
});
