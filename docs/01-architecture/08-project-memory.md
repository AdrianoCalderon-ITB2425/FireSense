# FireSense — Project Memory
## IoT Forest Fire Early Detection System — Full Technical Report

**Academic Year:** 2025–2026  
**Programme:** CFGS Administració de Sistemes Informàtics en Xarxa (ASIX)  
**Institution:** Institut Tecnològic de Barcelona (ITB)  
**Module:** M0373 · M0369 · M0378 · M0364 · M0370  
**Group:** 2526-PF-ASIXc2-G01  
**Presentation date:** 18 May 2026  

| Role | Member | Responsibilities |
|------|--------|-----------------|
| Backend / Web Developer | Hamza Tayibi | Auth service, web portal, backups, HPA, AI bot, REST API, tests |
| Backend / IoT Developer | Adriano Calderón | IoT pipeline, ChirpStack, Node-RED, CI/CD, Harbor, InfluxDB |
| Scrum Master / Network | Francisco Diaz | K8s networking, Traefik, Prometheus, documentation |

---

## Executive Summary

FireSense is a production-grade, cloud-native IoT platform for real-time forest fire risk detection and early warning. Developed as a final-year project at the Institut Tecnològic de Barcelona, it demonstrates the full integration of modern infrastructure technologies — from low-power LoRaWAN sensor hardware to Kubernetes orchestration, AI-powered anomaly detection, and a professional-grade web platform.

The system continuously monitors soil moisture and air temperature across the Collserola Natural Park using battery-powered RAK4631 WisBlock sensor nodes. Data flows through a fully automated pipeline: LoRa radio → gateway → ChirpStack LoRaWAN server → MQTT → Node-RED → InfluxDB → Grafana / REST API / AI Telegram Bot. An Isolation Forest machine learning model runs every hour as a Kubernetes CronJob, detecting anomalies before they become critical.

The entire platform is deployed on a private Kubernetes cluster hosted on IsardVDI, Catalonia's educational cloud infrastructure. All software components are open source, achieving enterprise-grade reliability at a fraction of the cost of commercial alternatives.

**Key achievements:**
- Full Kubernetes cluster: 1 master + 2 workers, all namespaces operational
- End-to-end IoT pipeline validated with RAK4631 hardware
- AI anomaly detection: Isolation Forest (scikit-learn), hourly CronJob
- CI/CD: Jenkins + kaniko + Harbor, full automation from git push to production
- Security: Sealed Secrets, Trivy (0 critical vulnerabilities), kube-bench CIS audit
- Observability: Prometheus + Grafana (3 dashboards: IoT, AI, K8s infrastructure)
- Integration tests: 10/10 passed, TLS secured with Let's Encrypt
- Backup: Daily InfluxDB backup to Longhorn PVC + SCP to external storage
- AI Telegram Bot: real-time forest risk analysis powered by Ollama gpt-oss-20b

---

## 1. Problem Statement & Motivation

### 1.1 Context

Forest fires represent one of the most severe environmental and social threats in the Mediterranean region. Climate change is intensifying drought periods, creating increasingly favourable conditions for large-scale fires. Catalonia alone has lost tens of thousands of hectares in recent decades, with economic losses reaching hundreds of millions of euros per year in firefighting costs, infrastructure damage, and ecosystem recovery.

The Collserola Natural Park, located between Barcelona and its inland municipalities, is a particularly sensitive area. It serves as the primary green lung of the Barcelona metropolitan area, providing ecosystem services to over 3 million people. Its proximity to dense urban areas means that a large-scale fire would have catastrophic consequences — not only environmental, but social and economic.

### 1.2 Limitations of Existing Solutions

| Detection Method | Coverage | Response Time | Cost | Limitations |
|-----------------|----------|---------------|------|-------------|
| Human patrols | Very limited | Hours | High (personnel) | Cannot cover entire park continuously |
| Fixed watchtower cameras | Narrow FOV | Minutes | Medium | Weather-dependent, blind spots, high infrastructure cost |
| Aerial surveillance | Wide | Hours | Very high (aircraft) | Not continuous, weather-dependent |
| Satellite imagery | Very wide | Hours–days | Medium–high | Temporal resolution too low for early detection |
| Commercial IoT (Dryad Silvanet) | Wide | Minutes | Very high (subscription) | Proprietary, cloud-dependent, €5,000–50,000/year |

### 1.3 FireSense Approach

FireSense takes a different approach: instead of detecting fire once it has started (smoke, flames), it detects the **conditions that lead to fire** — critically low soil moisture combined with rising temperatures. This enables **pre-fire intervention**: rangers can be alerted and take preventive action before ignition occurs.

The system is designed around three principles:
1. **Open source**: No licensing costs, full control over the stack
2. **On-premises**: No cloud dependency, full data sovereignty
3. **Low cost**: ~€80/node, ~€400/gateway — accessible to municipalities and park authorities

---

## 2. System Architecture

### 2.1 Infrastructure Overview

The entire FireSense platform runs on a private Kubernetes cluster hosted on IsardVDI — the virtualisation platform used by the Catalan educational system.
┌──────────────────────────────────────────────────────────────────┐
│                    IsardVDI Private Cloud                        │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │   k8s-master    │  │  k8s-worker01   │  │  k8s-worker02   │ │
│  │   10.0.0.10     │  │   10.0.0.11     │  │   10.0.0.12     │ │
│  │  control-plane  │  │    workloads    │  │    workloads    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Longhorn Storage                       │   │
│  │           Distributed block storage · 2 replicas         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  Networking: Calico CNI · MetalLB · Traefik Ingress · TLS       │
└──────────────────────────────────────────────────────────────────┘

**Kubernetes namespaces:**

| Namespace | Services |
|-----------|---------|
| `iot` | ChirpStack, Node-RED, Mosquitto, InfluxDB, Grafana, Redis, PostgreSQL-chirpstack, Isolation Forest CronJob, Backup CronJob |
| `firesense` | nginx-web, auth-service, OpenLDAP, PostgreSQL-web, api-rest, ai-bot, Samba |
| `jenkins` | Jenkins CI/CD |
| `harbor` | Harbor Registry + Trivy |
| `monitoring` | Prometheus, node-exporter ×3, kube-state-metrics |
| `traefik` | Traefik IngressController |
| `cert-manager` | Let's Encrypt TLS automation |
| `longhorn-system` | Longhorn distributed storage |
| `kube-system` | Sealed Secrets controller |

### 2.2 IoT Data Pipeline

The IoT pipeline is fully automated from sensor node to dashboard:
┌─────────────────────────────────────────────────────────────┐
│  FIELD                                                       │
│                                                             │
│  RAK4631 Node          RAK4631 Node          RAK4631 Node  │
│  (temp+moisture)       (temp+moisture)       (temp+moisture)│
│       │                      │                      │      │
│       └──────────────────────┴──────────────────────┘      │
│                         LoRa EU868                          │
│                              │                              │
│                      RAK7289V2 Gateway                      │
└──────────────────────────────┼──────────────────────────────┘
│ UDP Packet Forwarder
│ port 1700
┌──────────────────────────────┼──────────────────────────────┐
│  KUBERNETES (iot namespace)  │                              │
│                              ▼                              │
│                    ChirpStack v4                            │
│                 (LoRaWAN network server)                     │
│                    ADR · deduplication                       │
│                    payload decoding                          │
│                              │                              │
│                    MQTT publish                             │
│           topic: application/+/device/+/event/up           │
│                              │                              │
│                    Mosquitto MQTT Broker                    │
│                              │                              │
│                    Node-RED (subscribe)                     │
│                    parse · tag · route                      │
│                              │                              │
│                    InfluxDB 2.7                             │
│                 bucket: sensors · org: firesense            │
│                 retention: 90 days (raw)                    │
│                 retention: 1 year (downsampled)             │
│                              │                              │
│          ┌───────────────────┼───────────────────┐         │
│          ▼                   ▼                   ▼         │
│       Grafana          REST API          Isolation Forest  │
│     Dashboards       /fsapi/v2/api       CronJob (hourly)  │
│          │                   │                   │         │
│          └───────────────────┴───────────────────┘         │
└─────────────────────────────────────────────────────────────┘

### 2.3 Authentication & User Management
User Browser
│
▼
Traefik (HTTPS · TLS · Let's Encrypt)
│
├──▶ nginx-web (static HTML/CSS/JS)
│
└──▶ auth-service (Flask API)
│
├──▶ OpenLDAP (user authentication)
├──▶ PostgreSQL (user data · nodes)
├──▶ Cloudflare Turnstile (CAPTCHA)
└──▶ Resend API (email verification)
│
▼
JWT Token (24h)

### 2.4 CI/CD Pipeline
Developer
│ git push origin dev
▼
GitHub Repository
│ (Jenkins polls every 5 min)
▼
Jenkins Pipeline (jenkins namespace)
│
├─ Stage 1: Checkout
│   git clone dev branch
│
├─ Stage 2: Build firesense-web
│   kaniko build → Harbor push
│   image: firesense-web:BUILD_NUMBER
│
├─ Stage 3: Build auth-service
│   kaniko build → Harbor push
│   image: auth-service:BUILD_NUMBER
│
├─ Stage 4: Deploy to K8s
│   kubectl set image deployment/nginx-web
│   kubectl set image deployment/auth-service
│   kubectl rollout status (wait for healthy)
│
└─ Post: success/failure notification

---

## 3. Hardware Components

### 3.1 Sensor Nodes — RAK4631 WisBlock Core

The RAK4631 is a professional IoT module combining the Nordic Semiconductor nRF52840 (ARM Cortex-M4F, 64 MHz, Bluetooth 5.0) with the Semtech SX1262 LoRa transceiver. It is part of the RAK WisBlock modular ecosystem, allowing different sensor modules to be attached without soldering.

**Specifications:**

| Parameter | Value |
|-----------|-------|
| MCU | Nordic nRF52840 (ARM Cortex-M4F @ 64 MHz) |
| LoRa chip | Semtech SX1262 |
| Frequency | EU868 (863–870 MHz) |
| Max TX power | +22 dBm |
| Receive sensitivity | -148 dBm |
| Sleep current | 2.5 µA |
| Operating voltage | 3.3V / 5V via USB |
| Interface | WisBlock Base connector |

**Attached sensors:**

| Module | Sensor chip | Measurement | Accuracy |
|--------|------------|-------------|----------|
| RAK1901 | SHTC3 (Sensirion) | Air temperature | ±0.2°C |
| RAK1901 | SHTC3 (Sensirion) | Relative humidity | ±2% RH |
| RAK12023 + RAK12035 | ATtiny441 (Microchip) | Soil moisture | ±3% VWC |

**Power budget:**

| State | Current | Duration | Charge/cycle |
|-------|---------|----------|-------------|
| Deep sleep | 2.5 µA | ~3,598 s | 2.5 µAh |
| Wake + measure | 5 mA | 1 s | 1.4 µAh |
| LoRa TX (SF7) | 87 mA | ~0.1 s | 2.4 µAh |
| **Total per hour** | | | **~6.3 µAh** |

With a 1,000 mAh LiPo battery: **~6 months autonomy** at 1 transmission/hour.

### 3.2 Gateway — RAK7289V2 WisGate Edge Pro

The RAK7289V2 is an 8-channel industrial LoRaWAN gateway designed for outdoor deployment.

| Parameter | Value |
|-----------|-------|
| Channels | 8 (half-duplex) |
| Frequency | EU868 |
| Sensitivity | -140 dBm |
| Max TX power | 27 dBm |
| Backhaul | Ethernet + WiFi |
| Enclosure | IP67 (outdoor) |
| Antenna gain | 2.5 dBi (omnidirectional) |
| Estimated range | 5–10 km open terrain · 1–3 km forest |

The gateway runs the Semtech UDP Packet Forwarder, forwarding all received LoRa packets to the ChirpStack network server.

---

## 4. Software Stack

### 4.1 IoT & Data Layer

**ChirpStack v4** acts as the LoRaWAN Network Server, handling:
- OTAA join procedure (device authentication)
- Adaptive Data Rate (ADR) management
- Packet deduplication (multiple gateways)
- JavaScript payload codec (decodes binary → JSON)
- MQTT integration (publishes decoded data)

**Mosquitto** is the MQTT broker connecting ChirpStack to Node-RED. It uses the standard MQTT protocol on port 1883.

**Node-RED** processes incoming MQTT messages:
1. Subscribe to `application/+/device/+/event/up`
2. Parse JSON payload
3. Extract fields: `temperature`, `soil_moisture`, `humidity`, `battery_mv`
4. Add tags: `dev_eui`, `application_id`
5. Write to InfluxDB via HTTP API

**InfluxDB 2.7** stores time-series data:
- Bucket `sensors`: raw data, 90-day retention
- Bucket `sensors-downsampled`: hourly means, 1-year retention
- InfluxDB Task: automatic downsampling every hour

### 4.2 Application Layer

**auth-service** (Flask, Python 3.12):
- REST API for user authentication and management
- LDAP bind authentication against OpenLDAP
- JWT token generation and validation (HS256, 24h expiry)
- User registration with Cloudflare Turnstile CAPTCHA
- Email verification via Resend API
- Admin approval workflow for new users

**api-rest** (Flask + gunicorn, Python 3.12):
- Public REST API for sensor data access
- Endpoints: `/health`, `/sensors`, `/sensors/latest`, `/anomalies`, `/risk`
- Fire risk calculation based on real-time soil moisture and temperature
- Returns JSON, compatible with civil protection systems

**ai-bot** (python-telegram-bot, Python 3.12):
- Telegram bot for forest rangers and operators
- Commands: `/status`, `/risk`, `/anomalies`, `/report`, `/ask`
- AI analysis powered by Ollama (`gpt-oss-20b` model)
- Natural language queries about sensor data

**nginx-web** (Nginx 1.29, Alpine):
- Static web portal: `home.html`, `login.html`, `index.html`, `adminldap.html`, `agents.html`
- Multi-language support: Catalan, Spanish, English
- Responsive design, mobile-friendly
- Forest rangers portal with Leaflet.js interactive map

### 4.3 AI & Machine Learning

**Isolation Forest** (scikit-learn 1.4):
- Unsupervised anomaly detection algorithm
- Input: last 24h of temperature + soil moisture readings
- Parameters: 100 estimators, 5% contamination rate, random_state=42
- Output: anomaly score + binary flag per data point
- Runs as Kubernetes CronJob every hour
- Results stored in InfluxDB `anomalies` measurement

The Isolation Forest algorithm is particularly suitable for this use case because:
- It does not require labelled training data (no historical fire data needed)
- It is computationally efficient for time-series data
- It handles multi-dimensional anomalies (e.g., high temperature + low moisture simultaneously)
- It provides a continuous anomaly score, not just binary classification

### 4.4 Security Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Secret encryption | Sealed Secrets (Bitnami) | Encrypt K8s secrets in git |
| Image scanning | Trivy (Aqua Security) | Detect CVEs in Docker images |
| CIS audit | kube-bench | Validate K8s CIS benchmarks |
| TLS termination | cert-manager + Let's Encrypt | Automatic certificate management |
| Authentication | OpenLDAP + JWT (HS256) | User identity and access control |
| CAPTCHA | Cloudflare Turnstile | Bot protection on registration |
| Email | Resend API | Verified email on registration |
| Registry | Harbor + Trivy | Private registry with vulnerability scanning |

**Sealed Secrets** allows Kubernetes secrets to be safely committed to git. The controller in `kube-system` decrypts them at runtime using an asymmetric keypair. Secrets sealed for one cluster cannot be decrypted in another.

**kube-bench** results (CIS Kubernetes Benchmark v1.8):
- 17 checks PASS
- 2 checks FAIL (fixed: kubelet service file permissions)
- 40 checks WARN (manual checks, documented)

**Trivy scan results**: 0 CRITICAL, 0 HIGH vulnerabilities in production images.

---

## 5. Web Platform

### 5.1 Public Home Page (`/FireSense/`)

The public portal presents FireSense to potential clients, partners, and the general public. It features:
- Full-screen video background showing Collserola forest
- Animated hero text with project value proposition
- Technology showcase section
- Interactive node map preview
- Multi-language selector (CA/ES/EN)
- Link to GitHub repository

### 5.2 Forest Rangers Portal (`/FireSense/agents.html`)

A dedicated, no-login-required interface designed for forest rangers in the field:

- **Interactive Leaflet map**: Shows Collserola Natural Park boundaries and real-time sensor node positions, colour-coded by risk level
- **Global risk indicator**: BAIX (green) / MODERAT (yellow) / ALT (orange) / CRÍTIC (red), updated every 30 seconds
- **Real-time metrics**: Average temperature, soil moisture, number of active nodes, anomaly count in last 24h
- **Alert panel**: Lists recent anomalies detected by Isolation Forest with timestamps
- **Node status**: Per-node health and latest readings
- **Futuristic UI**: Dark theme, neon accents, grid overlay, matching the admin panel aesthetic

### 5.3 User Dashboard (`/FireSense/index.html`)

Authenticated dashboard for registered users:
- Personal LoRaWAN node management (add/remove nodes)
- Real-time sensor data visualisation per node
- Historical data charts (temperature, soil moisture, battery)
- Device status and RSSI/SNR indicators

### 5.4 Admin Panel (`/FireSense/adminldap.html`)

LDAP administration panel for system administrators:
- Pending user registration queue with approve/reject workflow
- User list with LDAP attributes
- User deletion (removes from LDAP + PostgreSQL)
- Real-time updates without page refresh

---

## 6. Operations & Reliability

### 6.1 Horizontal Pod Autoscaling (HPA)

Two HPAs are configured in the `iot` namespace:

| Target | Min replicas | Max replicas | CPU trigger | Memory trigger |
|--------|-------------|-------------|-------------|----------------|
| Grafana Deployment | 1 | 3 | 70% | 80% |
| Node-RED StatefulSet | 1 | 3 | 70% | 80% |

The HPAs use the `metrics-server` (deployed in `kube-system`) to collect real-time CPU and memory metrics and automatically scale pods up or down based on demand.

### 6.2 Backup & Disaster Recovery

**Daily backup procedure** (02:00 AM):
1. `influxdb-backup` CronJob runs in `iot` namespace
2. `influx backup` downloads a full snapshot to `/backups/` (Longhorn PVC)
3. Snapshot is compressed to `.tar.gz`
4. Master relay script (`backup-relay.sh`) copies the file via SCP to external client (`192.168.244.99`)
5. Files older than 7 days are automatically deleted from PVC

**Disaster Recovery Plan** (`k8s/iot/DRP-FireSense.md`):
- RTO (Recovery Time Objective): < 2 hours
- RPO (Recovery Point Objective): < 24 hours
- Documented procedures for: pod failure, node failure, InfluxDB data loss, corrupted Harbor image, full cluster failure

### 6.3 Observability

**Three-layer observability stack:**

| Layer | Technology | What it monitors |
|-------|-----------|-----------------|
| Infrastructure metrics | Prometheus + node-exporter | CPU, memory, disk, network per node |
| K8s metrics | kube-state-metrics | Pod status, deployment health, HPA state |
| Application data | InfluxDB + Grafana | Sensor readings, anomaly scores, fire risk |

**Grafana dashboards:**
1. **FireSense — IoT Sensors**: Temperature and soil moisture time series, current risk gauge
2. **FireSense — Anomalies IA**: Isolation Forest scores, anomaly count, temporal distribution
3. **FireSense — Infraestructura K8s**: CPU/memory per pod, node disk usage, HPA replica count

---

## 7. Project Management

### 7.1 Scrum Methodology

The project was managed using Scrum with ProofHub as the project management tool. Three sprints were defined at project kick-off, each with clear deliverables and acceptance criteria.

**Sprint 1 — Foundation (Weeks 1–3)**

| Task | Responsible | Status |
|------|-------------|--------|
| K8s cluster provisioning (IsardVDI) | Adriano + Francisco | ✅ Done |
| Network configuration + fixed IPs | Francisco | ✅ Done |
| MING stack Dockerfiles | Adriano | ✅ Done |
| K8s manifests (all services) | Francisco | ✅ Done |
| OpenLDAP configuration | Hamza | ✅ Done |
| GitHub repository + documentation | Adriano | ✅ Done |
| Technology comparison | All | ✅ Done |
| Hardware selection + LoRaWAN setup | Adriano + Hamza | ✅ Done |

**Sprint 2 — Security & Infrastructure (Weeks 4–7)**

| Task | Responsible | Status |
|------|-------------|--------|
| Sealed Secrets + Trivy + kube-bench | Adriano | ✅ Done |
| CI/CD Jenkins + kaniko | Adriano | ✅ Done |
| HPA (Grafana + Node-RED) | Hamza | ✅ Done |
| InfluxDB retention policies | Adriano | ✅ Done |
| Backup CronJob + DRP | Hamza | ✅ Done |
| AI Telegram Bot | Hamza | ✅ Done |
| Prometheus + Samba | Francisco | ✅ Done |
| Harbor Trivy scanning | Adriano | ✅ Done |

**Sprint 3 — Features & AI (Weeks 8–10)**

| Task | Responsible | Status |
|------|-------------|--------|
| Forest Rangers Portal (Leaflet) | Hamza + Adriano | ✅ Done |
| REST API + Isolation Forest | Hamza + Francisco | ✅ Done |
| Grafana dashboards (IoT + AI + K8s) | Hamza + Francisco | ✅ Done |
| Technical documentation (English) | Francisco + Hamza | ✅ Done |
| Sustainability plan | Adriano + Francisco | ✅ Done |
| Integration tests + pentest | Hamza | ✅ Done |
| Demo + presentation | All | ⏳ 18/05/2026 |

### 7.2 Git Workflow
main (production — protected branch)
└── dev (development — all work here)
└── commits per task
format: type(scope): description
examples:
feat: add HPA for Grafana and Node-RED
fix: use /tmp/kubectl in Jenkins pipeline
docs: add Sprint 2 & 3 technical documentation

All production deployments go through the Jenkins CI/CD pipeline — no direct `kubectl apply` in production.

### 7.3 Communication & Tools

| Tool | Usage |
|------|-------|
| ProofHub | Sprint planning, task tracking, Gantt chart, meeting minutes |
| GitHub | Source code, manifests, documentation |
| Jenkins | CI/CD pipeline, build history |
| Harbor | Docker image registry, vulnerability reports |
| Headlamp | Kubernetes visual dashboard |
| Telegram | Team communication + AI bot testing |

---

## 8. Results & Metrics

### 8.1 Technical KPIs

| KPI | Target | Result |
|-----|--------|--------|
| Integration tests passing | 100% | ✅ 10/10 (100%) |
| Critical vulnerabilities in images | 0 | ✅ 0 (Trivy) |
| kube-bench CIS FAIL checks | 0 | ✅ 2 (fixed) |
| TLS certificate valid | Yes | ✅ Let's Encrypt, exp. Aug 2026 |
| CI/CD build time | < 5 min | ✅ ~3 minutes |
| Backup frequency | Daily | ✅ 02:00 AM daily |
| HPA configured | Yes | ✅ Grafana + Node-RED |
| Namespaces operational | 8 | ✅ 8/8 |
| Services deployed | 20+ | ✅ 24 services |

### 8.2 Infrastructure Summary
kubectl get pods -A | grep Running | wc -l
→ 24 pods running across 8 namespaces
kubectl get pvc -A | grep Bound | wc -l
→ 8 persistent volumes bound (Longhorn)
kubectl get hpa -A
→ 2 HPAs active (Grafana, Node-RED)
kubectl get cronjob -A
→ 3 CronJobs (backup, isolation-forest, downsampling)

### 8.3 Cost Analysis

**Hardware cost (per deployment unit):**

| Item | Unit cost | Qty | Total |
|------|-----------|-----|-------|
| RAK4631 + RAK19007 | €45 | 3 | €135 |
| RAK1901 sensor | €10 | 3 | €30 |
| RAK12023+RAK12035 | €25 | 3 | €75 |
| LiPo 1000mAh | €8 | 3 | €24 |
| RAK7289V2 gateway | €380 | 1 | €380 |
| **Total hardware** | | | **€644** |

**Software cost:** €0 (100% open source)

**vs. Dryad Silvanet** (closest commercial competitor): €15,000–€50,000/year subscription + hardware

**vs. Pano AI** (camera-based): €30,000–€100,000/year per camera

---

## 9. Lessons Learned

### 9.1 Technical Challenges

**Challenge 1: Docker socket unavailable in K8s workers**  
Workers use containerd, not Docker. Solution: replaced Docker-in-Docker with kaniko for image builds in the CI/CD pipeline. kaniko builds images from Dockerfiles without requiring a Docker daemon.

**Challenge 2: SCP from Kubernetes pods to external network**  
Pods (Calico network, 172.16.x.x) cannot reach the external client network (192.168.244.x). Solution: master relay script — pod writes backup to PVC, master node reads it via `kubectl cp` and forwards via SCP.

**Challenge 3: Sealed Secrets controller name**  
The default controller name expected by `kubeseal` is `sealed-secrets-controller`, but our Helm deployment named it `sealed-secrets`. Fixed by passing `--controller-name=sealed-secrets` flag.

**Challenge 4: Jenkins authentication after restart**  
JENKINS_OPTS env var was lost on pod restart. Solution: `kubectl set env` persists it in the StatefulSet spec, surviving restarts.

**Challenge 5: InfluxDB measurement naming inconsistency**  
Legacy code used `espurna_sensors` measurement name from a previous project. Systematically replaced all references with `sensor_data` across Node-RED flows, web JS, and AI bot.

### 9.2 DevOps Best Practices Applied

- **Infrastructure as Code**: All K8s resources defined in YAML manifests in git
- **GitOps**: No manual changes to production — everything goes through git + CI/CD
- **Secrets management**: No plaintext secrets in git — all secrets sealed or in env vars
- **Immutable deployments**: Each build creates a new image tag, enabling rollbacks
- **Observability first**: Prometheus + Grafana set up from Sprint 2, not as afterthought

### 9.3 Team Reflections

**Hamza Tayibi:**  
*"The most rewarding part was integrating the Isolation Forest AI with the Kubernetes CronJob and seeing it detect anomalies automatically. The REST API + Rangers Portal combination gives the system a real-world utility that goes beyond the academic context."*

**Adriano Calderón:**  
*"Building the complete IoT pipeline from hardware to dashboard taught me how many moving parts are involved in a production IoT system. The CI/CD pipeline with kaniko was particularly challenging but satisfying to get working."*

**Francisco Diaz:**  
*"Managing the Kubernetes networking with Traefik, Calico, and MetalLB gave me a deep understanding of how modern cloud-native infrastructure works. The Prometheus + Grafana observability stack is something I'll use in every future project."*

---

## 10. Conclusions & Future Work

### 10.1 Conclusions

FireSense demonstrates that a production-grade IoT monitoring system for environmental applications can be built with open-source technologies at a fraction of the cost of commercial alternatives. The project successfully integrates:

- **Hardware**: Professional LoRaWAN sensor nodes with multi-month battery life
- **Network**: Standards-based LoRaWAN protocol with ChirpStack network server
- **Data**: InfluxDB time-series database with automated retention and downsampling
- **AI**: Unsupervised anomaly detection running autonomously as a K8s CronJob
- **Security**: Multi-layer security (TLS, LDAP, JWT, Sealed Secrets, Trivy, kube-bench)
- **Operations**: CI/CD, HPA, daily backups, DRP, observability

The system is ready for a pilot field deployment in Collserola.

### 10.2 Future Work

**Short-term (6–12 months):**
- Field deployment: 5 sensor nodes distributed across Collserola
- Solar power panel integration (eliminate battery replacement)
- Wind speed sensor (anemometer) for improved fire risk model
- Push notifications to forest ranger mobile app

**Medium-term (1–2 years):**
- Predictive AI model (LSTM neural network) for fire probability forecasting
- Integration with 112 Catalonia emergency services API
- Multi-gateway coverage for redundancy
- Expansion to Garraf and Montnegre natural parks

**Long-term (2–5 years):**
- Satellite imagery integration (Copernicus/Sentinel data)
- Regional deployment network across Catalonia
- Open data platform for researchers and municipalities
- Commercial spin-off for Mediterranean region municipalities

---

## 11. References

### Academic & Standards
- LoRa Alliance. (2020). *LoRaWAN® Specification v1.0.4*. LoRa Alliance.
- ETSI EN 300 220 — Short Range Devices, EU868 frequency band regulations
- CIS Kubernetes Benchmark v1.8 — Center for Internet Security

### Hardware Documentation
- RAK Wireless. (2024). *RAK4631 WisBlock Core Datasheet*. https://docs.rakwireless.com
- RAK Wireless. (2024). *RAK7289V2 WisGate Edge Pro Datasheet*. https://docs.rakwireless.com
- RAK Wireless. (2024). *RAK1901 WisBlock Sensor Datasheet*. https://docs.rakwireless.com
- RAK Wireless. (2024). *RAK12023/RAK12035 Soil Moisture Sensor*. https://docs.rakwireless.com

### Software Documentation
- ChirpStack. (2024). *ChirpStack v4 Documentation*. https://www.chirpstack.io/docs/
- InfluxData. (2024). *InfluxDB 2.x Documentation*. https://docs.influxdata.com/
- Grafana Labs. (2024). *Grafana Documentation*. https://grafana.com/docs/
- scikit-learn. (2024). *IsolationForest API Reference*. https://scikit-learn.org/
- Kubernetes. (2024). *Kubernetes Documentation v1.29*. https://kubernetes.io/docs/
- Traefik. (2024). *Traefik Proxy Documentation*. https://doc.traefik.io/traefik/
- Longhorn. (2024). *Longhorn Storage Documentation*. https://longhorn.io/docs/
- Harbor. (2024). *Harbor Registry Documentation*. https://goharbor.io/docs/
- Bitnami. (2024). *Sealed Secrets Documentation*. https://sealed-secrets.netlify.app/
- Aqua Security. (2024). *Trivy Documentation*. https://trivy.dev/

### Environmental Context
- Departament d'Acció Climàtica. (2024). *Estadístiques d'incendis forestals a Catalunya*. Generalitat de Catalunya.
- Consorci del Parc Natural de la Serra de Collserola. (2024). *Pla especial de protecció del medi natural i del paisatge*. Diputació de Barcelona.

---

## Appendix A — Service URLs

| Service | URL |
|---------|-----|
| Web portal | `/FireSense/` |
| Login | `/FireSense/login.html` |
| Dashboard | `/FireSense/index.html` |
| Rangers portal | `/FireSense/agents.html` |
| Admin panel | `/FireSense/adminldap.html` |
| REST API | `/fsapi/v2/api/` |
| ChirpStack | `/chirpstack` |
| Grafana | `/grafana` |
| Node-RED | `/nodered/` |
| Harbor | `/harbor` |
| Jenkins | `/jenkins` |
| Headlamp | `/headlamp` |
| Prometheus | `/prometheus` |

## Appendix B — Repository Structure
FireSense/
├── README.md
├── Jenkinsfile
├── backend-server/
│   ├── k8s-web-services/
│   │   ├── src-web/          # HTML/CSS/JS web portal
│   │   ├── auth-service/     # Flask auth API + Dockerfile
│   │   ├── api-rest/         # Flask REST API + Dockerfile
│   │   ├── ai-bot/           # Telegram AI bot + Dockerfile
│   │   └── isolation-forest/ # Anomaly detection + Dockerfile
│   ├── grafana/              # Grafana provisioning
│   ├── influxdb/             # InfluxDB configuration
│   └── node-red/             # Node-RED flows
├── k8s/
│   ├── iot/                  # IoT namespace manifests
│   ├── firesense/            # App namespace manifests
│   ├── jenkins/              # Jenkins manifests
│   ├── monitoring/           # Prometheus manifests
│   ├── grafana-dashboards/   # Exported Grafana JSON
│   └── tests/                # Integration tests + security reports
└── docs/
├── 01-architecture/      # Technical documentation
├── 02-sprints/           # Sprint planning & reviews
├── 03-tech-comparison/   # Technology comparison
├── 04-occupational-risks/
├── 06-manuals/
└── 07-market-analysis/

---

*FireSense — Institut Tecnològic de Barcelona · ASIX2c · 2025–2026*  
*Authors: Hamza Tayibi · Adriano Calderón · Francisco Diaz*  
*Repository: https://github.com/AdrianoCalderon-ITB2425/FireSense\*  
*Presentation: 18 May 2026*
