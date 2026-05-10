# Sprint 2 & 3 — Technical Documentation

## Sprint 2 — Infrastructure & Security

### 2.6 Sealed Secrets + Trivy + kube-bench

**Sealed Secrets** encrypts Kubernetes secrets using asymmetric cryptography. The controller runs in `kube-system` and decrypts secrets at runtime.

```bash
# Seal a secret
kubectl get secret <name> -n <ns> -o yaml | \
  kubeseal --controller-name=sealed-secrets \
  --controller-namespace=kube-system --format yaml > sealed-secret.yaml
```

Sealed secrets are stored in `k8s/iot/`:
- `sealed-backup-scp-secret.yaml`
- `sealed-backup-ssh-key.yaml`
- `sealed-chirpstack-postgres-secret.yaml`

**Trivy** scanning is enabled in Harbor for all images. Results: `firesense-web:v13` and `auth-service:v10` — 0 vulnerabilities.

**kube-bench** CIS audit results: 17 PASS, 2 FAIL (fixed), 40 WARN. Report: `k8s/kube-bench-report.txt`.

---

### 2.8 CI/CD Jenkins Pipeline

Jenkins is deployed in the `jenkins` namespace, accessible at `/jenkins`.

Pipeline stages:
1. **Checkout** — clones `dev` branch from GitHub
2. **Build firesense-web** — kaniko builds image, pushes to Harbor
3. **Build auth-service** — kaniko builds image, pushes to Harbor
4. **Deploy to K8s** — `kubectl set image` + rollout status

Kaniko is used instead of Docker-in-Docker because worker nodes use containerd.

```bash
# Trigger a build manually
# Go to /jenkins/job/FireSense/job/pipeline-firesense/
# Click "Construir ara"
```

---

### 2.9 HPA — Horizontal Pod Autoscaler

HPAs are configured for Grafana and Node-RED in the `iot` namespace.

| Service | Min | Max | CPU target | Memory target |
|---------|-----|-----|-----------|---------------|
| Grafana | 1 | 3 | 70% | 80% |
| Node-RED | 1 | 3 | 70% | 80% |

```bash
kubectl get hpa -n iot
```

---

### 2.10 InfluxDB Retention Policies

| Bucket | Retention | Purpose |
|--------|-----------|---------|
| `sensors` | 2160h (90 days) | Raw sensor data |
| `sensors-downsampled` | 8760h (1 year) | Hourly aggregated data |

Downsampling task runs every hour via InfluxDB Tasks.

---

### 2.11 InfluxDB Backup CronJob + DRP

**CronJob** runs daily at 02:00 AM in `iot` namespace:
1. Downloads InfluxDB backup to Longhorn PVC
2. Master relay script copies backup via SCP to client (`192.168.244.99`)
3. Backups older than 7 days are deleted automatically

```bash
# Manual backup test
bash ~/FireSense/k8s/iot/backup-relay.sh

# View CronJob status
kubectl get cronjob -n iot
```

DRP document: `k8s/iot/DRP-FireSense.md`

---

### 2.12 Telegram AI Bot

The FireSense AI Bot is deployed in the `firesense` namespace.

Commands:
- `/status` — latest sensor reading
- `/risk` — fire risk analysis (last 24h)
- `/anomalies` — anomaly detection (last 24h)
- `/report [hours]` — summary report
- `/ask <question>` — natural language query

The bot uses Ollama (`gpt-oss-20b`) for AI analysis and connects to InfluxDB for data.

---

### 2.13 Prometheus + Samba

**Prometheus** (`kube-prometheus-stack`) is deployed in `monitoring` namespace:
- `node-exporter` on all 3 nodes
- `kube-state-metrics` for K8s metrics
- Prometheus datasource added to Grafana

**Samba** is deployed in `firesense` namespace, integrated with OpenLDAP for authentication.

---

## Sprint 3 — Features & AI

### 3.1 Forest Rangers Portal

URL: `/FireSense/agents.html`

Features:
- Interactive Leaflet map of Collserola Natural Park
- Real-time fire risk level (BAIX/MODERAT/ALT/CRÍTIC)
- Live sensor metrics updated every 30 seconds
- Anomaly alerts from Isolation Forest
- IoT node status panel
- No login required — designed for field agents

---

### 3.2 REST API + Isolation Forest

**REST API** (`api-rest` deployment, `firesense` namespace):

| Endpoint | Description |
|----------|-------------|
| `GET /fsapi/v2/api/health` | Health check |
| `GET /fsapi/v2/api/sensors?hours=24` | Sensor data |
| `GET /fsapi/v2/api/sensors/latest` | Latest readings |
| `GET /fsapi/v2/api/anomalies` | Anomaly results |
| `GET /fsapi/v2/api/risk` | Fire risk level |

**Isolation Forest CronJob** runs hourly in `iot` namespace:
- Algorithm: `sklearn.ensemble.IsolationForest` (contamination=5%)
- Writes results to InfluxDB `anomalies` measurement
- Feeds Grafana dashboard and REST API

---

### 3.3 Grafana Dashboards

Three dashboards created:

| Dashboard | Description |
|-----------|-------------|
| FireSense — IoT Sensors | Temperature, soil moisture time series |
| FireSense — Anomalies IA | Isolation Forest scores and detected anomalies |
| FireSense — Infraestructura K8s | CPU, memory, pods, HPA, disk per node |

Datasources: InfluxDB (IoT data) + Prometheus (infrastructure).

---

### 3.7 Integration Tests + Pentest

**Integration tests** (`k8s/tests/integration-tests.sh`): 10/10 passed.

Services tested: Web portal, Login, Dashboard, Auth API, ChirpStack, Grafana, Node-RED, Harbor, Jenkins.

**Security scan**: nmap + nikto against HTTPS endpoint.
- TLS: Let's Encrypt certificate, valid until August 2026
- Cipher: TLS_AES_128_GCM_SHA256
- X-Content-Type-Options: nosniff ✅
- HSTS: configured via Traefik middleware

Reports: `k8s/tests/nmap-report.txt`, `k8s/tests/nikto-report.txt`

---

# Sprint 1 — Foundation & Initial Setup

## 1.1 Kick-off & Role Assignment

| Member | Role |
|--------|------|
| Hamza Tayibi | Backend/Web Developer |
| Adriano Calderón | Backend/IoT Developer |
| Francisco Diaz | Scrum Master / Network |

## 1.2 Repository & Documentation

- GitHub repository created: `AdrianoCalderon-ITB2425/FireSense`
- Branches: `main` (production) · `dev` (development)
- Documentation structure: `docs/01-architecture/`, `docs/02-sprints/`, etc.
- README in English with full project description

## 1.4 IsardVDI Provisioning & Kubernetes Installation

Cluster: 1 master + 2 workers on IsardVDI private cloud.

| Node | Role | IP |
|------|------|----|
| k8s-master | control-plane | 10.0.0.10 |
| k8s-worker01 | worker | 10.0.0.11 |
| k8s-worker02 | worker | 10.0.0.12 |

Components installed: kubeadm, kubelet, kubectl, Calico CNI, MetalLB, Longhorn, Traefik, cert-manager, Headlamp.

## 1.6 OpenLDAP Configuration

OpenLDAP deployed in `firesense` namespace with:
- Base DN: `dc=firesense,dc=io`
- OUs: `users`, `groups`, `devices`
- Admin: `cn=admin,dc=firesense,dc=io`
- Integrated with auth-service (JWT) and Samba

## 1.8 Dockerfiles — MING Stack

Dockerfiles created for:
- Mosquitto MQTT broker
- InfluxDB 2.7
- Node-RED
- Grafana

## 1.9 Docker Compose — Dev Environment

`docker-compose.prod.yml` for local development and testing before K8s deployment.

## 1.10 & 1.11 Kubernetes Manifests

Manifests created for all MING stack components:
- `k8s/iot/` — Mosquitto, InfluxDB, Node-RED, Grafana, ChirpStack, Redis, PostgreSQL
- `k8s/firesense/` — nginx-web, auth-service, OpenLDAP, PostgreSQL-web

## 1.12 Technologies & Hardware

See `docs/03-tech-comparison/` for full technology comparison.

Hardware selected:
- **Gateway**: RAK7289V2 WisGate Edge Pro
- **Nodes**: RAK4631 WisBlock Core (nRF52840 + SX1262)
- **Sensors**: RAK1901 (temp/humidity) + RAK12023/RAK12035 (soil moisture)
