# Disaster Recovery Plan — FireSense
**Versió:** 1.0  
**Data:** 2026-05-10  
**Responsable:** Hamza Tayibi  
**Equip:** Hamza Tayibi, Adriano Calderón, Francisco Diaz  

---

## 1. Objectiu

Definir els procediments per restaurar el sistema FireSense davant d'una fallada crítica, minimitzant el temps d'inactivitat (RTO) i la pèrdua de dades (RPO).

| Indicador | Valor objectiu |
|-----------|---------------|
| RTO (Recovery Time Objective) | < 2 hores |
| RPO (Recovery Point Objective) | < 24 hores (backup diari a les 02:00) |

---

## 2. Infraestructura crítica

| Component | Namespace | Dades persistents | Backup |
|-----------|-----------|-------------------|--------|
| InfluxDB | iot | Sèries temporals sensors | ✅ Diari (Longhorn + SCP) |
| PostgreSQL IoT | iot | Configuració ChirpStack | ❌ Manual |
| PostgreSQL Web | firesense | Usuaris, nodes | ❌ Manual |
| OpenLDAP | firesense | Usuaris LDAP | ❌ Manual |
| ChirpStack | iot | Dispositius LoRa | ❌ Manual |

---

## 3. Localització dels backups

| Ubicació | Path | Retenció |
|----------|------|----------|
| Longhorn PVC (cluster) | PVC `influxdb-backup-pvc` al namespace `iot` | 7 dies |
| Client local (SCP) | `192.168.244.99:/home/isard/backups-firesense/influxdb/` | Manual |

---

## 4. Escenaris de fallada i procediments

### 4.1 Fallada d'un pod (crash loop / OOMKilled)

**Detecció:**
```bash
kubectl get pods -A | grep -v Running | grep -v Completed
kubectl describe pod <POD> -n <NAMESPACE>
```

**Recuperació:**
```bash
# Reiniciar el deployment
kubectl rollout restart deployment/<NOM> -n <NAMESPACE>

# Si no arrenca, tornar a la versió anterior
kubectl rollout undo deployment/<NOM> -n <NAMESPACE>
kubectl rollout status deployment/<NOM> -n <NAMESPACE>
```

---

### 4.2 Fallada d'un node worker

**Detecció:**
```bash
kubectl get nodes
kubectl describe node <NODE>
```

**Recuperació:**
```bash
# Drenar el node
kubectl drain <NODE> --ignore-daemonsets --delete-emptydir-data

# Un cop reparat, tornar a afegir
kubectl uncordon <NODE>

# Verificar que els pods es redistribueixen
kubectl get pods -A -o wide
```

---

### 4.3 Pèrdua de dades InfluxDB

**Detecció:**
```bash
kubectl logs -n iot deployment/influxdb | tail -50
kubectl exec -n iot deployment/influxdb -- influx ping --host http://localhost:8086
```

**Restauració des del backup més recent:**
```bash
# 1. Identificar el backup més recent al client
ls -lth /home/isard/backups-firesense/influxdb/

# 2. Copiar el backup al master
scp isard@192.168.244.99:/home/isard/backups-firesense/influxdb/<FITXER>.tar.gz /tmp/

# 3. Descomprimir
mkdir -p /tmp/influx-restore
tar -xzf /tmp/<FITXER>.tar.gz -C /tmp/influx-restore

# 4. Copiar al pod d'InfluxDB
POD=$(kubectl get pods -n iot -l app=influxdb -o jsonpath='{.items[0].metadata.name}')
kubectl cp /tmp/influx-restore/. iot/${POD}:/tmp/restore/

# 5. Restaurar
kubectl exec -n iot ${POD} -- influx restore /tmp/restore \
  --host http://localhost:8086 \
  --token ${INFLUXDB_TOKEN} \
  --org firesense \
  --full

# 6. Verificar
kubectl exec -n iot ${POD} -- influx query \
  'from(bucket:"sensors") |> range(start:-1h)' \
  --host http://localhost:8086 \
  --token ${INFLUXDB_TOKEN} \
  --org firesense
```

---

### 4.4 Fallada total del cluster (master + workers)

**Procediment de reconstrucció:**

```bash
# 1. Reinstal·lar K8s (seguir documentació d'instal·lació)
# 2. Reinstal·lar components base
helm install traefik traefik/traefik -n traefik
helm install longhorn longhorn/longhorn -n longhorn-system
helm install metallb metallb/metallb -n metallb-system

# 3. Aplicar tots els manifests del repo
kubectl apply -f ~/FireSense/k8s/iot/
kubectl apply -f ~/FireSense/k8s/firesense/

# 4. Restaurar InfluxDB (seguir punt 4.3)

# 5. Verificar serveis
kubectl get pods -A
kubectl get ingress -A
```

---

### 4.5 Imatge Docker corrupta o eliminada de Harbor

```bash
# Reconstruir i pujar la imatge
cd ~/FireSense/backend-server/k8s-web-services/auth-service
docker build -t 93d92c4a-e3bf-4ea6-93c6.afab44153cac.isard.nuvulet.itb.cat/library/auth-service:vN .
docker push 93d92c4a-e3bf-4ea6-93c6.afab44153cac.isard.nuvulet.itb.cat/library/auth-service:vN
kubectl set image deployment/auth-service auth-service=...vN -n firesense
kubectl rollout status deployment/auth-service -n firesense
```

---

## 5. Contactes d'emergència

| Rol | Nom | Responsabilitat |
|-----|-----|-----------------|
| Backend/Web | Hamza Tayibi | Auth-service, web, backups |
| Backend/IoT | Adriano Calderón | ChirpStack, Node-RED, InfluxDB |
| Scrum Master/Xarxa | Francisco Diaz | Traefik, Calico, MetalLB, DNS |

---

## 6. Checklist post-recuperació

- [ ] Tots els pods en estat Running
- [ ] InfluxDB rep dades dels sensors (comprovar Grafana)
- [ ] Web accessible via HTTPS
- [ ] Login funcional (LDAP + JWT)
- [ ] CronJob backup actiu (`kubectl get cronjob -n iot`)
- [ ] HPA actius (`kubectl get hpa -n iot`)
- [ ] Certificat TLS vàlid
