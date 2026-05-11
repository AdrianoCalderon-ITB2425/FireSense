# MINUTES — Sprint 2 Planning
## Meeting Information
| Field | Value |
|-------|-------|
| Date | 28/04/2026 |
| Time | 15:00 - 15:30 |
| Location | ASIX Classroom — ITB |
| Sprint | Sprint 2 |
| Sprint Duration | 28/04/2026 - 04/05/2026 |
| Version | 1.0 |

## Attendees
| Name | Role | Attendance |
|------|------|------------|
| Hamza Tayibi | Backend Developer / Web Frontend FireSense | Present |
| Adriano Calderon | Backend Developer | Present |
| Francisco | Scrum Master / Coordination | Present |

---

## 1. Sprint 2 Objective
Extend the FireSense platform with advanced infrastructure: ChirpStack on K3s, IoT data pipeline end-to-end validation, TLS security hardening with cert-manager, CI/CD pipelines with Jenkins and Helm, database management with MongoDB and backups, Harbor registry, monitoring with Prometheus, and additional services including Telegram alerts.

---

## 2. Sprint Backlog — Assigned Tasks

### IoT and LoRaWAN
| ID | Task | Assigned | Due | Priority |
|----|------|----------|-----|----------|
| 2.1 | ChirpStack configuration and LoRaWAN gateway — Deploy ChirpStack on K3s, configure LoRaWAN network, create applications and device profiles | Hamza | 29 Apr | High |
| 2.2 | RAK WisBlock node programming — Firmware for temperature/humidity sensors, LoRaWAN data encryption | Adriano | 01 May | High |
| 2.3 | IoT data pipeline Node-RED and end-to-end validation — Node-RED flows: MQTT subscription → JSON parsing → database write | Adriano | 02 May | High |

### Security and Hardening
| ID | Task | Assigned | Due | Priority |
|----|------|----------|-----|----------|
| 2.4 | TLS and cert-manager — Install cert-manager, configure ClusterIssuer (Let's Encrypt / self-signed) | Francisco | 29 Apr | High |
| 2.6 | Encrypted secrets and Trivy/kube-bench audit — Configure Sealed Secrets, remove plaintext secrets, image scanning and security audits | Hamza | 04 May | High |

### CI/CD and Infrastructure
| ID | Task | Assigned | Due | Priority |
|----|------|----------|-----|----------|
| 2.8 | CI/CD pipeline Jenkins Actions and Helm Charts — Workflows: Docker build → Trivy scan → Harbor push → Helm deploy | Adriano | 06 May | Medium |
| 2.9 | Nginx Ingress Controller and HPA — Deploy Nginx Ingress, configure rules for Grafana (TLS) and Horizontal Pod Autoscaler | Hamza | 07 May | Medium |

### Databases and Backups
| ID | Task | Assigned | Due | Priority |
|----|------|----------|-----|----------|
| 2.10 | MongoDB StatefulSet and InfluxDB retention policies — Deploy MongoDB as StatefulSet and configure retention policies in InfluxDB | Adriano | 07 May | Medium |
| 2.11 | Backup CronJobs and DRP — Configure CronJobs for InfluxDB and MongoDB backup, disaster recovery plan | Hamza | 08 May | Medium |

### Additional Services
| ID | Task | Assigned | Due | Priority |
|----|------|----------|-----|----------|
| 2.12 | Postfix email alerts and Telegram bot — Deploy Postfix, integrate with Grafana Alerting and Node-RED for notifications | Adriano | 06 May | Medium |
| 2.13 | Prometheus monitoring and Samba — Deploy Prometheus + node-exporter + kube-state-metrics and Samba server | Francisco | 09 May | Medium |

### Base Infrastructure (carried over from Sprint 1)
| ID | Task | Assigned | Due | Note |
|----|------|----------|-----|------|
| 2.14 | Harbor Registry deployment — Install Harbor with Helm, configure HTTPS, create private projects and enable scanning | Francisco | 07 May | Carried over from Sprint 1 |
| 2.15 | Network and DNS configuration — CoreDNS internal, ISC DHCP for IoT segment, VLAN configuration | Adriano | 07 May | Carried over from Sprint 1 |

### General
| ID | Task | Assigned | Due | Priority |
|----|------|----------|-----|----------|
| 2.16 | Market research — Research whether this solution already exists in the market | Adriano | 06 May | Low |
| 2.17 | Occupational risk analysis — Analyse the occupational risks of the project | Adriano | 06 May | Low |

**Total tasks: 15**

---

## 3. Definition of Done (DoD)
A task is considered complete when:
- The code/configuration works correctly on the IsardVDI K3s cluster
- Kubernetes manifests or Helm charts committed to GitHub (dev branch)
- Security: no plaintext secrets in repository (Sealed Secrets or env vars)
- Services accessible via Ingress with valid TLS certificate
- Commit pushed to GitHub with a descriptive message

---

## 4. Identified Risks
| Risk | Probability | Impact | Action |
|------|-------------|--------|--------|
| cert-manager fails with self-signed on IsardVDI | Low | Medium | Fall back to manual TLS certificates if needed |
| Harbor disk space exhaustion | Low | Medium | Configure image retention policies from day one |
| Telegram bot token exposed in repository | Medium | Critical | Use Sealed Secrets or Kubernetes secrets, never hardcode |
| K3s manifest incompatibilities | Medium | Medium | Test manifests on K3s thoroughly before deploying |
| Tasks 2.14 and 2.15 carried over from Sprint 1 may block others | Medium | High | Prioritise these tasks in the first days of the sprint |

---

## 5. ProofHub Captures — Sprint 2 Tasks
![ProofHub Sprint 2 Planning](./captures/proofhub_sprint2_planning.png)

---

## 6. Next Meeting
| Type | Date | Time | Objective |
|------|------|------|-----------|
| Daily Standup | Daily | 15:00 | Task progress follow-up |
| Sprint Review 2 | 04/05/2026 | 16:00 | Present Sprint 2 deliverables |
| Sprint 3 Planning | 05/05/2026 | 15:30 | Define phase 3 tasks |

---

## 7. Team
| Role | Name |
|------|------|
| Scrum Master | Francisco |
| Backend Developer / Web Frontend FireSense | Hamza Tayibi |
| Backend Developer | Adriano Calderon |

---
*Minutes generated: 28/04/2026 — Version 1.0*
*FireSense IoT Platform — Institut Tecnologic de Barcelona — ASIX2c — 2025/2026*
