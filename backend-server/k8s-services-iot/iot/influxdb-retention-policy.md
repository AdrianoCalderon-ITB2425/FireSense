# InfluxDB Retention Policies — FireSense
**Data:** 2026-05-10  
**Responsable:** Adriano Calderón  

## Buckets configurats

| Bucket | Retenció | Ús |
|--------|----------|----|
| sensors | 2160h (90 dies) | Dades en brut dels sensors IoT |
| sensors-downsampled | 8760h (1 any) | Dades agregades per hora |

## Task de downsampling

- **Nom:** downsample-sensors
- **Interval:** cada 1h
- **Origen:** bucket `sensors`
- **Destí:** bucket `sensors-downsampled`
- **Agregació:** mean per camp i mesura

## Comandos de verificació

```bash
# Llistar buckets
kubectl exec -n iot deployment/influxdb -- influx bucket list \
  --host http://localhost:8086 \
  --token ${INFLUXDB_TOKEN}

# Llistar tasks
kubectl exec -n iot deployment/influxdb -- influx task list \
  --host http://localhost:8086 \
  --token ${INFLUXDB_TOKEN} \
  --org firesense
```
