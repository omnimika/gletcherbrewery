"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import {
  MAP_LAYERS,
  MAP_STYLE,
  mapBeerImageUrl,
  type MapCopy,
} from "@/content/map";
import {
  buildMapLayerFilter,
  listMapChainOptions,
} from "@/components/map/map-layer-filters";
import {
  countUniquePointFeatures,
  GEOLOCATE_MAX_ZOOM,
  GEOLOCATE_MIN_MARKERS,
  GEOLOCATE_MIN_ZOOM,
  GEOLOCATE_ZOOM_STEP,
} from "@/components/map/geolocate-zoom";
import styles from "./sales-map.module.css";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function waitForMapIdle(map: mapboxgl.Map, timeoutMs = 2500): Promise<void> {
  return new Promise((resolve) => {
    if (!map.isMoving() && !map.isZooming() && map.areTilesLoaded()) {
      resolve();
      return;
    }
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      map.off("idle", onIdle);
      resolve();
    };
    const onIdle = () => finish();
    map.once("idle", onIdle);
    window.setTimeout(finish, timeoutMs);
  });
}

async function resolveGeolocateZoom(
  map: mapboxgl.Map,
  center: [number, number],
  layerIds: readonly string[],
): Promise<number> {
  const layers = layerIds.filter((id) => map.getLayer(id));
  if (layers.length === 0) return Math.min(12, GEOLOCATE_MAX_ZOOM);

  const countNow = () => {
    const el = map.getCanvasContainer();
    const features = map.queryRenderedFeatures(
      [
        [0, 0],
        [el.clientWidth, el.clientHeight],
      ],
      { layers: [...layers] },
    );
    return countUniquePointFeatures(features);
  };

  // Fallback when the area has <2 filtered markers — still move in (geocoder-like).
  const FALLBACK_ZOOM = 11;

  // Wide first so the region’s tiles load; binary-search the tightest zoom
  // that still shows ≥2 filtered markers (current beer/chain filters).
  map.jumpTo({ center, zoom: GEOLOCATE_MIN_ZOOM });
  await waitForMapIdle(map);
  if (countNow() < GEOLOCATE_MIN_MARKERS) {
    map.jumpTo({ center, zoom: FALLBACK_ZOOM });
    return FALLBACK_ZOOM;
  }

  let lo = GEOLOCATE_MIN_ZOOM;
  let hi = GEOLOCATE_MAX_ZOOM;
  let best = GEOLOCATE_MIN_ZOOM;
  while (hi - lo > GEOLOCATE_ZOOM_STEP) {
    const mid = Math.round(((lo + hi) / 2) * 100) / 100;
    map.jumpTo({ center, zoom: mid });
    await waitForMapIdle(map, 1800);
    if (countNow() >= GEOLOCATE_MIN_MARKERS) {
      best = mid;
      lo = mid;
    } else {
      hi = mid;
    }
  }

  map.jumpTo({ center, zoom: best });
  return best;
}

export function SalesMap({
  copy,
  accessToken,
  chainTitlesWithAssortment,
}: {
  copy: MapCopy;
  accessToken: string | undefined;
  /** CRM titles with available SKU count > 0 (server-loaded). */
  chainTitlesWithAssortment: readonly string[];
}) {
  const mapNode = useRef<HTMLDivElement | null>(null);
  const frameNode = useRef<HTMLDivElement | null>(null);
  const geocoderNode = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const geocoderRef = useRef<MapboxGeocoder | null>(null);
  const popupRef = useRef<mapboxgl.Popup | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const geolocateAdjustingRef = useRef(false);
  const copyRef = useRef(copy);
  copyRef.current = copy;
  const [selectedBeers, setSelectedBeers] = useState<Set<string>>(
    () => new Set(),
  );
  const [selectedChains, setSelectedChains] = useState<Set<string>>(
    () => new Set(),
  );
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const chainOptions = useMemo(
    () => listMapChainOptions(chainTitlesWithAssortment),
    [chainTitlesWithAssortment],
  );

  const seriesOrder = useMemo(
    () =>
      (["classic", "craft", "limited", "aging"] as const).map((id) => ({
        id,
        label: copy.seriesLabels[id],
        beers: copy.beers.filter((b) => b.series === id),
      })),
    [copy],
  );

  /** Single-beer series share a row 50/50; multi-beer series keep a full row. */
  const seriesRows = useMemo(() => {
    const series = seriesOrder.filter((s) => s.beers.length > 0);
    const rows: Array<(typeof series)[number][]> = [];
    let i = 0;
    while (i < series.length) {
      const cur = series[i];
      const next = series[i + 1];
      if (cur.beers.length === 1 && next && next.beers.length === 1) {
        rows.push([cur, next]);
        i += 2;
        continue;
      }
      rows.push([cur]);
      i += 1;
    }
    return rows;
  }, [seriesOrder]);

  const applyFilters = useCallback(
    (beers: ReadonlySet<string>, chains: ReadonlySet<string>) => {
      const map = mapRef.current;
      if (!map) return;
      for (const layerId of MAP_LAYERS) {
        if (!map.getLayer(layerId)) continue;
        const { filter, visible } = buildMapLayerFilter(
          layerId,
          beers,
          chains,
        );
        map.setFilter(layerId, filter as mapboxgl.FilterSpecification);
        map.setLayoutProperty(
          layerId,
          "visibility",
          visible ? "visible" : "none",
        );
      }
    },
    [],
  );

  useEffect(() => {
    if (!accessToken || !mapNode.current) return;

    let cancelled = false;
    const geocoderHost = geocoderNode.current;
    mapboxgl.accessToken = accessToken;

    let map: mapboxgl.Map;
    try {
      map = new mapboxgl.Map({
        container: mapNode.current,
        style: MAP_STYLE.styleUrl,
        center: MAP_STYLE.center,
        zoom: MAP_STYLE.zoom,
        projection: MAP_STYLE.projection,
        antialias: true,
        attributionControl: true,
      });
    } catch {
      // Defer so the effect body stays sync-clean for the linter; still covers
      // synchronous WebGL init failures that never reach map.on("error").
      queueMicrotask(() => {
        if (!cancelled) setError(copy.loadError);
      });
      return () => {
        cancelled = true;
      };
    }

    mapRef.current = map;

    // Geolocate puck/camera: driven by navigator.geolocation in the panel button
    // (Mapbox GeolocateControl was unreliable in Chrome with a hidden control).

    const onLoad = () => {
      if (cancelled) return;
      setReady(true);
      setError(null);
      applyFilters(selectedBeers, selectedChains);
      map.resize();

      if (geocoderHost) {
        // Clear any leftover control DOM from a previous mount.
        geocoderHost.replaceChildren();
        const geocoder = new MapboxGeocoder({
          accessToken,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any -- geocoder expects mapboxgl namespace
          mapboxgl: mapboxgl as any,
          marker: false,
          placeholder: copy.geocoderPlaceholder,
        });
        geocoderRef.current = geocoder;
        geocoderHost.appendChild(geocoder.onAdd(map));
      }
    };

    const onError = (e: mapboxgl.ErrorEvent) => {
      if (cancelled) return;
      void e;
      setError(copy.loadError);
    };

    map.on("load", onLoad);
    map.on("error", onError);

    map.on("click", (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: [...MAP_LAYERS],
      });
      if (!features.length) return;
      e.originalEvent?.stopPropagation?.();
      const feature = features[0];
      const props = feature.properties ?? {};
      const title = String(props.Title ?? "");
      const address = String(props.Adress ?? props.Address ?? "");
      const product = String(props.Product ?? "");
      const geom = feature.geometry;
      if (!geom || geom.type !== "Point") return;
      const coords = geom.coordinates as [number, number];

      popupRef.current?.remove();
      // Markup matches production page__map.html; chrome styled in CSS module.
      popupRef.current = new mapboxgl.Popup({
        offset: [0, -15],
        maxWidth: "280px",
        closeButton: true,
        closeOnClick: true,
        className: styles.storePopup,
      })
        .setLngLat(coords)
        .setHTML(
          `<h2>${escapeHtml(title)}</h2>` +
            `<p>${escapeHtml(address)}</p>` +
            `<p><u>${escapeHtml(copy.assortmentLabel)}</u><br>${escapeHtml(product)}</p>`,
        )
        .addTo(map);
    });

    map.on("dblclick", (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: [...MAP_LAYERS],
      });
      if (features.length === 0) {
        setSelectedBeers(new Set());
        setSelectedChains(new Set());
      }
    });

    return () => {
      cancelled = true;
      const geocoder = geocoderRef.current;
      if (geocoder) {
        try {
          geocoder.onRemove();
        } catch {
          // Control may already be detached with the map.
        }
        geocoderRef.current = null;
      }
      geocoderHost?.replaceChildren();
      popupRef.current?.remove();
      popupRef.current = null;
      userMarkerRef.current?.remove();
      userMarkerRef.current = null;
      map.remove();
      mapRef.current = null;
      setReady(false);
    };
    // selectedBeers/chains intentionally omitted — filters via applyFilters effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    accessToken,
    applyFilters,
    copy.assortmentLabel,
    copy.geocoderPlaceholder,
    copy.loadError,
    retryKey,
  ]);

  useEffect(() => {
    if (!ready) return;
    applyFilters(selectedBeers, selectedChains);
  }, [selectedBeers, selectedChains, ready, applyFilters]);

  const toggleBeer = (key: string) => {
    setSelectedBeers((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleChain = (id: string) => {
    setSelectedChains((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearChainFilters = () => {
    setSelectedChains(new Set());
  };

  const requestFullscreen = () => {
    const target = frameNode.current ?? document.documentElement;
    if (!document.fullscreenElement) {
      void target.requestFullscreen?.();
      queueMicrotask(() => mapRef.current?.resize());
    } else {
      void document.exitFullscreen?.();
      queueMicrotask(() => mapRef.current?.resize());
    }
  };

  const triggerGeolocate = () => {
    const map = mapRef.current;
    if (!map || geolocateAdjustingRef.current) return;

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError(copyRef.current.geolocateError);
      return;
    }
    if (!window.isSecureContext) {
      setError(copyRef.current.geolocateError);
      return;
    }

    geolocateAdjustingRef.current = true;
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const center: [number, number] = [
          pos.coords.longitude,
          pos.coords.latitude,
        ];

        userMarkerRef.current?.remove();
        const puck = document.createElement("div");
        puck.className = styles.userPuck;
        puck.setAttribute("aria-hidden", "true");
        userMarkerRef.current = new mapboxgl.Marker({ element: puck })
          .setLngLat(center)
          .addTo(map);

        // Immediate feedback (geocoder-like), then refine to ≥2 markers.
        map.easeTo({ center, zoom: Math.max(map.getZoom(), 10), duration: 500 });

        void resolveGeolocateZoom(map, center, MAP_LAYERS)
          .then((zoom) => {
            map.easeTo({ center, zoom, duration: 900 });
          })
          .catch(() => {
            map.easeTo({ center, zoom: 11, duration: 900 });
          })
          .finally(() => {
            geolocateAdjustingRef.current = false;
          });
      },
      () => {
        geolocateAdjustingRef.current = false;
        setError(copyRef.current.geolocateError);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 30_000,
      },
    );
  };

  const retryMap = () => {
    setError(null);
    setReady(false);
    setRetryKey((k) => k + 1);
  };

  const seriesClass = {
    classic: styles.seriesClassic,
    craft: styles.seriesCraft,
    limited: styles.seriesLimited,
    aging: styles.seriesAging,
  } as const;

  if (!accessToken) {
    return (
      <div className={styles.page}>
        <section className={styles.missing} aria-labelledby="map-missing-title">
          <h1 id="map-missing-title" className={styles.pageTitle}>
            {copy.title}
          </h1>
          <p className={styles.missingBody}>{copy.missingToken}</p>
          <a
            href={copy.productionFallbackHref}
            className={styles.fallbackLink}
            rel="noopener noreferrer"
          >
            {copy.productionFallbackLabel}
          </a>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <h1 id="map-hero" className={styles.heroTitle}>
          {copy.heroLead}{" "}
          <span className={styles.heroAccent}>{copy.heroAccent}</span>
        </h1>
      </header>

      <section className={styles.frameWrap} aria-label={copy.title}>
        <div ref={frameNode} className={styles.frame}>
          <div ref={mapNode} className={styles.map} />

          {error && !ready ? (
            <div className={styles.missing} style={{ position: "absolute", inset: 0, zIndex: 30 }}>
              <p className={styles.missingBody}>{error}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                <button
                  type="button"
                  className={styles.fallbackLink}
                  onClick={retryMap}
                >
                  {copy.retryLabel}
                </button>
                <a
                  href={copy.productionFallbackHref}
                  className={styles.fallbackLink}
                  rel="noopener noreferrer"
                >
                  {copy.productionFallbackLabel}
                </a>
              </div>
            </div>
          ) : null}

          <aside
            className={styles.chainPanel}
            aria-label={copy.chainFilterTitle}
          >
            <div className={styles.filterHeading}>
              <span className={styles.filterHeadingLabel}>
                {copy.chainFilterTitle}
              </span>
              {selectedChains.size > 0 ? (
                <button
                  type="button"
                  className={styles.clearBtn}
                  onClick={clearChainFilters}
                >
                  {copy.clearFiltersLabel}
                </button>
              ) : null}
            </div>
            <div
              className={styles.chainGrid}
              role="group"
              aria-label={copy.chainFilterTitle}
            >
              {chainOptions.map((chain) => {
                const active = selectedChains.has(chain.id);
                return (
                  <button
                    key={chain.id}
                    type="button"
                    className={`${styles.chainBtn}${active ? ` ${styles.chainBtnActive}` : ""}`}
                    aria-pressed={active}
                    title={chain.label}
                    onClick={() => toggleChain(chain.id)}
                  >
                    {chain.logoSrc ? (
                      // eslint-disable-next-line @next/next/no-img-element -- local filter thumbs
                      <img
                        src={chain.logoSrc}
                        alt=""
                        className={styles.chainImg}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <span className={styles.chainFallback}>
                        {chain.label.slice(0, 2)}
                      </span>
                    )}
                    <span className={styles.chainName}>{chain.label}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* Production comments out the h3 title; keep aria-label on aside. */}
          <aside className={styles.panel} aria-label={copy.beerFilterTitle}>
            <div className={styles.controls}>
              <div className={styles.controlsRow}>
                <button
                  type="button"
                  className={styles.controlBtn}
                  onClick={triggerGeolocate}
                  aria-label={copy.geolocateLabel}
                  title={copy.geolocateLabel}
                >
                  <LocateIcon />
                </button>
                <button
                  type="button"
                  className={styles.controlBtn}
                  onClick={requestFullscreen}
                  aria-label={copy.fullscreenLabel}
                  title={copy.fullscreenLabel}
                >
                  <FullscreenIcon />
                </button>
              </div>
              <div ref={geocoderNode} className={styles.geocoder} />
            </div>

            {error && ready ? <p className={styles.error}>{error}</p> : null}

            <div className={styles.seriesList}>
              {seriesRows.map((row) => (
                <div
                  key={row.map((s) => s.id).join("-")}
                  className={styles.seriesRow}
                >
                  {row.map((series) => (
                    <div
                      key={series.id}
                      className={`${styles.series} ${seriesClass[series.id]}${
                        row.length > 1 ? ` ${styles.seriesHalf}` : ""
                      }`}
                    >
                      <span className={styles.seriesLabel}>{series.label}</span>
                      {series.beers.map((beer) => {
                        const active = selectedBeers.has(beer.key);
                        return (
                          <button
                            key={beer.key}
                            type="button"
                            className={`${styles.beerBtn}${active ? ` ${styles.beerBtnActive}` : ""}`}
                            aria-pressed={active}
                            title={beer.key}
                            onClick={() => toggleBeer(beer.key)}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element -- remote filter thumbs */}
                            <img
                              src={mapBeerImageUrl(beer)}
                              alt={beer.key}
                              className={styles.beerImg}
                              loading="lazy"
                              decoding="async"
                            />
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

function FullscreenIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
    </svg>
  );
}

function LocateIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
    </svg>
  );
}
