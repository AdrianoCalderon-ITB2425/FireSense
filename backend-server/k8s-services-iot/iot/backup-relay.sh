#!/bin/bash
set -e

DATE=$(date +%Y%m%d-%H%M%S)
LOCAL_TMP="/tmp/influxdb-backup-${DATE}.tar.gz"
SCP_USER="isard"
SCP_HOST="192.168.244.99"
SCP_DEST="/home/isard/backups-firesense/influxdb"

echo "=== [1/3] Llançant job de backup ==="
kubectl create job --from=cronjob/influxdb-backup influxdb-backup-relay-${DATE} -n iot

echo "=== Esperant que el job acabi (max 5 min) ==="
kubectl wait --for=condition=complete \
  job/influxdb-backup-relay-${DATE} -n iot --timeout=300s

echo "=== [2/3] Copiant backup via pod auxiliar ==="
kubectl run backup-reader-${DATE} -n iot \
  --image=alpine:3.19 \
  --restart=Never \
  --overrides="{
    \"spec\": {
      \"containers\": [{
        \"name\": \"reader\",
        \"image\": \"alpine:3.19\",
        \"command\": [\"sleep\", \"120\"],
        \"volumeMounts\": [{
          \"name\": \"backup-storage\",
          \"mountPath\": \"/backups\"
        }]
      }],
      \"volumes\": [{
        \"name\": \"backup-storage\",
        \"persistentVolumeClaim\": {
          \"claimName\": \"influxdb-backup-pvc\"
        }
      }]
    }
  }"

echo "=== Esperant pod auxiliar ==="
kubectl wait --for=condition=ready pod/backup-reader-${DATE} -n iot --timeout=60s

BACKUP_FILE=$(kubectl exec -n iot backup-reader-${DATE} -- \
  find /backups -maxdepth 1 -name "*.tar.gz" | tail -1)

echo "=== Fitxer trobat: ${BACKUP_FILE} ==="
kubectl cp iot/backup-reader-${DATE}:${BACKUP_FILE} ${LOCAL_TMP}

kubectl delete pod backup-reader-${DATE} -n iot --grace-period=0

echo "=== [3/3] Enviant per SCP al client ==="
scp -o StrictHostKeyChecking=no \
  -i /home/isard/.ssh/backup_key \
  ${LOCAL_TMP} \
  ${SCP_USER}@${SCP_HOST}:${SCP_DEST}/

rm -f ${LOCAL_TMP}
echo "=== Backup completat OK ==="
