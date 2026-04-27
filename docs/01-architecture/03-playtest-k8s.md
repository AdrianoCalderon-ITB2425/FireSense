# FireSense Kubernetes Architecture – Test Suite

> **Purpose**: Validate all components of the FireSense cloud-native deployment after initial setup and before the final TFG presentation.  
> **Target environment**: Kubernetes v1.34 vanilla (kubeadm), Calico, Longhorn, Traefik, Harbor, IoT services (Mosquitto, InfluxDB 2.7, Node‑RED, Grafana), Falco, Trivy Operator.

[**1. Infrastructure & Cluster Tests**](#1-infrastructure--cluster-tests)  
[**2. Networking & Ingress Tests**](#2-networking--ingress-tests)  
[**3. Storage Tests (Longhorn)**](#3-storage-tests-longhorn)  
[**4. Core IoT Services Tests**](#4-core-iot-services-tests)  
[**5. Harbor Registry Tests**](#5-harbor-registry-tests)  
[**6. Monitoring & Observability Tests**](#6-monitoring--observability-tests)  
[**7. Security Tests**](#7-security-tests)  
[**8. Migration Validation (Data Integrity)**](#8-migration-validation-data-integrity)  
[**9. Performance & Resilience Baseline**](#9-performance--resilience-baseline)

---

## 1. Infrastructure & Cluster Tests

| ID | Test Case | Steps | Expected Outcome |
|:---|:---|:---|:---|
| **INF‑01** | All nodes Ready | `kubectl get nodes` | 3 nodes with STATUS Ready, OS Ubuntu 24.04, kubelet v1.34.x |
| **INF‑02** | Container runtime | `kubectl get nodes -o wide` and check `CONTAINER-RUNTIME` column | All show `containerd://2.0.x` |
| **INF‑03** | CoreDNS pods running | `kubectl -n kube-system get pods -l k8s-app=kube-dns` | All pods Running (2 or 3 replicas) |
| **INF‑04** | Metrics server functional | `kubectl top nodes` | CPU & RAM values displayed without errors |
| **INF‑05** | Calico components healthy | `kubectl get tigerastatus` | All core resources at `Available=True` |

---

## 2. Networking & Ingress Tests

| ID | Test Case | Steps | Expected Outcome |
|:---|:---|:---|:---|
| **NET‑01** | MetalLB static IPs assigned | `kubectl get svc -A \| grep LoadBalancer` | Traefik service has EXTERNAL‑IP within 10.0.0.240‑250; Mosquitto has 10.0.0.241 |
| **NET‑02** | Traefik default IngressClass | `kubectl get ingressclass` | `traefik` listed as default |
| **NET‑03** | HTTPS subpath routing (FireSense frontend) | Browser: `https://<your-domain>/FireSense/` | FireSense dashboard loads (no certificate warning) |
| **NET‑04** | HTTPS subpath routing (Grafana) | Browser: `https://<your-domain>/grafana/` | Grafana login page appears |
| **NET‑05** | HTTPS subpath routing (Node‑RED) | Browser: `https://<your-domain>/nodered/` | Node‑RED editor/login loads |
| **NET‑06** | HTTPS subpath routing (Harbor) | Browser: `https://<your-domain>/harbor/` | Harbor login page appears |
| **NET‑07** | HTTPS subpath routing (Longhorn) | Browser: `https://<your-domain>/longhorn/` | Longhorn dashboard (basic‑auth prompt) |
| **NET‑08** | NetworkPolicy default‑deny (IoT ns) | `kubectl -n iot run test-net --image=curlimages/curl --rm -it -- curl --max-time 5 http://influxdb.iot:8086/health` | Command times out (exit code 28) |
| **NET‑09** | Allowed flow: Grafana → InfluxDB | `kubectl -n iot exec -it grafana-... -- curl -s http://influxdb:8086/health` | Returns HTTP 200 |
| **NET‑10** | Allowed flow: Node‑RED → Mosquitto | `kubectl -n iot exec -it nodered-... -- nc -zv mosquitto 1883` | Connection succeeded |
| **NET‑11** | MQTT direct external access | From a campus host: `mosquitto_sub -h 10.0.0.241 -p 8883 --cafile ca.crt -u sensor -P pass -t test` | Subscribes and waits for messages |

---

## 3. Storage Tests (Longhorn)

| ID | Test Case | Steps | Expected Outcome |
|:---|:---|:---|:---|
| **STG‑01** | StorageClass defaults | `kubectl get sc` | `longhorn (default)` and `longhorn-replicated`, `longhorn-single-replica` present |
| **STG‑02** | Dynamic PVC creation | `kubectl apply -f test-pvc.yaml` (RWO, 1Gi, class: longhorn) | PVC bound to PV, pod mounts and writes/reads back data |
| **STG‑03** | Replicated volume health | In Longhorn UI: check any `longhorn-replicated` volume | All replicas healthy, no degraded |
| **STG‑04** | Snapshot creation | `kubectl -n longhorn-system apply -f snapshot.yaml` (or via UI) | Snapshot appears in Longhorn UI, no errors |
| **STG‑05** | Backup to MinIO (if configured) | Trigger backup in UI or via RecurringJob | Backup completes, visible in MinIO bucket |
| **STG‑06** | Node failure simulation (replica rebuild) | Cordon worker01 → delete pod → uncordon | Volume remains available, replicas rebuild automatically on another node |

---

## 4. Core IoT Services Tests

### 4.1 Mosquitto MQTT Broker

| ID | Test Case | Steps | Expected Outcome |
|:---|:---|:---|:---|
| **MQ‑01** | Pod running | `kubectl -n iot get pods -l app=mosquitto` | 1/1 READY, STATUS Running |
| **MQ‑02** | TLS listener active | `kubectl -n iot exec -it mosquitto-0 -- netstat -tlnp \| grep 8883` | Port 8883 listening |
| **MQ‑03** | Client authentication | `mosquitto_pub -h 10.0.0.241 -p 8883 --cafile ca.crt -u wrong -P wrong -t error` | Connection refused (bad credentials) |
| **MQ‑04** | Data persistence after restart | `kubectl -n iot delete pod mosquitto-0` (StatefulSet restarts) → republish retained message | Message still present on topic |

### 4.2 InfluxDB 2.7

| ID | Test Case | Steps | Expected Outcome |
|:---|:---|:---|:---|
| **INF‑01** | Pod & health endpoint | `kubectl -n iot exec -it influxdb-0 -- influx ping` | `OK` |
| **INF‑02** | Bucket and org exist | `kubectl -n iot exec -it influxdb-0 -- influx bucket list --org firesense` | `sensores` bucket listed |
| **INF‑03** | Write data via API | `curl -XPOST http://influxdb.iot:8086/api/v2/write...` (inside Node‑RED pod) | 204 No Content |
| **INF‑04** | Read from Grafana | Grafana dashboard > explore with Flux query | Returns last 5 minutes of sensor data |
| **INF‑05** | Volume expansion | Increase PVC size (if needed) → `kubectl edit pvc data-influxdb-0` | Longhorn expands volume, InfluxDB filesystem grows after `resize2fs` |

### 4.3 Node‑RED

| ID | Test Case | Steps | Expected Outcome |
|:---|:---|:---|:---|
| **NR‑01** | Flow editor accessible | Browser: `https://<domain>/nodered/` | Login page (if auth set) or flow editor |
| **NR‑02** | Flows persist across restarts | Deploy a simple flow (inject → debug) → delete pod → wait restart | Flow still present after pod restart |
| **NR‑03** | MQTT node connectivity | Add MQTT In node → configure with `mqtts://mosquitto:8883` → deploy | Status shows “connected” (green dot) |
| **NR‑04** | InfluxDB write node | Add InfluxDB out node with `http://influxdb:8086` and token → deploy | Data appears in InfluxDB bucket after injection |

### 4.4 Grafana

| ID | Test Case | Steps | Expected Outcome |
|:---|:---|:---|:---|
| **GR‑01** | Dashboard persistence | `kubectl -n iot delete pod grafana-...` → pod restarts | Previously created dashboards still exist |
| **GR‑02** | Datasource provisioned | Grafana home > configuration > data sources | InfluxDB‑FireSense listed and tests OK |
| **GR‑03** | FireSense dashboard (if imported) | Load dashboard ID or import JSON | Panels display historical data |

---

## 5. Harbor Registry Tests

| ID | Test Case | Steps | Expected Outcome |
|:---|:---|:---|:---|
| **HR‑01** | UI accessible | Browser: `https://<domain>/harbor/` | Harbor login page (admin user) |
| **HR‑02** | Push image with docker | `docker login <domain>/harbor/` → `docker push firesense-bot:v1.0` | Push succeeds, image visible in `firesense` project |
| **HR‑03** | Auto‑scan vulnerability detection | Push an old image (e.g., `node:14`) | Scan completes, UI shows CVEs and severity |
| **HR‑04** | Prevent vulnerable images (if enabled) | Try to pull/promote an image with Critical CVEs | Pull prevented by policy |
| **HR‑05** | Robot account pull | `kubectl -n iot create secret docker-registry ...` → deploy pod referencing harbor image | Pod starts using robot token, no auth error |
| **HR‑06** | Cosign signature verification | `cosign verify --key cosign.pub harbor...` after signing | Verification output shows signed identity |
| **HR‑07** | Tag immutability | Attempt to overwrite a `v1.0` tag (with immutability rule) | Overwrite rejected with HTTP 405 |

---

## 6. Monitoring & Observability Tests

| ID | Test Case | Steps | Expected Outcome |
|:---|:---|:---|:---|
| **MON‑01** | Prometheus targets up | Port‑forward `kube-prometheus-stack-prometheus:9090` → Status > Targets | All targets (node‑exporter, cAdvisor, metrics‑server, etc.) UP |
| **MON‑02** | Grafana (monitoring) accessible | Browser: `https://<domain>/grafana-mon/` (if exposed) or port‑forward | Default dashboards load, cluster metrics visible |
| **MON‑03** | ServiceMonitor for InfluxDB | `kubectl -n iot get servicemonitor` (if created) | Target appears in Prometheus, `/metrics` scraped | 
| **MON‑04** | Falco alerts reach Falcosidekick | Port‑forward Falcosidekick UI (:2802) → generate shell in pod (`kubectl exec -it mosquitto-0 -- sh`) | Alert “Terminal shell in container” appears in UI within seconds |
| **MON‑05** | Trivy Operator reports | `kubectl -n trivy-system get vulnerabilityreports` | Reports generated for all namespaces; check for new CVEs older than 24h |

---

## 7. Security Tests

| ID | Test Case | Steps | Expected Outcome |
|:---|:---|:---|:---|
| **SEC‑01** | Pod Security Admission (restricted) | Try to deploy a privileged pod in `iot` namespace: `kubectl apply -f test-priv.yaml` | Admission webhook rejects with “violates PodSecurity” |
| **SEC‑02** | RBAC – anonymous access denied | `kubectl --kubeconfig=/dev/null get ns` | Unauthorized/Forbidden error |
| **SEC‑03** | Secrets not exposed in pod env plaintext | `kubectl -n iot describe pod influxdb-0` | Secret values show `<set+key>` not the literal string |
| **SEC‑04** | NetworkPolicy egress monitoring | From `default` namespace try to reach `influxdb.iot:8086` | Blocked (timeout), logged by Calico if GlobalNetworkPolicy with Log enabled |
| **SEC‑05** | Audit log entries for API calls | Check `/var/log/kubernetes/audit/audit.log` on master | Logs entries for non‑read requests (create/patch/delete) |
| **SEC‑06** | TLS certificates valid | Open browser dev tools → security tab | Certificate chain valid, issued by Let's Encrypt (or staging CA during test) |
| **SEC‑07** | Harbor image scanning blocks deployment | Push image with known critical vulnerability, try to deploy referencing that image from Harbor → admission controller? | If configured, Trivy Operator/OPA prevents deployment. Otherwise, at least Harbor marks as vulnerable. |

---

## 8. Migration Validation (Data Integrity)

| ID | Test Case | Steps | Expected Outcome |
|:---|:---|:---|:---|
| **MIG‑01** | Mosquitto retained messages migrated? | (If backup/restore was performed) Publish retained msg in old Compose → restore in K8s → subscribe | Retained message present on topic |
| **MIG‑02** | Node‑RED flows identical | Export flows JSON from Compose, import into K8s Node‑RED | All flows, subflows, and connections match |
| **MIG‑03** | Grafana dashboards migrated | Backup `grafana.db` (SQLite) or JSON export from Compose, import into K8s Grafana | All dashboards, panels, and variables replicated |
| **MIG‑04** | InfluxDB historical data | `influx backup` from Compose → `influx restore` to K8s | Same number of points, bucket schemas preserved, queries return identical results |

---

## 9. Performance & Resilience Baseline

| ID | Test Case | Steps | Expected Outcome |
|:---|:---|:---|:---|
| **PER‑01** | Pod recovery after kill | `kubectl -n iot delete pod mosquitto-0` → measure downtime | New pod Ready in <30 s, MQTT client automatically reconnects |
| **PER‑02** | Worker node failure | Simulate worker02 shutdown (if allowed) | All pods rescheduled to worker01; volumes with >1 replica remain RW; services available after new pods Ready |
| **PER‑03** | Resource headroom under load | Generate synthetic MQTT messages (100 msg/s for 5 min) while running `kubectl top pods -A` | CPU/memory stay within limits; no OOMKills; node memory <85% |
| **PER‑04** | Harbor push/pull speed | Push a 200 MB image and measure time | Within acceptable limits for LAN (<2 min), no timeouts |
| **PER‑05** | Ingress throughput | `ab -n 1000 -c 10 https://<domain>/grafana/` (from internal network) | Requests per second >50, no failed requests |

---

**Execution guide**:  
- Run **INF‑01** to **INF‑05** immediately after cluster bootstrap.  
- **NET‑01** to **NET‑11** after MetalLB, Traefik, and NetworkPolicy deployment.  
- **STG‑01** to **STG‑06** after Longhorn install.  
- **MQ‑01**, **INF‑01**, **NR‑01**, **GR‑01** after each IoT service is deployed.  
- **HR‑01** to **HR‑07** after Harbor is ready.  
- **MON‑01** to **MON‑05**, **SEC‑01** to **SEC‑07** after observability stack and security policies are applied.  
- **MIG‑01** to **MIG‑04** during the parallel running phase (Docker Compose still active).  
- **PER‑01** to **PER‑05** as a final smoke test before the defense.