# 09 — Node-RED API Flows

## Overview

Node-RED running in the `iot` namespace acts as the central data pipeline and API gateway for FireSense. It handles two main responsibilities:

1. **IoT Pipeline** — receives LoRaWAN sensor data from ChirpStack via MQTT and writes it to InfluxDB
2. **External API Gateway** — exposes HTTP endpoints that proxy external data sources (NASA, AEMET, Open-Meteo, etc.) to the FireSense dashboard

## Access

- **Node-RED UI:** `https://93d92c4a-e3bf-4ea6-93c6.afab44153cac.isard.nuvulet.itb.cat/nodered/`
- **API Base URL:** `https://93d92c4a-e3bf-4ea6-93c6.afab44153cac.isard.nuvulet.itb.cat/nodered/api/`
- **Credentials:** admin / see deployment secrets

## Traefik Routing

```
/nodered → middleware: nodered-strip → nodered:1880
```

The `nodered-strip` middleware strips the `/nodered` prefix before forwarding to Node-RED, which has:
- `httpAdminRoot: '/nodered/'`
- `httpNodeRoot: '/api/'`

---

## Flow 1 — ChirpStack → InfluxDB

**MQTT Topic:** `application/+/device/+/event/up`  
**Broker:** `mosquitto:1883`  
**Measurement:** `sensors`  
**InfluxDB:** `http://influxdb:8086` · org=`firesense` · bucket=`sensors`

```
MQTT in → Parse RAK payload → InfluxDB out → Debug
```

The parse function extracts: `temperature`, `humidity`, `soil`, `battery_mv`, `battery_pct`, `rssi`, `snr`, `fcnt` from the ChirpStack uplink payload.

---

## Flow 2 — External APIs

### NASA FIRMS — Active Fire Detection

| Parameter | Value |
|-----------|-------|
| Endpoint | `GET /nodered/api/firms/active` |
| Source | NASA FIRMS VIIRS SNPP NRT |
| Query params | `days` (default: 1), `bbox` (default: Barcelona area) |
| Response | CSV with fire hotspot coordinates |

```
GET /firms/active?days=1&bbox=1.5,41.2,2.5,41.7
  → NASA FIRMS API
  → CSV response
```

---

### AEMET — Spanish Weather Agency

| Parameter | Value |
|-----------|-------|
| Endpoint | `GET /nodered/api/aemet` |
| Source | AEMET OpenData API |
| Municipality | Barcelona (08019) |
| Response | JSON with current hour weather |

```
GET /aemet
  → AEMET step 1 (get data URL)
  → http request
  → AEMET step 2 (fetch data)
  → http request
  → AEMET format (parse JSON)
  → JSON: {municipi, data, hora, cel, temperatura, precipitacion, humitat}
```

Example response:
```json
{
  "municipi": "Barcelona",
  "data": "2026-05-10T00:00:00",
  "hora": "20h",
  "cel": "Partly cloudy",
  "temperatura": "20°C",
  "precipitacion": "0 mm",
  "humitat": "61%"
}
```

---

### Open-Meteo — Weather Forecast

| Parameter | Value |
|-----------|-------|
| Endpoint | `GET /nodered/api/open-meteo` |
| Source | Open-Meteo API (free, no key required) |
| Query params | `lat`, `lng` |
| Response | JSON with current conditions + 7-day forecast |

```
GET /open-meteo?lat=41.45&lng=2.18
  → Open-Meteo API
  → JSON response
```

Returns: temperature, humidity, wind speed/direction, precipitation, weather code, 7-day daily forecast.

---

### NASA POWER — Solar & Climate Data

| Parameter | Value |
|-----------|-------|
| Endpoint | `GET /nodered/api/nasa-power` |
| Source | NASA POWER API |
| Query params | `lat`, `lng` |
| Response | JSON with 30-day historical climate data |

Returns: `T2M`, `T2M_MAX`, `T2M_MIN`, `RH2M`, `WS10M`, `ALLSKY_SFC_SW_DWN` (solar radiation).

---

### GENCAT — Catalan Fire History

| Parameter | Value |
|-----------|-------|
| Endpoint | `GET /nodered/api/nasa-eonet` |
| Source | Transparència Catalunya Open Data |
| Response | JSON with last 20 fires in the Barcelona area |

Filters: Barcelonès, Baix Llobregat, Vallès Occidental, Vallès Oriental, Maresme, Garraf.

---

### NASA NDVI — Vegetation Index

| Parameter | Value |
|-----------|-------|
| Endpoint | `GET /nodered/api/nasa-ndvi` |
| Source | MODIS ORNL MOD13Q1 |
| Query params | `lat`, `lng` |
| Response | JSON with NDVI vegetation index data |

---

### OpenAQ — Air Quality

| Parameter | Value |
|-----------|-------|
| Endpoint | `GET /nodered/api/open-aq` |
| Source | OpenAQ v3 API |
| Query params | `lat`, `lng` |
| Response | JSON with air quality stations within 25 km |

---

### Wind Grid — Wind Visualisation

| Parameter | Value |
|-----------|-------|
| Endpoint | `GET /nodered/api/wind-grid` |
| Source | Open-Meteo multi-point |
| Response | JSON in leaflet-velocity format |

Generates a grid of wind vectors covering the Barcelona/Collserola area for animated wind visualisation on the map.

---

## Configuration

Node-RED settings (`node-red-settings` ConfigMap, namespace `iot`):

```javascript
module.exports = {
    httpAdminRoot: '/nodered/',
    httpNodeRoot: '/api/',
    functionExternalModules: true,
    credentialSecret: "${NODERED_CREDENTIAL_SECRET}"
};
```

---

## Updating Flows

```bash
# Export current flows
kubectl exec -n iot statefulset/nodered -- cat /data/flows.json > backend-server/k8s-services-iot/iot/nodered-flows.json

# Import flows
kubectl cp backend-server/k8s-services-iot/iot/nodered-flows.json \
  iot/$(kubectl get pods -n iot -l app=nodered -o jsonpath='{.items[0].metadata.name}'):/data/flows.json

kubectl rollout restart statefulset/nodered -n iot
```

---

*FireSense — Institut Tecnològic de Barcelona · ASIX2c · 2025–2026*
