import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { annotateRetailRows, buildAnomalyReport } from "./anomalies";
import {
  parseRetailCsv,
  parseRetailGeoJson,
  splitProductTokens,
} from "./parse";

describe("retail parse", () => {
  it("parses CSV with historical headers", () => {
    const csv = `Type,Title,City,Adress,Product,Packing,Longitude,Latitude
chain,Лента,Москва,ул. 1,Ausweis,0.5,37.6,55.7
`;
    const rows = parseRetailCsv(csv, "t.csv");
    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.title, "Лента");
    assert.equal(rows[0]?.adress, "ул. 1");
    assert.equal(rows[0]?.product, "Ausweis");
    assert.equal(rows[0]?.longitude, 37.6);
    assert.equal(rows[0]?.latitude, 55.7);
  });

  it("accepts Address alias but stores as adress", () => {
    const csv = `Title,Address,Longitude,Latitude
Shop,Street 2,30.3,59.9
`;
    const rows = parseRetailCsv(csv, "a.csv");
    assert.equal(rows[0]?.adress, "Street 2");
  });

  it("parses GeoJSON Point coordinates", () => {
    const geo = JSON.stringify({
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {
            Title: "X",
            Adress: "Y",
            Product: "Friday Avenue",
          },
          geometry: { type: "Point", coordinates: [37.1, 55.2] },
        },
      ],
    });
    const rows = parseRetailGeoJson(geo, "t.geojson");
    assert.equal(rows[0]?.longitude, 37.1);
    assert.equal(rows[0]?.latitude, 55.2);
    assert.equal(rows[0]?.product, "Friday Avenue");
  });

  it("splits Product tokens", () => {
    assert.deepEqual(splitProductTokens("A, B; C"), ["A", "B", "C"]);
  });
});

describe("retail anomalies", () => {
  it("flags duplicates and outside bbox without deleting", () => {
    const rows = parseRetailGeoJson(
      JSON.stringify({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              Title: "A",
              Adress: "1",
              Product: "Ausweis",
            },
            geometry: { type: "Point", coordinates: [37.0, 55.0] },
          },
          {
            type: "Feature",
            properties: {
              Title: "A",
              Adress: "1",
              Product: "Ausweis",
            },
            geometry: { type: "Point", coordinates: [37.0, 55.0] },
          },
          {
            type: "Feature",
            properties: {
              Title: "Paris",
              Adress: "FR",
              Product: "Ausweis",
            },
            geometry: { type: "Point", coordinates: [2.35, 48.85] },
          },
        ],
      }),
      "dup.geojson",
    );
    const annotated = annotateRetailRows(rows);
    assert.equal(annotated.length, 3);
    assert.ok(annotated[0]?.anomalyCodes.includes("duplicate_title_adress"));
    assert.ok(annotated[0]?.anomalyCodes.includes("duplicate_coords"));
    assert.ok(annotated[2]?.anomalyCodes.includes("coords_outside_ru_bbox"));
    const report = buildAnomalyReport(annotated);
    assert.equal(report.duplicateTitleAdressGroups, 1);
    assert.equal(report.duplicateCoordGroups, 1);
  });
});
