import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  bindingForChainTitle,
  chainMapStatusSortKey,
  crmTitleToSourceTitles,
  resolveChainMapStatus,
} from "./chain-layer-registry";

describe("chain-layer-registry", () => {
  it("maps АШАН to auchan-atak with source aliases", () => {
    const b = bindingForChainTitle("АШАН");
    assert.equal(b?.layerId, "auchan-atak");
    assert.ok(b?.sourceTitles.includes("Ашан"));
  });

  it("keeps EuroSPAR Kaliningrad titles distinct from mainland", () => {
    const mainland = bindingForChainTitle("EuroSPAR");
    const kgd = bindingForChainTitle("EuroSPAR (Калининград)");
    assert.deepEqual(mainland?.sourceTitles, ["EuroSPAR"]);
    assert.ok(!kgd?.sourceTitles.includes("EuroSPAR"));
    assert.equal(kgd?.sourceTitlesUnverified, true);
    const aliases = crmTitleToSourceTitles();
    assert.ok(!aliases["EuroSPAR (Калининград)"]?.includes("EuroSPAR"));
  });

  it("maps МАКСИ to maksi layer", () => {
    const b = bindingForChainTitle("МАКСИ");
    assert.equal(b?.layerId, "maksi");
    assert.ok(b?.sourceTitles.includes("Макси"));
    assert.equal(resolveChainMapStatus("МАКСИ", 4), "on_map");
  });

  it("marks CRM-only chains without a layer", () => {
    assert.equal(bindingForChainTitle("ВКУСВИЛЛ")?.layerId, null);
    assert.equal(resolveChainMapStatus("ВКУСВИЛЛ", 0), "crm_only_empty");
    assert.equal(resolveChainMapStatus("ВКУСВИЛЛ", 2), "crm_only");
  });

  it("flags empty on-map chains for hide-after-publish", () => {
    assert.equal(resolveChainMapStatus("SELGROS", 0), "on_map_empty");
    assert.equal(resolveChainMapStatus("SELGROS", 1), "on_map");
    assert.ok(
      chainMapStatusSortKey("on_map") < chainMapStatusSortKey("on_map_empty"),
    );
  });
});
