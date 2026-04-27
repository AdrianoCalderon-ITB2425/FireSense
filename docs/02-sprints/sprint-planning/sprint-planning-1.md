# Acta — Sprint 1 Planning
## Meeting Information
| Field | Value |
|-------|-------|
| Date | 14/04/2026 |
| Time | 15:30 - 16:30 |
| Location | ASIX Classroom — ITB |
| Sprint | Sprint 1 |
| Sprint Duration | 14/04/2026 - 27/04/2026 |
| Version | 1.0 |

## Attendees
| Name | Role | Attendance |
|------|------|------------|
| Hamza Tayibi | Backend Developer / Web Frontend FireSense | Present |
| Adriano Calderon | Backend Developer | Present |
| Francisco | Scrum Master / Coordination | Present |

---

## 1. Sprint 1 Objective
Build the base infrastructure of the FireSense project and the MVP of the IoT forest fire prevention platform:
- Complete IoT stack: RAK4631 → ChirpStack v4 → Node-RED → InfluxDB v2 → Web Dashboard
- Docker infrastructure with nginx proxy on IsardVDI
- FireSense web dashboard: interactive map Leaflet/CesiumJS + real-time data
- Espurna web dashboard: independent map with own IoT nodes
- Authentication system LDAP + PostgreSQL + JWT
- Security: API keys hidden via nginx proxy (InfluxDB + ChirpStack)
- Client configuration manual (DOCX, 13 sections)

---

## 2. Implemented Architecture
| Component | Technology | Status |
|-----------|-----------|--------|
| IoT sensor node | RAK4631 (nRF52840 + SX1262) + RAK1901 + RAK12035 | Operational |
| LoRaWAN Gateway | RAK7289V2 — EU868 OTAA | Operational |
| Network Server | ChirpStack v4 (Docker) | Operational |
| Message Broker | Mosquitto MQTT v2 | Operational |
| Data processing | Node-RED (importable flow) | Operational |
| Time-series database | InfluxDB v2 — bucket sensor_data | Operational |
| Relational database | PostgreSQL — users + nodes | Operational |
| User directory | OpenLDAP — dc=firesense,dc=io | Operational |
| Authentication | Auth-service Flask + JWT + ldap3 | Operational |
| Web proxy / server | Nginx (Docker) — HTTPS + secure proxy | Operational |
| FireSense dashboard | HTML/CSS/JS + Leaflet + CesiumJS | Operational |
| Espurna dashboard | HTML/CSS/JS + Leaflet (independent nginx) | Operational |
| Visualization | Grafana (Docker) — InfluxDB panels | Operational |

---

## 3. Sprint Backlog — Assigned Tasks
| ID | Task | Assigned | Est. | Status |
|----|------|----------|------|--------|
| 1.1 | Kick-off and role assignment | All | 2h | Done |
| 1.2 | GitHub repository setup (dev/main branches, .gitignore, secrets) | Adriano | 3h | Done |
| 1.3 | Gantt planning on ProofHub (sprints, milestones) | Adriano | 4h | Done |
| 1.4 | IsardVDI provisioning and Docker installation | Adriano, Francisco | 4h | Done |
| 1.6 | OpenLDAP + phpLDAPadmin configuration | Hamza | 5h | Done |
| 1.8 | Docker Compose MING stack (Mosquitto+InfluxDB+Node-RED+Grafana) | Adriano | 6h | Done |
| 1.9 | ChirpStack v4 Docker + chirpstack.toml + eu868.toml | Hamza | 5h | Done |
| 1.10 | Kubernetes manifests for Mosquitto and InfluxDB | Francisco | 6h | Done |
| 1.11 | Kubernetes manifests for Node-RED and Grafana | Francisco | 4h | Done |
| 1.12 | Technologies and Hardware | Adriano, Hamza | 16h | Done |

**Total estimated: ~96h**

---

## 4. Definition of Done (DoD)
A task is considered complete when:
- The code/configuration works correctly on the IsardVDI server
- Documented in the GitHub repository (dev branch → merge to main)
- APIs do not expose sensitive keys in the browser (clean F12)
- The web dashboard loads without console errors
- Commit pushed to GitHub with a descriptive message

---

## 5. Identified Risks
| Risk | Probability | Impact | Action |
|------|-------------|--------|--------|
| Secrets exposed on GitHub (Mapbox, ChirpStack, InfluxDB) | High | Critical | Resolved: git filter-branch + nginx proxy |
| MapTiler 100k requests limit exceeded | High | High | Resolved: new token created 27/04/2026 |
| Espurna templates missing in nginx container | Medium | High | Resolved: added `|| true` in entrypoint.sh |
| Hardcoded NODES in config.js visible in F12 | High | Medium | Resolved: nodes loaded dynamically from /api/nodes |
| Gateway Offline (RAK7289V2 off) | Low | Low | Pending: physical gateway in lab |
| Join OTAA fails if AppKey does not match | Medium | High | Documented in client manual (step 4.2) |

---

## 6. ProofHub Captures — Sprint 1 Tasks
![ProofHub Sprint 1 Planning](./captures/proofhub_sprint1_planning.png)

---

## 7. Next Meeting
| Type | Date | Time | Objective |
|------|------|------|-----------|
| Sprint Review 1 | 27/04/2026 | 16:00 | Present FireSense MVP to professor |
| Sprint 2 Planning | 28/04/2026 | 15:30 | Define phase 2 tasks |
| Daily Standup | Daily | 15:00 | Task progress follow-up |

---

## 8. Team
| Role | Name |
|------|------|
| Scrum Master | Francisco |
| Backend Developer / Web Frontend FireSense | Hamza Tayibi |
| Backend Developer | Adriano Calderon |

---
*Minutes generated: 27/04/2026 — Version 1.0*
*FireSense IoT Platform — Institut Tecnologic de Barcelona — ASIX2c — 2025/2026*
