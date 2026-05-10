# 2526-ASIXC2 - FireSense Project Development

## Team

**Group 1 ASIXC2 - Final Project**

| Name | Role |
|------|------|
| Hamza Tayibi | Backend Developer / Web Frontend FireSense |
| Adriano Calderón | Backend Developer |
| Francisco Díaz | Scrum Master / Coordination |

## Project Description

FireSense is an academic project from the Institut Tecnològic de Barcelona (ITB).

**Objective:** To deploy an IoT platform with LoRaWAN technology aimed at forest fire prevention. The system uses a MING stack (Mosquitto, InfluxDB, Node-RED, Grafana) along with ChirpStack. The entire environment is based on Docker containers orchestrated with Kubernetes (K8s) on IsardVDI (private cloud) with hybrid cloud replication to AWS EKS.

## Main Index

| Section | Folder | Direct Access |
|---------|--------|---------------|
| Architecture | `docs/01-architecture/` | [View architecture →](./docs/01-architecture/00-index-architecture.md) |
| Management & Minutes | `docs/02-sprints/` | [View minutes →](./docs/02-sprints/) |
| Comparison of Technologies | `docs/03-tech-comparison/` | [View tech-comparison →](./docs/03-tech-comparison/) |
| Occupational Risks | `docs/04-occupational-risks/` | [View risks →](./docs/04-occupational-risks/) |
| Manuals | `docs/06-manuals/` | [View manuals →](./docs/06-manuals/) |
| Market Analysis | `docs/07-market-analysis/` | [View analysis →](./docs/07-market-analysis/) |

## Features

- **IoT Data Collection** — RAK WisBlock nodes (RAK4631) measuring soil temperature and humidity, connected via LoRaWAN EU868 with AES-128 encryption.
- **Public Web Portal** — Interactive map showing real-time forest node status with a simplified alert panel for forest rangers. User authentication via OpenLDAP with CAPTCHA protection.
- **AI Anomaly Detection** — Thermal anomaly detection and fire risk prediction using scikit-learn (Isolation Forest) running as a Kubernetes CronJob.
- **IoT Automation** — End-to-end data pipeline via Node-RED: MQTT → InfluxDB → Grafana, with Telegram and email alerts.
- **CI/CD Pipeline** — Automated build, scan and deploy using Jenkins + Helm charts with a private Harbor registry (Trivy vulnerability scanning).
- **Security Hardening** — Centralized authentication (OpenLDAP), CIS auditing (kube-bench), vulnerability scanning (Trivy), Sealed Secrets, NetworkPolicies, RBAC, WireGuard VPN and TLS via cert-manager.
- **REST API** — Data integration endpoints for external civil protection systems (JSON and CSV export).
- **Monitoring** — Prometheus + Grafana dashboards for IoT sensors, AI anomalies and K8s infrastructure health.

## Stack

| Layer | Technology |
|-------|-----------|
| IoT Nodes | RAK4631 WisBlock (nRF52840 + SX1262) |
| Gateway | RAK7289V2 LoRaWAN EU868 |
| LoRaWAN Server | ChirpStack v4 |
| Message Broker | Mosquitto MQTT |
| Data Pipeline | Node-RED |
| Time Series DB | InfluxDB 2.7 |
| Visualization | Grafana |
| Container Runtime | Docker + Kubernetes (K8s) |
| Storage | Longhorn |
| Ingress | Traefik + cert-manager (Let's Encrypt) |
| Registry | Harbor + Trivy |
| CI/CD | Jenkins + Helm |
| Auth | OpenLDAP + JWT + Cloudflare Turnstile |
| AI | scikit-learn Isolation Forest |
| Cloud | IsardVDI (private) |

## Links

- **Web Portal:** [FireSense](https://93d92c4a-e3bf-4ea6-93c6.afab44153cac.isard.nuvulet.itb.cat/FireSense/)
- **Dashboard:** [Live IoT Dashboard](https://93d92c4a-e3bf-4ea6-93c6.afab44153cac.isard.nuvulet.itb.cat/FireSense/index.html)
- **Grafana:** [Monitoring](https://93d92c4a-e3bf-4ea6-93c6.afab44153cac.isard.nuvulet.itb.cat/grafana)
- **ChirpStack:** [LoRaWAN Server](https://93d92c4a-e3bf-4ea6-93c6.afab44153cac.isard.nuvulet.itb.cat/chirpstack)

---
*FireSense IoT Platform — Institut Tecnològic de Barcelona — ASIX2c — 2025/2026*
