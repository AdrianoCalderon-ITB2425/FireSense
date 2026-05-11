## 1. Sprint 3 Planning
**Date:** 05/05/2026  
**Duration:** 2 weeks (05/05/2026 – 18/05/2026)  
**Scrum Master:** Francisco Diaz  

---

## 2. Sprint Goal
Deliver the AI features (REST API + Isolation Forest), the forest rangers web portal, complete all technical documentation in English, run integration tests and security audit, and present the final project to the tribunal.

---

## 3. Team Capacity
| Member | Available hours |
|--------|----------------|
| Hamza Tayibi | ~40h |
| Adriano Calderón | ~35h |
| Francisco Diaz | ~35h |
| **Total** | **~110h** |

---

## 4. Sprint Backlog
| ID | Task | Assigned | Estimate | Priority |
|----|------|----------|----------|----------|
| 3.1 | Forest Rangers Portal (HTML/JS Leaflet) | Hamza + Adriano | 12h | High |
| 3.2 | REST API + Isolation Forest IA (scikit-learn CronJob) | Hamza + Francisco | 16h | High |
| 3.3 | Grafana dashboards finals (IoT + IA + infra) | Hamza + Francisco | 10h | High |
| 3.4 | Technical documentation complete in English | Francisco + Hamza | 14h | High |
| 3.5 | Sustainability plan | Adriano + Francisco | 8h | Medium |
| 3.6 | Project memory | Adriano | 12h | High |
| 3.7 | Integration tests + internal pentest | Hamza | 10h | High |
| 3.8 | Demo + tribunal presentation (18/05/2026) | All | 16h | Critical |

---

## 5. Technical Decisions

### 3.1 Rangers Portal
- Use Leaflet.js for interactive map
- No login required — direct access for field agents
- Real-time data from REST API every 30 seconds
- Dark futuristic UI matching adminldap.html style

### 3.2 REST API + AI
- Flask + gunicorn deployed in firesense namespace
- Isolation Forest: scikit-learn, 100 estimators, 5% contamination
- CronJob running every hour in iot namespace
- Endpoints: /health, /sensors, /sensors/latest, /anomalies, /risk

### 3.3 Grafana Dashboards
- Dashboard 1: IoT Sensors (InfluxDB datasource)
- Dashboard 2: AI Anomalies (InfluxDB datasource)
- Dashboard 3: K8s Infrastructure (Prometheus datasource)

### 3.4 Documentation
- Rewrite 02-lorawan.md in English with real hardware specs
- Add Sprint 1+2+3 technical documentation
- Architecture diagrams (Mermaid)
- Operational runbooks

---

## 6. Definition of Done
- Code pushed to dev branch
- Docker image built and pushed to Harbor
- K8s deployment verified (kubectl get pods)
- Feature tested end-to-end
- Documentation updated in English
- Integration tests passing (10/10)

---

## 7. Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| No real sensor data in InfluxDB | High | Medium | API handles empty data gracefully |
| Jenkins rebuild breaks nginx image | Medium | High | Keep v13 as fallback |
| Time pressure for documentation | Medium | Medium | Divide docs by member |
| Presentation preparation insufficient | Low | High | Rehearse demo flow 2 days before |

---

## 8. ProofHub Captures — Sprint Planning
![ProofHub Sprint 2 Planning](./captures/proofhub_sprint3_planning.png)

---

## 9. Team
| Role | Name |
|------|------|
| Scrum Master | Francisco Diaz |
| Backend Developer / Web Frontend | Hamza Tayibi |
| Backend Developer / IoT | Adriano Calderón |

---
*Minutes generated: 05/05/2026 — Version 1.0*
*FireSense IoT Platform — Institut Tecnologic de Barcelona — ASIX2c — 2025/2026*
