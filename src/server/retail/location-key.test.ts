import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildLocationSourceKey } from "./location-key";
import { crmTitleForSourceTitle } from "./chain-layer-registry";

describe("buildLocationSourceKey", () => {
  it("keeps same coords+different adress distinct", () => {
    const a = buildLocationSourceKey({
      layerId: "hmel-i-solod",
      longitude: 36.689711,
      latitude: 56.367123,
      adress: "ул. Маяковского, д. 10",
      title: "ХМЕЛЬ И СОЛОД",
    });
    const b = buildLocationSourceKey({
      layerId: "hmel-i-solod",
      longitude: 36.689711,
      latitude: 56.367123,
      adress: "ул. Радужная, д. 13, к. 3",
      title: "ХМЕЛЬ И СОЛОД",
    });
    assert.notEqual(a, b);
  });
});

describe("crmTitleForSourceTitle", () => {
  it("maps source Title aliases to CRM titles", () => {
    assert.equal(crmTitleForSourceTitle("Ярче!"), "Ярче!");
    assert.equal(crmTitleForSourceTitle("Макси"), "МАКСИ");
    assert.equal(crmTitleForSourceTitle("Ароматный Мир"), "АРОМАТНЫЙ МИР");
    assert.equal(crmTitleForSourceTitle("5M Гурман"), null);
  });
});
