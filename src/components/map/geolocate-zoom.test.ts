import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  countUniquePointFeatures,
  featurePointKey,
  pickGeolocateZoom,
} from "./geolocate-zoom";

describe("featurePointKey / countUniquePointFeatures", () => {
  it("dedupes same coordinates+title", () => {
    const a = {
      geometry: { type: "Point", coordinates: [37.6, 55.7] },
      properties: { Title: "Магнит", Adress: "ул. 1" },
    };
    const b = { ...a };
    assert.equal(featurePointKey(a), featurePointKey(b));
    assert.equal(countUniquePointFeatures([a, b]), 1);
  });

  it("counts distinct points", () => {
    const features = [
      {
        geometry: { type: "Point", coordinates: [37.6, 55.7] },
        properties: { Title: "A" },
      },
      {
        geometry: { type: "Point", coordinates: [37.7, 55.8] },
        properties: { Title: "B" },
      },
    ];
    assert.equal(countUniquePointFeatures(features), 2);
  });
});

describe("pickGeolocateZoom", () => {
  it("picks highest zoom that still has ≥2 markers", () => {
    const zoom = pickGeolocateZoom({
      countAtZoom: (z) => (z >= 12 ? 1 : 5),
      maxZoom: 15,
      minZoom: 4,
      step: 0.5,
      minMarkers: 2,
    });
    assert.equal(zoom, 11.5);
  });

  it("keeps maxZoom when it already has enough markers", () => {
    const zoom = pickGeolocateZoom({
      countAtZoom: () => 10,
      maxZoom: 14,
      minZoom: 4,
    });
    assert.equal(zoom, 14);
  });

  it("falls back to minZoom when never enough markers", () => {
    const zoom = pickGeolocateZoom({
      countAtZoom: () => 1,
      maxZoom: 15,
      minZoom: 5,
    });
    assert.equal(zoom, 5);
  });
});
