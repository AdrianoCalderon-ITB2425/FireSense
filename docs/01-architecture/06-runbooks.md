# FireSense — Operational Runbooks

## Runbook 1: Deploy a new web version

```bash
# 1. Make changes to src-web
cd ~/FireSense/backend-server/k8s-web-services/src-web

# 2. Quick deploy (no rebuild)
POD=$(kubectl get pods -n firesense -l app=nginx-web -o jsonpath='{.items[0].metadata.name}')
kubectl cp . firesense/$POD:/usr/share/nginx/html/

# 3. Full rebuild via Jenkins
# Push to dev branch → Jenkins triggers automatically
git add . && git commit -m "feat: ..." && git push origin dev
```

---

## Runbook 2: Restore InfluxDB from backup

```bash
# 1. Find latest backup on client machine
ls -lth /home/isard/backups-firesense/influxdb/

# 2. Copy backup to master
scp isard@192.168.244.99:/home/isard/backups-firesense/influxdb/<FILE>.tar.gz /tmp/

# 3. Extract
mkdir -p /tmp/influx-restore
tar -xzf /tmp/<FILE>.tar.gz -C /tmp/influx-restore

# 4. Copy to InfluxDB pod
POD=$(kubectl get pods -n iot -l app=influxdb -o jsonpath='{.items[0].metadata.name}')
kubectl cp /tmp/influx-restore/. iot/${POD}:/tmp/restore/

# 5. Restore
kubectl exec -n iot ${POD} -- influx restore /tmp/restore \
  --host http://localhost:8086 \
  --token ${INFLUXDB_TOKEN} \
  --org firesense --full
```

---

## Runbook 3: Add a new user

```bash
# Via web UI
# 1. Go to /FireSense/login.html → Register
# 2. Admin approves at /FireSense/adminldap.html

# Via CLI
kubectl exec -n firesense deployment/auth-service -- python -c "
import psycopg2
conn = psycopg2.connect(host='postgres', dbname='firesense', user='firesense', password='${POSTGRES_PASSWORD}')
cur = conn.cursor()
cur.execute(\"INSERT INTO users (username, status) VALUES ('newuser', 'approved')\")
conn.commit(); cur.close(); conn.close(); print('OK')
"
```

---

## Runbook 4: Scale a deployment

```bash
# Manual scale
kubectl scale deployment/grafana --replicas=2 -n iot

# HPA handles auto-scaling based on CPU/memory
kubectl get hpa -n iot
kubectl describe hpa grafana-hpa -n iot
```

---

## Runbook 5: Check cluster health

```bash
# All pods status
kubectl get pods -A | grep -v Running | grep -v Completed

# Node status
kubectl get nodes

# Storage
kubectl get pvc -A

# HPA status
kubectl get hpa -A

# Run integration tests
bash ~/FireSense/backend-server/k8s-services-iot/tests/integration-tests.sh
```

---

## Runbook 6: Certificate renewal

Certificates are auto-renewed by cert-manager (Let's Encrypt). To check:

```bash
kubectl get certificate -A
kubectl describe certificate -n traefik
```

---

## Runbook 7: Jenkins password reset

```bash
# Generate bcrypt hash
python3 -c "
import bcrypt
h = bcrypt.hashpw(b'newpassword', bcrypt.gensalt(10))
print(h.decode().replace('\$2b\$', '\$2a\$'))
"

# Apply to Jenkins user
kubectl exec -n jenkins jenkins-0 -c jenkins -- bash -c "
USER_DIR=\$(ls /var/jenkins_home/users/ | grep admin)
sed -i 's|<passwordHash>.*</passwordHash>|<passwordHash>#jbcrypt:HASH_HERE</passwordHash>|' \
  /var/jenkins_home/users/\$USER_DIR/config.xml
"
kubectl rollout restart statefulset/jenkins -n jenkins
```

---

## Runbook 8: Trigger Isolation Forest manually

```bash
kubectl create job --from=cronjob/isolation-forest \
  isolation-forest-manual-$(date +%Y%m%d%H%M) -n iot

# Check results
kubectl logs -n iot -l job-name=isolation-forest-manual-* -f
```
