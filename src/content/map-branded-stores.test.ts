import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  brandedStoresGeoJson,
  MAP_BRANDED_FALLBACK_POINTS,
  MAP_BRANDED_STORE_OPTIONS,
} from "./map-branded-stores";

describe("map branded stores", () => {
  it("exposes Gletcher + SVAM filter options", () => {
    assert.equal(MAP_BRANDED_STORE_OPTIONS.length, 2);
    assert.deepEqual(
      MAP_BRANDED_STORE_OPTIONS.map((s) => s.filterLabel),
      ["Gletcher Brewery", "SVAM Group"],
    );
  });

  it("builds GeoJSON with brandId filter property", () => {
    const geo = brandedStoresGeoJson(MAP_BRANDED_FALLBACK_POINTS);
    assert.equal(geo.features.length, 2);
    for (const f of geo.features) {
      assert.equal(f.geometry?.type, "Point");
      if (!f.geometry || f.geometry.type !== "Point") {
        assert.fail("expected Point");
      }
      assert.equal(f.geometry.coordinates.length, 2);
      assert.ok(
        typeof f.properties?.id === "string" && f.properties.id.length > 0,
      );
    }
    assert.deepEqual(
      geo.features.map((f) => f.properties?.id),
      ["gletcher-brewery", "svam-group"],
    );
    // Klin lng ~36.7, Moscow lng ~37.3 (not swapped lat)
    const g0 = geo.features[0].geometry;
    assert.ok(g0 && g0.type === "Point");
    const klin = g0.coordinates;
    assert.ok(klin[0] > 30 && klin[0] < 40);
    assert.ok(klin[1] > 50 && klin[1] < 60);
  });
});
