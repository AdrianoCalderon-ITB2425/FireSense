# Acta — Sprint 2 Planning

## Meeting Information
| Field | Value |
|-------|-------|
| Date | 28/04/2026 |
| Time | 15:30 - 16:30 |
| Location | ASIX Classroom — ITB |
| Sprint | Sprint 2 |
| Sprint Duration | 28/04/2026 - 10/05/2026 |
| Version | 1.0 |

## Attendees
| Name | Role | Attendance |
|------|------|------------|
| Hamza Tayibi | Backend Developer / Web Frontend FireSense | Present |
| Adriano Calderon | Backend Developer | Present |
| Francisco Diaz | Scrum Master / Coordination | Present |

---

## 1. Sprint 2 Objective
Harden the FireSense infrastructure with security, CI/CD automation, monitoring, backups, and additional services:
- Sealed Secrets for secret management in git
- CI/CD pipeline with Jenkins + kaniko + Harbor
- HPA for Grafana and Node-RED
- InfluxDB retention policies and downsampling
- Daily InfluxDB backup with DRP documentation
- AI Telegram Bot with Ollama integration
- Prometheus + Samba + OpenLDAP
- Harbor Trivy vulnerability scanning

---

## 2. Implemented Architecture
| Component | Technology | Status |
|-----------|-----------|--------|
| Secret management | Sealed Secrets (Bitnami) | Planned |
| CI/CD pipeline | Jenkins + kaniko + Harbor | Planned |
| Auto-scaling | HPA (Grafana + Node-RED) | Planned |
| Retention policies | InfluxDB Tasks | Planned |
| Backup | CronJob + Longhorn PVC + SCP | Planned |
| AI Bot | python-telegram-bot + Ollama | Planned |
| Monitoring | Prometheus + node-exporter + kube-state-metrics | Planned |
| File sharing | Samba + OpenLDAP | Planned |
| Image scanning | Harbor + Trivy | Planned |

---

## 3. Sprint Backlog — Assigned Tasks
| ID | Task | Assigned | Est. | Priority |
|----|------|----------|------|----------|
| 2.6 | Sealed Secrets + Trivy + kube-bench | Adriano | 10h | High |
| 2.8 | CI/CD Jenkins + kaniko | Adriano | 16h | High |
| 2.9 | HPA Grafana + Node-RED | Hamza | 6h | High |
| 2.10 | InfluxDB retention policies | Adriano | 4h | Medium |
| 2.11 | Backup CronJob + DRP | Hamza | 8h | High |
| 2.12 | AI Telegram Bot | Hamza | 12h | High |
| 2.13 | Prometheus + Samba | Francisco | 10h | Medium |
| 2.14 | Harbor Trivy scanning | Adriano | 4h | High |
| 2.15 | Traefik HTTPS | Francisco | 6h | High |
| 2.16 | Market analysis | Adriano | 8h | Medium |
| 2.17 | Occupational risks | Adriano | 6h | Medium |
| 2.18 | Network + DNS config | Francisco | 4h | High |

**Total estimated: ~94h**

---

## 4. Definition of Done (DoD)
A task is considered complete when:
- The code/configuration works correctly on the K8s cluster
- Docker image built and pushed to Harbor
- K8s deployment verified (kubectl get pods — all Running)
- Feature tested end-to-end
- Committed to dev branch with descriptive message
- Documentation updated if applicable

---

## 5. Identified Risks
| Risk | Probability | Impact | Action |
|------|-------------|--------|--------|
| Docker socket unavailable in K8s workers | High | High | Use kaniko instead of DinD |
| SCP from pods to external network failing | Medium | Medium | Master relay script as fallback |
| Sealed Secrets controller name mismatch | Low | Medium | Check with kubectl get svc -n kube-system |
| Jenkins losing auth after restart | Medium | Medium | Persist JENKINS_OPTS in StatefulSet |
| Harbor certificate not trusted by kaniko | Medium | High | Use --insecure and --skip-tls-verify flags |

---

## 6. ProofHub Captures — Sprint Planning
![ProofHub Sprint 2 Planning](./captures/proofhub_sprint2_planning.png)

---

## 7. Next Meeting
| Type | Date | Time | Objective |
|------|------|------|-----------|
| Sprint Review 2 | 10/05/2026 | 16:00 | Present Sprint 2 deliverables |
| Sprint 3 Planning | 11/05/2026 | 15:30 | Define final sprint tasks |
| Daily Standup | Daily | 15:00 | Task progress follow-up |

---

## 8. Team
| Role | Name |
|------|------|
| Scrum Master | Francisco Diaz |
| Backend Developer / Web Frontend FireSense | Hamza Tayibi |
| Backend Developer | Adriano Calderon |

---
*Acta generated: 28/04/2026 — Version 1.0*
*FireSense IoT Platform — Institut Tecnologic de Barcelona — ASIX2c — 2025/2026*
