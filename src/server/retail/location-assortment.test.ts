import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildLocationSourceKey } from "./location-key";

describe("location override source keys", () => {
  it("keeps two stores of the same chain on distinct keys", () => {
    const a = buildLocationSourceKey({
      layerId: "maksi",
      longitude: 37.6,
      latitude: 55.7,
      adress: "ул. Тест, 1",
      title: "МАКСИ",
    });
    const b = buildLocationSourceKey({
      layerId: "maksi",
      longitude: 37.7,
      latitude: 55.8,
      adress: "ул. Другая, 2",
      title: "МАКСИ",
    });
    assert.notEqual(a, b);
  });
});
