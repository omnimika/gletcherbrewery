import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildAgentApplicationIntentKey } from "./agent-applications";

describe("agent application intent key", () => {
  it("is stable for same payload and changes when a field changes", () => {
    const base = {
      phone: "+7 900 000-00-00",
      city: "Москва",
      venueName: "Бар Тест",
      venueType: "Бар",
      venueAddress: "ул. Тестовая, 1",
      venueBoss: "Иван",
      comment: null as string | null,
    };
    const a = buildAgentApplicationIntentKey("member-1", base);
    const b = buildAgentApplicationIntentKey("member-1", base);
    assert.equal(a, b);
    assert.equal(a.length, 40);

    const c = buildAgentApplicationIntentKey("member-1", {
      ...base,
      venueName: "Бар Другой",
    });
    assert.notEqual(a, c);

    const d = buildAgentApplicationIntentKey("member-2", base);
    assert.notEqual(a, d);
  });
});
