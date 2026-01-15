set -e

INFLUX_HOST=${INFLUX_HOST:-http://localhost:8086}
INFLUX_TOKEN=${DOCKER_INFLUXDB_INIT_ADMIN_TOKEN}
INFLUX_ORG=${DOCKER_INFLUXDB_INIT_ORG}
INFLUX_BUCKET=${DOCKER_INFLUXDB_INIT_BUCKET}

# Crear bucket adicional para datos históricos
echo "Creando buckets adicionales..."
curl -X POST ${INFLUX_HOST}/api/v2/buckets \
  -H "Authorization: Token ${INFLUX_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "orgID": "'$(curl -s -X GET ${INFLUX_HOST}/api/v2/orgs \
      -H "Authorization: Token ${INFLUX_TOKEN}" \
      -H "Content-Type: application/json" | jq -r '.orgs[0].id')'",
    "name": "historical_data",
    "description": "Datos históricos para análisis",
    "retentionRules": [{"type": "expire", "everySeconds": 7776000}]
  }' || true

# Crear políticas de retención
echo "Configurando políticas de retención..."

# Retencion corta para datos en tiempo real (7 días)
curl -X POST ${INFLUX_HOST}/api/v2/buckets \
  -H "Authorization: Token ${INFLUX_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "orgID": "'$(curl -s -X GET ${INFLUX_HOST}/api/v2/orgs \
      -H "Authorization: Token ${INFLUX_TOKEN}" | jq -r '.orgs[0].id')'",
    "name": "realtime_data",
    "description": "Datos tiempo real",
    "retentionRules": [{"type": "expire", "everySeconds": 604800}]
  }' || true

echo "InfluxDB inicializado correctamente"