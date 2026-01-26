set -e

echo "=== InfluxDB Init Script ==="

# Las variables DOCKER_INFLUXDB_INIT_* ya crearon la org y bucket
# Solo necesitamos verificar que existen

# Esperar a que InfluxDB esté listo
sleep 10

# Verificar org
echo "Verificando organización..."
influx org list

# Verificar bucket
echo "Verificando bucket..."
influx bucket list

# Verificar token
echo "Verificando token..."
influx auth list

echo "=== Init completado ==="