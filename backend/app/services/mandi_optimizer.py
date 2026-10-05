"""
Multi-Mandi Net-Return Optimizer (Stage 4).
Given a farmer's GPS location, predicted yield (quintals), and predicted price
(₹/quintal), this service:
  1. Identifies the farmer's nearest origin mandi via GPS proximity.
  2. Reads the pre-computed road-distance matrix (Distances.csv).
  3. Computes net return for every reachable destination mandi:
       Net Return = (price × quantity) − (distance × quantity × freight_rate)
  4. Returns all mandis ranked by net return, plus the best mandi.
"""
import os
import csv
import json
import math
import logging
from functools import lru_cache
from dataclasses import dataclass

logger = logging.getLogger("farmer_assistant")

# ── Paths ────────────────────────────────────────────────────
_DATASETS_DIR = os.path.join(
    os.path.dirname(__file__), os.pardir, os.pardir, os.pardir,
    "ml_training", "datasets"
)
_DISTANCES_CSV = os.path.normpath(os.path.join(_DATASETS_DIR, "Distances.csv"))
_MANDIS_GEO_CSV = os.path.normpath(os.path.join(_DATASETS_DIR, "Mandis_GEO.csv"))
_TRANSPORT_CONFIG = os.path.normpath(os.path.join(_DATASETS_DIR, "transport_config.json"))
_MANDI_MAPPING_CSV = os.path.normpath(os.path.join(_DATASETS_DIR, "mandi_name_mapping.csv"))


# ── Data Classes ─────────────────────────────────────────────

@dataclass
class MandiGeo:
    """A mandi with its geographic coordinates."""
    district: str
    name: str
    latitude: float
    longitude: float


@dataclass
class MandiResult:
    """Net-return result for one destination mandi."""
    mandi_name: str
    district: str
    distance_km: float
    transport_cost: float
    expected_revenue: float
    net_return: float
    price_per_quintal: float


# ── Loaders (cached — read once, reuse forever) ─────────────

@lru_cache(maxsize=1)
def _load_transport_config() -> dict:
    """Load freight rate and formula config from transport_config.json."""
    if not os.path.exists(_TRANSPORT_CONFIG):
        logger.warning(f"transport_config.json not found at {_TRANSPORT_CONFIG}, using defaults.")
        return {"freight_rate_per_quintal_km": 0.30}
    with open(_TRANSPORT_CONFIG, "r", encoding="utf-8") as f:
        return json.load(f)


@lru_cache(maxsize=1)
def _load_mandi_geo() -> list[MandiGeo]:
    """Load geocoded mandi coordinates from Mandis_GEO.csv."""
    mandis = []
    if not os.path.exists(_MANDIS_GEO_CSV):
        logger.error(f"Mandis_GEO.csv not found at {_MANDIS_GEO_CSV}")
        return mandis
    with open(_MANDIS_GEO_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            try:
                mandis.append(MandiGeo(
                    district=row["District"].strip(),
                    name=row["MandiName"].strip(),
                    latitude=float(row["Latitude"]),
                    longitude=float(row["Longitude"]),
                ))
            except (ValueError, KeyError):
                continue
    logger.info(f"Loaded {len(mandis)} geocoded mandis from Mandis_GEO.csv")
    return mandis


@lru_cache(maxsize=1)
def _load_distance_matrix() -> dict[str, dict[str, float]]:
    """
    Load the mandi-to-mandi road distance matrix from Distances.csv.
    Returns a nested dict: distances[from_mandi][to_mandi] = distance_km.
    """
    distances: dict[str, dict[str, float]] = {}
    if not os.path.exists(_DISTANCES_CSV):
        logger.error(f"Distances.csv not found at {_DISTANCES_CSV}")
        return distances
    with open(_DISTANCES_CSV, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            from_mandi = row["From_Mandi"].strip()
            to_mandi = row["To_Mandi"].strip()
            try:
                dist = float(row["Distance_km"])
            except (ValueError, KeyError):
                continue
            if from_mandi not in distances:
                distances[from_mandi] = {}
            distances[from_mandi][to_mandi] = dist
    logger.info(f"Loaded distance matrix with {len(distances)} origin mandis")
    return distances


@lru_cache(maxsize=1)
def _load_mandi_district_map() -> dict[str, str]:
    """Build a mandi_name → district lookup from the geocoded CSV."""
    geo = _load_mandi_geo()
    return {m.name: m.district for m in geo}


# ── Geo Utilities ────────────────────────────────────────────

def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two GPS points (km)."""
    R = 6371.0  # Earth radius in km
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(d_lon / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def find_nearest_mandi(lat: float, lon: float) -> MandiGeo | None:
    """Find the closest mandi to a given GPS location using haversine distance."""
    mandis = _load_mandi_geo()
    if not mandis:
        return None

    best = None
    best_dist = float("inf")
    for m in mandis:
        d = _haversine_km(lat, lon, m.latitude, m.longitude)
        if d < best_dist:
            best_dist = d
            best = m
    return best


# ── Core Optimizer ───────────────────────────────────────────

def optimize_mandi_selection(
    farmer_lat: float,
    farmer_lon: float,
    predicted_price: float,
    predicted_quantity_quintals: float,
    top_n: int = 10,
    freight_rate_override: float | None = None,
) -> dict:
    """
    Stage 4 of the Crop-to-Market pipeline.

    Parameters:
        farmer_lat, farmer_lon: Farmer's GPS coordinates.
        predicted_price: Forecasted price in ₹/quintal from Stage 3.
        predicted_quantity_quintals: Expected harvest in quintals from Stage 2.
        top_n: Number of top mandis to return (default 10).
        freight_rate_override: Optional custom freight rate (₹/quintal-km).

    Returns:
        dict with:
          - origin_mandi: Nearest mandi to the farmer (starting point).
          - best_mandi: The mandi with the highest net return.
          - rankings: List of top N mandis sorted by net return (desc).
          - freight_rate: The rate used for calculations.
          - total_mandis_evaluated: How many mandis were evaluated.
    """
    # 1. Load config & data
    config = _load_transport_config()
    freight_rate = freight_rate_override if freight_rate_override is not None else config.get("freight_rate_per_quintal_km", 0.30)
    distance_matrix = _load_distance_matrix()
    district_map = _load_mandi_district_map()

    # 2. Find nearest origin mandi to farmer's GPS
    origin = find_nearest_mandi(farmer_lat, farmer_lon)
    if origin is None:
        return {
            "error": "No geocoded mandis available. Check Mandis_GEO.csv.",
            "origin_mandi": None,
            "best_mandi": None,
            "rankings": [],
            "freight_rate": freight_rate,
            "total_mandis_evaluated": 0,
        }

    # 3. Get all distances from origin mandi
    origin_distances = distance_matrix.get(origin.name, {})
    if not origin_distances:
        # Try fuzzy match — the origin might have a slightly different name
        # in the distance matrix than in the geo file
        for dm_name in distance_matrix:
            if origin.name.lower().replace(" ", "") in dm_name.lower().replace(" ", "") or \
               dm_name.lower().replace(" ", "") in origin.name.lower().replace(" ", ""):
                origin_distances = distance_matrix[dm_name]
                logger.info(f"Fuzzy-matched origin '{origin.name}' → distance matrix key '{dm_name}'")
                break

    if not origin_distances:
        return {
            "error": f"Origin mandi '{origin.name}' not found in Distances.csv matrix.",
            "origin_mandi": {
                "name": origin.name,
                "district": origin.district,
                "lat": origin.latitude,
                "lon": origin.longitude,
            },
            "best_mandi": None,
            "rankings": [],
            "freight_rate": freight_rate,
            "total_mandis_evaluated": 0,
        }

    # 4. Calculate net return for every destination mandi
    results: list[MandiResult] = []
    for dest_name, distance_km in origin_distances.items():
        if distance_km <= 0:
            # Same mandi or self-loop → distance is 0 → transport cost is 0
            transport_cost = 0.0
        else:
            transport_cost = distance_km * predicted_quantity_quintals * freight_rate

        expected_revenue = predicted_price * predicted_quantity_quintals
        net_return = expected_revenue - transport_cost
        dest_district = district_map.get(dest_name, "Unknown")

        results.append(MandiResult(
            mandi_name=dest_name,
            district=dest_district,
            distance_km=round(distance_km, 2),
            transport_cost=round(transport_cost, 2),
            expected_revenue=round(expected_revenue, 2),
            net_return=round(net_return, 2),
            price_per_quintal=round(predicted_price, 2),
        ))

    # 5. Sort by net return (descending) and pick the best
    results.sort(key=lambda r: r.net_return, reverse=True)
    top_results = results[:top_n]
    best = results[0] if results else None

    # 6. Build response
    rankings_list = [
        {
            "rank": i + 1,
            "mandi_name": r.mandi_name,
            "district": r.district,
            "distance_km": r.distance_km,
            "transport_cost_inr": r.transport_cost,
            "expected_revenue_inr": r.expected_revenue,
            "net_return_inr": r.net_return,
            "price_per_quintal": r.price_per_quintal,
        }
        for i, r in enumerate(top_results)
    ]

    return {
        "origin_mandi": {
            "name": origin.name,
            "district": origin.district,
            "lat": origin.latitude,
            "lon": origin.longitude,
        },
        "best_mandi": {
            "rank": 1,
            "mandi_name": best.mandi_name,
            "district": best.district,
            "distance_km": best.distance_km,
            "transport_cost_inr": best.transport_cost,
            "expected_revenue_inr": best.expected_revenue,
            "net_return_inr": best.net_return,
        } if best else None,
        "rankings": rankings_list,
        "freight_rate_per_quintal_km": freight_rate,
        "quantity_quintals": round(predicted_quantity_quintals, 2),
        "price_per_quintal": round(predicted_price, 2),
        "total_mandis_evaluated": len(results),
    }
