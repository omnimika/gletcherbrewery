import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { ensureRetailPointLayersVisible } from "./ensure-retail-point-layers";

type FakeLayer = {
  id: string;
  type: string;
  source?: string;
  "source-layer"?: string;
};

function createFakeMap(layers: FakeLayer[], icons: Record<string, unknown>) {
  const layerMap = new Map(layers.map((l) => [l.id, { ...l }]));
  const styleLayers = [...layers];
  const added: unknown[] = [];

  return {
    added,
    map: {
      getLayer(id: string) {
        return layerMap.get(id);
      },
      getLayoutProperty(id: string, key: string) {
        if (key !== "icon-image") return undefined;
        if (!(id in icons)) throw new Error("missing");
        return icons[id];
      },
      getFilter() {
        return null;
      },
      getStyle() {
        return { layers: styleLayers };
      },
      removeLayer(id: string) {
        layerMap.delete(id);
        const idx = styleLayers.findIndex((l) => l.id === id);
        if (idx >= 0) styleLayers.splice(idx, 1);
      },
      addLayer(layer: FakeLayer, beforeId?: string) {
        layerMap.set(layer.id, layer);
        const idx = beforeId
          ? styleLayers.findIndex((l) => l.id === beforeId)
          : -1;
        if (idx >= 0) styleLayers.splice(idx, 0, layer);
        else styleLayers.push(layer);
        added.push({ layer, beforeId });
      },
    },
  };
}

describe("ensureRetailPointLayersVisible", () => {
  it("rebuilds symbol layers without usable icon-image as circles", () => {
    const { map, added } = createFakeMap(
      [
        {
          id: "hmel-i-solod",
          type: "symbol",
          source: "composite",
          "source-layer": "hmel-i-solod",
        },
        {
          id: "maksi",
          type: "symbol",
          source: "composite",
          "source-layer": "maksi",
        },
      ],
      {
        "hmel-i-solod": "",
        maksi: "maksi-sm",
      },
    );

    const repaired = ensureRetailPointLayersVisible(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test fake
      map as any,
      ["hmel-i-solod", "maksi"],
    );

    assert.deepEqual(repaired, ["hmel-i-solod"]);
    assert.equal(added.length, 1);
    assert.equal((added[0] as { layer: FakeLayer }).layer.type, "circle");
    assert.equal(map.getLayer("maksi")?.type, "symbol");
    assert.equal(map.getLayer("hmel-i-solod")?.type, "circle");
  });

  it("treats empty step icon expressions as unusable", () => {
    const { map, added } = createFakeMap(
      [
        {
          id: "locals-abroad",
          type: "symbol",
          source: "mapbox://x",
          "source-layer": "y",
        },
      ],
      {
        "locals-abroad": ["step", ["zoom"], "", 16, "", 22, ""],
      },
    );

    const repaired = ensureRetailPointLayersVisible(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- test fake
      map as any,
      ["locals-abroad"],
    );
    assert.deepEqual(repaired, ["locals-abroad"]);
    assert.equal(added.length, 1);
  });
});
