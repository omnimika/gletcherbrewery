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
import { buildMapProductFilter } from "@/components/map/product-filter";
import styles from "./sales-map.module.css";

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function SalesMap({
  copy,
  accessToken,
}: {
  copy: MapCopy;
  accessToken: string | undefined;
}) {
  const mapNode = useRef<HTMLDivElement | null>(null);
  const frameNode = useRef<HTMLDivElement | null>(null);
  const geocoderNode = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const geolocateRef = useRef<mapboxgl.GeolocateControl | null>(null);
  const geocoderRef = useRef<MapboxGeocoder | null>(null);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const seriesOrder = useMemo(
    () =>
      (["classic", "craft", "limited", "aging"] as const).map((id) => ({
        id,
        label: copy.seriesLabels[id],
        beers: copy.beers.filter((b) => b.series === id),
      })),
    [copy],
  );

  const applyFilters = useCallback((next: ReadonlySet<string>) => {
    const map = mapRef.current;
    if (!map) return;
    const filter = buildMapProductFilter(
      next,
    ) as mapboxgl.FilterSpecification;
    for (const layerId of MAP_LAYERS) {
      if (!map.getLayer(layerId)) continue;
      map.setFilter(layerId, filter);
      map.setLayoutProperty(layerId, "visibility", "visible");
    }
  }, []);

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

    // Same as production map: track location via Mapbox control + panel button.
    // showUserHeading must stay false — Mapbox touches bare DeviceOrientationEvent
    // and throws ReferenceError in Safari builds where that binding is missing.
    const geolocate = new mapboxgl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserHeading: false,
    });
    geolocateRef.current = geolocate;
    map.addControl(geolocate);

    const onLoad = () => {
      if (cancelled) return;
      setReady(true);
      setError(null);
      applyFilters(selected);
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
      const feature = features[0];
      const props = feature.properties ?? {};
      const title = String(props.Title ?? "");
      const address = String(props.Adress ?? props.Address ?? "");
      const product = String(props.Product ?? "");
      const coords = (feature.geometry as GeoJSON.Point).coordinates as [
        number,
        number,
      ];

      new mapboxgl.Popup({ offset: [0, -15] })
        .setLngLat(coords)
        .setHTML(
          `<h2 style="color:#ff8462;font-size:1.1rem;margin:0 0 0.35rem">${escapeHtml(title)}</h2>` +
            `<p style="margin:0 0 0.5rem">${escapeHtml(address)}</p>` +
            `<p style="margin:0"><u>${escapeHtml(copy.assortmentLabel)}</u><br>${escapeHtml(product)}</p>`,
        )
        .addTo(map);
    });

    map.on("dblclick", (e) => {
      const features = map.queryRenderedFeatures(e.point, {
        layers: [...MAP_LAYERS],
      });
      if (features.length === 0) {
        setSelected(new Set());
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
      map.remove();
      mapRef.current = null;
      geolocateRef.current = null;
      setReady(false);
    };
    // selected intentionally omitted — filters applied via applyFilters effect
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
    applyFilters(selected);
  }, [selected, ready, applyFilters]);

  const toggleBeer = (key: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
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
    geolocateRef.current?.trigger();
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

          {/* Production comments out the h3 title; keep aria-label on aside. */}
          <aside className={styles.panel} aria-label={copy.filterTitle}>
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
              {seriesOrder.map((series) => (
                <div
                  key={series.id}
                  className={`${styles.series} ${seriesClass[series.id]}`}
                >
                  <span className={styles.seriesLabel}>{series.label}</span>
                  {series.beers.map((beer) => {
                    const active = selected.has(beer.key);
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
