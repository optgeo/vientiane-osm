import maplibregl from "maplibre-gl";
import { Protocol } from "pmtiles";
import { DARK, layers } from "@protomaps/basemaps";
import { LayerControl } from "maplibre-gl-layer-control";
import "maplibre-gl/dist/maplibre-gl.css";
import "maplibre-gl-layer-control/style.css";
import "./style.css";

// ---------------------------------------------------------------------------
// PMTiles protocol
// ---------------------------------------------------------------------------
const protocol = new Protocol();
maplibregl.addProtocol("pmtiles", protocol.tile.bind(protocol));

// ---------------------------------------------------------------------------
// Basemap layers – Protomaps DARK with system fonts
// ---------------------------------------------------------------------------
const baseLayers = layers("protomaps", DARK).map((layer) => {
  if (layer.layout && layer.layout["text-font"]) {
    return {
      ...layer,
      layout: { ...layer.layout, "text-font": ["sans-serif"] },
    };
  }
  return layer;
});

// ---------------------------------------------------------------------------
// Hillshade – dark theme warm accent, above landuse fill, below roads/buildings
// ---------------------------------------------------------------------------
const hillshadeLayer = {
  id: "hillshade",
  type: "hillshade",
  source: "terrain-hillshade",
  paint: {
    "hillshade-highlight-color": "rgba(255,255,255,0.15)",
    "hillshade-shadow-color": "rgba(0,0,0,0.35)",
    "hillshade-accent-color": "rgba(180,140,100,0.2)",
    "hillshade-illumination-direction": 315,
    "hillshade-exaggeration": 1.0,
  },
};

// ---------------------------------------------------------------------------
// Vientiane landuse layers – l1 category colours
// ---------------------------------------------------------------------------
const landuseColors = [
  "match",
  ["get", "l1"],
  "A", "#5a9a6a", // Agriculture – green
  "B", "#d4894a", // Building – warm orange
  "C", "#9b72cf", // Cultural – purple
  "D", "#6b8c6b", // Defense – military green
  "F", "#2e7d52", // Forest – deep green
  "I", "#d4a82a", // Industry – amber
  "R", "#9c8c6c", // Road – brown-grey
  "W", "#4488cc", // Water – blue
  "#888888",      // default
];

const landuseFillLayer = {
  id: "landuse-fill",
  type: "fill",
  source: "vientiane-landuse",
  "source-layer": "landuse",
  paint: {
    "fill-color": landuseColors,
    "fill-opacity": 0.55,
  },
};

const landuseOutlineLayer = {
  id: "landuse-outline",
  type: "line",
  source: "vientiane-landuse",
  "source-layer": "landuse",
  paint: {
    "line-color": "rgba(255,255,255,0.18)",
    "line-width": 0.5,
  },
};

// ---------------------------------------------------------------------------
// Map style
// ---------------------------------------------------------------------------
const mapStyle = {
  version: 8,
  sources: {
    protomaps: {
      type: "vector",
      url: "https://tunnel.optgeo.org/martin/protomaps-basemap",
    },
    "terrain-dem": {
      type: "raster-dem",
      url: "https://tunnel.optgeo.org/martin/mapterhorn",
      encoding: "terrarium",
    },
    "terrain-hillshade": {
      type: "raster-dem",
      url: "https://tunnel.optgeo.org/martin/mapterhorn",
      encoding: "terrarium",
    },
    "vientiane-landuse": {
      type: "vector",
      url: "pmtiles://https://optgeo.github.io/vientiane-landuse/vientiane-landuse.pmtiles",
    },
  },
  layers: (() => {
    const pierIdx = baseLayers.findIndex((l) => l.id === "landuse_pier");
    if (pierIdx === -1) throw new Error("landuse_pier layer not found in baseLayers");
    const afterPier = pierIdx + 1;
    return [
      ...baseLayers.slice(0, afterPier),
      landuseFillLayer,
      hillshadeLayer,
      ...baseLayers.slice(afterPier),
      landuseOutlineLayer,
    ];
  })(),
};

// ---------------------------------------------------------------------------
// Map initialisation
// ---------------------------------------------------------------------------
const map = new maplibregl.Map({
  container: "map",
  style: mapStyle,
  maxZoom: 22,
  hash: "map",
  center: [102.6, 17.96],
  zoom: 10,
});

map.on("load", () => {
  map.setTerrain({ source: "terrain-dem", exaggeration: 1.0 });
});

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
map.addControl(new maplibregl.NavigationControl(), "bottom-left");

map.addControl(
  new LayerControl({ showOpacitySlider: true, showLayerSymbol: true }),
  "bottom-left"
);

// ---------------------------------------------------------------------------
// Loading overlay
// ---------------------------------------------------------------------------
const overlay = document.getElementById("loading-overlay");

map.on("dataloading", () => {
  overlay.classList.add("visible");
});

map.on("idle", () => {
  overlay.classList.remove("visible");
});

// ---------------------------------------------------------------------------
// Status bar – title by default, feature info on hover
// ---------------------------------------------------------------------------
const statusBar = document.getElementById("status-bar");
const defaultTitle = "ビエンチャン土地利用";

map.on("mousemove", "landuse-fill", (e) => {
  if (e.features && e.features.length > 0) {
    const p = e.features[0].properties;
    const eng = p.l2_name_e || p.l1_name_e || "";
    const lao = p.l2_name_l || p.l1_name_l || "";
    statusBar.textContent = lao ? `${eng} | ${lao}` : eng || defaultTitle;
  }
});

map.on("mouseleave", "landuse-fill", () => {
  statusBar.textContent = defaultTitle;
});

map.on("error", (e) => {
  console.error("[map error]", e.error);
});
