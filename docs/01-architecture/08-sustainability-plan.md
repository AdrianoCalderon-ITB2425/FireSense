# FireSense — Sustainability & Digital Transformation Plan

**Version:** 1.0  
**Date:** 2026-05-10  
**Team:** Hamza Tayibi, Adriano Calderón, Francisco Diaz  
**Institution:** Institut Tecnològic de Barcelona (ITB)

---

## 1. Executive Summary

FireSense is an IoT forest fire early-detection system designed with sustainability as a core principle. By deploying low-power LoRaWAN sensor nodes across the Collserola Natural Park, the system enables early fire detection while minimising environmental impact. This document outlines the environmental, economic, and social sustainability of the project, as well as its contribution to digital transformation in forest management.

---

## 2. Environmental Sustainability

### 2.1 Low-Power Hardware

| Component | Power consumption | Autonomy |
|-----------|------------------|----------|
| RAK4631 node (active) | ~10 mA | — |
| RAK4631 node (deep sleep) | ~2.5 µA | 6–12 months |
| RAK7289V2 gateway | ~12W | Continuous |

The sensor nodes spend 99% of their time in deep sleep, waking only to take measurements and transmit. This dramatically reduces energy consumption compared to WiFi or cellular-based alternatives.

### 2.2 Infrastructure Efficiency

- **On-premises deployment**: No cloud provider required → zero data centre energy overhead beyond ITB's existing infrastructure
- **Kubernetes resource optimisation**: HPA (Horizontal Pod Autoscaler) scales pods down during low-demand periods, reducing CPU and memory usage
- **Longhorn storage replication**: 2 replicas per volume instead of 3 — balanced redundancy vs. storage consumption

### 2.3 Comparison with Traditional Methods

| Method | Energy cost | Coverage | Response time |
|--------|-------------|----------|---------------|
| Human patrols | High (vehicles) | Limited | Hours |
| Aerial surveillance | Very high (aircraft) | Wide | Hours |
| Fixed cameras | Medium (24/7 power) | Limited FOV | Minutes |
| **FireSense IoT** | **Very low (battery nodes)** | **Wide (LoRa 10km)** | **Minutes** |

### 2.4 Carbon Footprint Reduction

By enabling early fire detection, FireSense can prevent large-scale forest fires, which are major sources of CO₂ emissions. A single large fire can release thousands of tonnes of CO₂. Early intervention directly contributes to carbon footprint reduction.

---

## 3. Economic Sustainability

### 3.1 Total Cost of Ownership (TCO)

| Component | Estimated cost |
|-----------|---------------|
| RAK4631 node + sensors | ~€80/unit |
| RAK7289V2 gateway | ~€400/unit |
| Server infrastructure (IsardVDI) | €0 (ITB existing) |
| Software stack | €0 (open source) |
| Annual maintenance | ~€200/year |

**Vs. commercial alternatives** (Dryad Silvanet, Pano AI): €5,000–€50,000/year subscription fees.

### 3.2 Open Source Stack

All software components are open source with no licensing costs:
- Kubernetes, Traefik, Longhorn, MetalLB
- ChirpStack, Node-RED, Mosquitto
- InfluxDB, Grafana, PostgreSQL
- Flask, scikit-learn, Python

### 3.3 Scalability

The system scales horizontally at minimal cost:
- Additional sensor nodes: ~€80/unit
- Additional gateway: ~€400 (covers 10km radius)
- K8s infrastructure: no additional cost (existing cluster)

---

## 4. Social Sustainability

### 4.1 Public Safety

FireSense directly contributes to public safety by providing early warning of forest fires, protecting:
- Local communities adjacent to Collserola
- Forest ecosystems and biodiversity
- Emergency response teams (reduced risk exposure)

### 4.2 Digital Inclusion

- **Forest rangers portal** (`/FireSense/agents.html`): Accessible without login, mobile-friendly, designed for field agents with limited technical background
- **Multilingual interface**: Web portal supports Catalan, Spanish, and English
- **Open data**: REST API allows civil protection agencies to integrate FireSense data into their own systems

### 4.3 Educational Value

The project is developed at ITB as part of the ASIX2c curriculum, training students in:
- IoT infrastructure (LoRaWAN, MQTT, InfluxDB)
- Cloud-native technologies (Kubernetes, Docker, Helm)
- AI/ML applied to environmental monitoring (Isolation Forest)
- Cybersecurity (Sealed Secrets, Trivy, kube-bench, TLS)

---

## 5. Digital Transformation

### 5.1 Current State vs. FireSense

| Aspect | Traditional | FireSense |
|--------|-------------|-----------|
| Fire detection | Human patrols, cameras | Automated IoT sensors |
| Data collection | Manual reports | Real-time automated pipeline |
| Analysis | Human judgment | AI anomaly detection |
| Alerting | Phone calls | Telegram bot, web dashboard |
| Data storage | Paper/spreadsheets | InfluxDB time series |
| Infrastructure | On-premise servers | Kubernetes cloud-native |

### 5.2 Data-Driven Decision Making

FireSense enables evidence-based forest management:
- Historical sensor data stored for 90 days (raw) and 1 year (aggregated)
- Grafana dashboards provide visual analytics for forest managers
- REST API enables integration with civil protection systems
- Isolation Forest AI detects anomalies before they become critical

### 5.3 Interoperability

- **REST API**: JSON format, compatible with any civil protection system
- **MQTT**: Standard IoT protocol, compatible with any LoRaWAN device
- **InfluxDB**: Standard time-series database with Flux query language
- **OpenLDAP**: Standard directory protocol for user management

---

## 6. Future Roadmap

| Phase | Timeline | Description |
|-------|----------|-------------|
| Phase 1 (current) | 2025–2026 | ITB pilot — Collserola laboratory |
| Phase 2 | 2026–2027 | Field deployment — 5 nodes in Collserola |
| Phase 3 | 2027–2028 | Expansion to other Catalan natural parks |
| Phase 4 | 2028+ | Integration with 112 emergency services |

### 6.1 Planned Improvements

- **Solar-powered nodes**: Eliminate battery replacement, achieve true zero-maintenance
- **Wind sensors**: Add anemometers to improve fire risk prediction
- **Predictive AI**: Replace reactive Isolation Forest with predictive LSTM models
- **Satellite integration**: Combine IoT data with satellite imagery for wider coverage

---

## 7. Alignment with Sustainable Development Goals (SDGs)

| SDG | Alignment |
|-----|-----------|
| **SDG 13** — Climate Action | Early fire detection reduces CO₂ emissions from forest fires |
| **SDG 15** — Life on Land | Protects forest ecosystems and biodiversity |
| **SDG 11** — Sustainable Cities | Protects urban communities adjacent to natural parks |
| **SDG 9** — Industry & Innovation | Applies IoT and AI to environmental monitoring |
| **SDG 4** — Quality Education | Developed as educational project at ITB |
