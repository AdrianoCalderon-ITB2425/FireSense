# 2526-ASIXC2 - FireSense Project Development

## Team

Group 1 ASIXC2 - Final Project

- Hamza Tayibi
- Adriano Calderón
- Alejandro Díaz

## Project Description
FireSense is an academic project from the Institut Tecnològic de Barcelona (ITB).
- Objective: To deploy an IoT platform with LoRaWAN technology aimed at forest fire prevention. The system uses a MING stack (Mosquitto, InfluxDB, Node-RED, Grafana) along with ChirpStack. The entire environment is based on Docker containers and orchestrated with Kubernetes (K8s) with IsardVDI (private cloud).

## Main Index

| **Section** | **Folder** | **Direct Access** |
|---------------|----------------|----------------------|
| **Architecture** | `01-architecture/` | [View architecture →](./docs/01-architecture/00-index-architecture.md) |
| **Management & Minutes** | `02-sprints/` | [View minutes →](./docs/02-sprints/sprints-index.md) |
| **Comparison of Technologies** | `03-tech-comparison/` | [View tech-comparison →](./docs/03-tech-comparison/) |

## Features
- Data collection using RAK WisBlock nodes measuring soil temperature and humidity.
- Public web portal including an interactive map to view the forest status in real-time, along with a simplified alert panel for forest rangers.
- Thermal anomaly detection and risk prediction through artificial intelligence, using a CronJob with scikit-learn (Isolation Forest).
- IoT flow automation and alert dispatching via Node-RED, Postfix, and Telegram.
- Automated deployment and version control (CI/CD) using Jenkins and Helm charts, integrating a private Harbor registry with vulnerability scanning.
- High-security environment (comprehensive hardening) including centralized authentication with OpenLDAP, CIS auditing with kube-bench, vulnerability scanning with Trivy, and secure communications via WireGuard and TLS.
- REST API for data integration with external civil protection systems (JSON and CSV export).