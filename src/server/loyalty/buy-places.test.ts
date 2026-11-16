import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCabinetBuyPlaces,
  CABINET_BRANDED_BUY_PLACES,
  CABINET_BUY_PLACE_OTHER,
} from "./buy-places";

describe("buildCabinetBuyPlaces", () => {
  it("appends branded stores and Другой after map chains", () => {
    const places = buildCabinetBuyPlaces(["ЛЕНТА", "АШАН"]);
    assert.ok(places.includes("ЛЕНТА"));
    assert.ok(places.includes("АШАН"));
    for (const b of CABINET_BRANDED_BUY_PLACES) {
      assert.ok(places.includes(b));
    }
    assert.equal(places[places.length - 1], CABINET_BUY_PLACE_OTHER);
  });

  it("ignores CRM-only titles without map layer", () => {
    const places = buildCabinetBuyPlaces(["ПЯТЕРОЧКА", "ЛЕНТА"]);
    assert.ok(places.includes("ЛЕНТА"));
    assert.ok(!places.includes("ПЯТЕРОЧКА"));
  });
});
