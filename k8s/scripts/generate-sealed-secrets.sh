#!/bin/bash
# FireSense — Generate and seal all secrets
# Run this script to recreate all secrets after a credentials loss
# Usage: bash generate-sealed-secrets.sh

set -e

HARBOR="93d92c4a-e3bf-4ea6-93c6.afab44153cac.isard.nuvulet.itb.cat"
OUTPUT_DIR=~/FireSense/k8s/sealed-secrets-backup

mkdir -p $OUTPUT_DIR

echo "======================================"
echo "FireSense — Generating Sealed Secrets"
echo "======================================"

# ============================================================
# NAMESPACE: iot
# ============================================================
echo ""
echo "--- Namespace: iot ---"

# InfluxDB secret
kubectl create secret generic influxdb-secrets \
  --namespace=iot \
  --from-literal=admin-user=admin \
  --from-literal=admin-password=firesense2025 \
  --from-literal=admin-token=firesense-influx-token-2026 \
  --from-literal=org=firesense \
  --from-literal=bucket=sensors \
  --dry-run=client -o yaml | \
  kubeseal --controller-name=sealed-secrets \
  --controller-namespace=kube-system --format yaml \
  > $OUTPUT_DIR/sealed-influxdb-secrets.yaml
echo "✅ sealed-influxdb-secrets.yaml"

# ChirpStack PostgreSQL
kubectl create secret generic chirpstack-postgres-secret \
  --namespace=iot \
  --from-literal=POSTGRES_PASSWORD=firesense2025 \
  --from-literal=DATABASE_URL="postgres://chirpstack:firesense2025@postgres-chirpstack/chirpstack?sslmode=disable" \
  --dry-run=client -o yaml | \
  kubeseal --controller-name=sealed-secrets \
  --controller-namespace=kube-system --format yaml \
  > $OUTPUT_DIR/sealed-chirpstack-postgres-secret.yaml
echo "✅ sealed-chirpstack-postgres-secret.yaml"

# Backup SCP secret
kubectl create secret generic backup-scp-secret \
  --namespace=iot \
  --from-literal=BACKUP_HOST=192.168.244.99 \
  --from-literal=BACKUP_USER=isard \
  --from-literal=BACKUP_PATH=/home/isard/backups-firesense/influxdb \
  --dry-run=client -o yaml | \
  kubeseal --controller-name=sealed-secrets \
  --controller-namespace=kube-system --format yaml \
  > $OUTPUT_DIR/sealed-backup-scp-secret.yaml
echo "✅ sealed-backup-scp-secret.yaml"

# Backup SSH key
kubectl create secret generic backup-ssh-key \
  --namespace=iot \
  --from-file=id_rsa=$HOME/.ssh/backup_key \
  --dry-run=client -o yaml | \
  kubeseal --controller-name=sealed-secrets \
  --controller-namespace=kube-system --format yaml \
  > $OUTPUT_DIR/sealed-backup-ssh-key.yaml
echo "✅ sealed-backup-ssh-key.yaml"

# ============================================================
# NAMESPACE: firesense
# ============================================================
echo ""
echo "--- Namespace: firesense ---"

# PostgreSQL web
kubectl create secret generic postgres-web-secret \
  --namespace=firesense \
  --from-literal=POSTGRES_DB=firesense \
  --from-literal=POSTGRES_USER=firesense \
  --from-literal=POSTGRES_PASSWORD=firesense2025 \
  --from-literal=JWT_SECRET=FireSenseJWT2026_SecretKey \
  --dry-run=client -o yaml | \
  kubeseal --controller-name=sealed-secrets \
  --controller-namespace=kube-system --format yaml \
  > $OUTPUT_DIR/sealed-postgres-web-secret.yaml
echo "✅ sealed-postgres-web-secret.yaml"

# OpenLDAP
kubectl create secret generic openldap-secret \
  --namespace=firesense \
  --from-literal=LDAP_ADMIN_PASSWORD=FireSense2026! \
  --from-literal=LDAP_CONFIG_PASSWORD=FireSenseConfig2026! \
  --from-literal=LDAP_READONLY_PASSWORD=FireSenseRead2026! \
  --dry-run=client -o yaml | \
  kubeseal --controller-name=sealed-secrets \
  --controller-namespace=kube-system --format yaml \
  > $OUTPUT_DIR/sealed-openldap-secret.yaml
echo "✅ sealed-openldap-secret.yaml"

# AI Bot
kubectl create secret generic ai-bot-secret \
  --namespace=firesense \
  --from-literal=TELEGRAM_BOT_TOKEN=8751648029:AAHiZDGrfgi1nfhzVTNGq66CN1MtWs4TNd8 \
  --from-literal=TELEGRAM_ALLOWED_USERS=8068312940 \
  --from-literal=INFLUX_URL=http://influxdb.iot.svc.cluster.local:8086 \
  --from-literal=INFLUX_TOKEN=firesense-influx-token-2026 \
  --from-literal=INFLUX_ORG=firesense \
  --from-literal=INFLUX_BUCKET=sensors \
  --from-literal=OLLAMA_BASE_URL=http://graphon2.nuvulet.itb.cat/v1 \
  --from-literal=OLLAMA_API_KEY=94a62146533c41d65cc1c409cffa641b136829ccd4e0826f6008e9455422be2e \
  --from-literal=OLLAMA_MODEL=openai/gpt-oss-20b \
  --dry-run=client -o yaml | \
  kubeseal --controller-name=sealed-secrets \
  --controller-namespace=kube-system --format yaml \
  > $OUTPUT_DIR/sealed-ai-bot-secret.yaml
echo "✅ sealed-ai-bot-secret.yaml"

# Harbor pull secret (firesense)
kubectl create secret docker-registry harbor-pull-secret \
  --namespace=firesense \
  --docker-server=$HARBOR \
  --docker-username=admin \
  --docker-password='@firesense2025!' \
  --docker-email=admin@firesense.io \
  --dry-run=client -o yaml | \
  kubeseal --controller-name=sealed-secrets \
  --controller-namespace=kube-system --format yaml \
  > $OUTPUT_DIR/sealed-harbor-pull-secret-firesense.yaml
echo "✅ sealed-harbor-pull-secret-firesense.yaml"

# Harbor pull secret (iot)
kubectl create secret docker-registry harbor-pull-secret \
  --namespace=iot \
  --docker-server=$HARBOR \
  --docker-username=admin \
  --docker-password='@firesense2025!' \
  --docker-email=admin@firesense.io \
  --dry-run=client -o yaml | \
  kubeseal --controller-name=sealed-secrets \
  --controller-namespace=kube-system --format yaml \
  > $OUTPUT_DIR/sealed-harbor-pull-secret-iot.yaml
echo "✅ sealed-harbor-pull-secret-iot.yaml"

# ============================================================
# NAMESPACE: jenkins
# ============================================================
echo ""
echo "--- Namespace: jenkins ---"

kubectl create secret docker-registry harbor-creds \
  --namespace=jenkins \
  --docker-server=$HARBOR \
  --docker-username=admin \
  --docker-password='@firesense2025!' \
  --docker-email=admin@firesense.io \
  --dry-run=client -o yaml | \
  kubeseal --controller-name=sealed-secrets \
  --controller-namespace=kube-system --format yaml \
  > $OUTPUT_DIR/sealed-harbor-creds-jenkins.yaml
echo "✅ sealed-harbor-creds-jenkins.yaml"

# ============================================================
# SUMMARY
# ============================================================
echo ""
echo "======================================"
echo "All secrets sealed in: $OUTPUT_DIR"
echo ""
echo "To apply all secrets:"
echo "  kubectl apply -f $OUTPUT_DIR/"
echo ""
echo "Credentials reference:"
echo "  Grafana:    admin / firesense2025"
echo "  InfluxDB:   admin / firesense2025 | token: firesense-influx-token-2026"
echo "  ChirpStack: admin / @firesense2025!"
echo "  Harbor:     admin / @firesense2025!"
echo "  Jenkins:    admin / firesense2025"
echo "  OpenLDAP:   cn=admin,dc=firesense,dc=io / FireSense2026!"
echo "  PostgreSQL: firesense / firesense2025"
echo "  Web admin:  admin / FireSense2026!"
echo "======================================"
