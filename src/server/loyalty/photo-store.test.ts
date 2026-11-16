import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { sanitizeLegacyPhotoUrl } from "./photo-store";

describe("sanitizeLegacyPhotoUrl", () => {
  it("keeps http(s) URLs", () => {
    assert.equal(
      sanitizeLegacyPhotoUrl(
        "https://tupwidget.com/abc/image_tilda123.jpg",
      ),
      "https://tupwidget.com/abc/image_tilda123.jpg",
    );
  });

  it("rejects non-http schemes and junk", () => {
    assert.equal(sanitizeLegacyPhotoUrl("javascript:alert(1)"), null);
    assert.equal(sanitizeLegacyPhotoUrl("not a url"), null);
    assert.equal(sanitizeLegacyPhotoUrl(""), null);
  });
});
