# 2526-ASIXC2 - FireSense Project Development

## Team

**Group 1 ASIXC2 - Final Project**

| Name | Role |
|------|------|
| Hamza Tayibi | Backend Developer / Web Frontend |
| Adriano Calderón | Backend Developer / IoT |
| Francisco Díaz | Scrum Master / Coordination |

## Project Description

FireSense is an academic project from the Institut Tecnològic de Barcelona (ITB).

**Objective:** To deploy an IoT platform with LoRaWAN technology aimed at forest fire prevention. The system uses a MING stack (Mosquitto, InfluxDB, Node-RED, Grafana) along with ChirpStack. The entire environment is based on Docker containers orchestrated with Kubernetes (K8s) on IsardVDI (private cloud).

## Main Index

| Section | Folder | Direct Access |
|---------|--------|---------------|
| Architecture | `docs/01-architecture/` | [View architecture →](./docs/01-architecture/00-index-architecture.md) |
| Management & Actas | `docs/02-sprints/` | [View actas →](./docs/02-sprints/) |
| Comparison of Technologies | `docs/03-tech-comparison/` | [View tech-comparison →](./docs/03-tech-comparison/) |
| Occupational Risks | `docs/04-occupational-risks/` | [View risks →](./docs/04-occupational-risks/) |
| Manuals | `docs/06-manuals/` | [View manuals →](./docs/06-manuals/) |
| Market Analysis | `docs/07-market-analysis/` | [View analysis →](./docs/07-market-analysis/) |
| K8s Manifests | `backend-server/k8s-services-iot/` | [View manifests →](./backend-server/k8s-services-iot/) |
| Sealed Secrets | `k8s/sealed-secrets-backup/` | [View secrets →](./k8s/sealed-secrets-backup/) |

## Features

- **IoT Data Collection** — RAK WisBlock nodes (RAK4631) measuring soil temperature and humidity via LoRaWAN EU868.
- **Public Web Portal** — Home page with interactive map and forest fire prevention info. Portal for forest rangers (no login required).
- **Authenticated Dashboard** — Real-time IoT dashboard with node telemetry, maps, and external data. Requires approved account.
- **User Management** — Registration with Cloudflare Turnstile CAPTCHA, OpenLDAP authentication, JWT tokens, email notifications via Resend.
- **Admin Panel** — LDAP admin panel to approve, reject and delete user accounts.
- **AI Anomaly Detection** — scikit-learn Isolation Forest running as K8s CronJob for thermal anomaly detection.
- **External APIs** — Node-RED proxies NASA FIRMS, AEMET, Open-Meteo, NASA POWER, GENCAT, NDVI, OpenAQ, Wind Grid.
- **CI/CD Pipeline** — Jenkins + Helm charts + Harbor private registry with Trivy scanning.
- **Security** — OpenLDAP, Sealed Secrets, kube-bench, Trivy, NetworkPolicies, RBAC, TLS via cert-manager.
- **Monitoring** — Prometheus + Grafana dashboards for IoT sensors, AI anomalies and K8s infrastructure.

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

## Service URLs

| Service | URL | Access |
|---------|-----|--------|
| Home | [/FireSense/](https://93d92c4a-e3bf-4ea6-93c6.afab44153cac.isard.nuvulet.itb.cat/FireSense/) | Public |
| Forest Rangers Portal | [/FireSense/agents.html](https://93d92c4a-e3bf-4ea6-93c6.afab44153cac.isard.nuvulet.itb.cat/FireSense/agents.html) | Public |
| Login / Register | [/FireSense/login.html](https://93d92c4a-e3bf-4ea6-93c6.afab44153cac.isard.nuvulet.itb.cat/FireSense/login.html) | Public |
| IoT Dashboard | [/FireSense/index.html](https://93d92c4a-e3bf-4ea6-93c6.afab44153cac.isard.nuvulet.itb.cat/FireSense/index.html) | Login required |
| Admin LDAP Panel | [/FireSense/adminldap.html](https://93d92c4a-e3bf-4ea6-93c6.afab44153cac.isard.nuvulet.itb.cat/FireSense/adminldap.html) | Admin only |
| Grafana | [/grafana](https://93d92c4a-e3bf-4ea6-93c6.afab44153cac.isard.nuvulet.itb.cat/grafana) | Admin |
| ChirpStack | [/chirpstack](https://93d92c4a-e3bf-4ea6-93c6.afab44153cac.isard.nuvulet.itb.cat/chirpstack) | Admin |
| Node-RED | [/nodered/](https://93d92c4a-e3bf-4ea6-93c6.afab44153cac.isard.nuvulet.itb.cat/nodered/) | Admin |
| Harbor | [/harbor](https://93d92c4a-e3bf-4ea6-93c6.afab44153cac.isard.nuvulet.itb.cat/harbor) | Admin |
| Jenkins | [/jenkins](https://93d92c4a-e3bf-4ea6-93c6.afab44153cac.isard.nuvulet.itb.cat/jenkins) | Admin |
| REST API | [/fsapi/v2/api/health](https://93d92c4a-e3bf-4ea6-93c6.afab44153cac.isard.nuvulet.itb.cat/fsapi/v2/api/health) | Public |
| Prometheus | [/prometheus](https://93d92c4a-e3bf-4ea6-93c6.afab44153cac.isard.nuvulet.itb.cat/prometheus/) | Admin |
| Headlamp | [/headlamp](https://93d92c4a-e3bf-4ea6-93c6.afab44153cac.isard.nuvulet.itb.cat/headlamp/) | Admin |

---

*FireSense IoT Platform — Institut Tecnològic de Barcelona — ASIX2c — 2025/2026*

