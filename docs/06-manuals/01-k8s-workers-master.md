# Instalación de un clúster Kubernetes — kubeadm + containerd + Calico

Guía probada y depurada para montar un clúster Kubernetes vanilla de 3 nodos sobre Debian/Ubuntu en máquinas con varias interfaces de red (típico en entornos virtualizados como IsardVDI, libvirt o Proxmox).

## Topología asumida

| Rol       | Hostname       | IP del clúster | Interfaz        |
|-----------|----------------|----------------|-----------------|
| Master    | `k8s-master`   | `10.0.0.10`    | `enp2s0` (red interna del clúster) |
| Worker01  | `k8s-worker01` | `10.0.0.11`    | `enp2s0`        |
| Worker02  | `k8s-worker02` | `10.0.0.12`    | `enp2s0`        |

> **IMPORTANTE — leer antes de empezar.** Si tus nodos tienen varias interfaces de red (cosa habitual en VMs: una NAT de gestión, una interna del clúster, Tailscale, libvirt bridges, etc.), apunta cuál es la interfaz **dedicada al tráfico interno del clúster** y su CIDR. Vas a necesitar esa información en los pasos 3 y 4. Una mala elección aquí es la causa #1 de fallos en este tipo de despliegues.

---

## 0. Requisitos previos (en los TRES nodos)

### 0.1 Hostname y resolución local

```bash
# En el master
sudo hostnamectl set-hostname k8s-master

# En cada worker (respectivamente)
sudo hostnamectl set-hostname k8s-worker01   # y k8s-worker02

# En los TRES nodos: añadir las entradas a /etc/hosts
sudo tee -a /etc/hosts <<EOF
10.0.0.10  k8s-master
10.0.0.11  k8s-worker01
10.0.0.12  k8s-worker02
EOF
```

### 0.2 Desactivar swap (obligatorio)

```bash
sudo swapoff -a
sudo sed -i '/\sswap\s/d' /etc/fstab
```

### 0.3 Cargar módulos del kernel

```bash
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

sudo modprobe overlay
sudo modprobe br_netfilter
```

### 0.4 Activar parámetros de red (bridging + IP forward)

```bash
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

sudo sysctl --system
```

---

## 1. Instalar containerd como CRI (en los 3 nodos)

> **Nota.** Si Docker ya está instalado en el nodo, `containerd.io` también lo está (es dependencia de Docker). En ese caso puedes saltar la instalación y pasar directamente a la configuración de `SystemdCgroup` al final del bloque.

Detecta tu distro y usa el repo correcto:

- **Debian** → `https://download.docker.com/linux/debian`
- **Ubuntu** → `https://download.docker.com/linux/ubuntu`

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings

# CAMBIAR `debian` POR `ubuntu` SI USAS UBUNTU
curl -fsSL https://download.docker.com/linux/debian/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# CAMBIAR `debian` POR `ubuntu` SI USAS UBUNTU
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/debian $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y containerd.io

# Configurar containerd con SystemdCgroup = true (imprescindible con cgroup v2)
sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml > /dev/null
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
sudo systemctl restart containerd && sudo systemctl enable containerd
```

---

## 2. Instalar kubeadm, kubelet y kubectl (en los 3 nodos)

```bash
K8S_VERSION="v1.35"
sudo apt-get install -y apt-transport-https ca-certificates curl gpg

curl -fsSL https://pkgs.k8s.io/core:/stable:/${K8S_VERSION}/deb/Release.key | \
  sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg

echo "deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] \
  https://pkgs.k8s.io/core:/stable:/${K8S_VERSION}/deb/ /" | \
  sudo tee /etc/apt/sources.list.d/kubernetes.list

sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
sudo systemctl enable --now kubelet
```

> En este punto `kubelet` entrará en un bucle de reinicios porque aún no existe el clúster. Es normal.

---

## 3. Inicializar el clúster (solo en el master)

> **CRÍTICO — elección del Pod CIDR.** El parámetro `--pod-network-cidr` define la red interna que Kubernetes asignará a los pods. Esa red **no debe solaparse con NINGUNA red ya existente en tus nodos** (incluidas redes Docker, libvirt bridges, Tailscale, redes corporativas, etc.).
>
> Comprueba todas tus redes con `ip a` antes de elegir. La guía oficial de Calico sugiere `192.168.0.0/16`, pero en muchos entornos virtualizados **esa red entra en conflicto** con la red de gestión de las VMs. Aquí usamos `172.16.0.0/16`, que es seguro siempre que no tengas ya una red Docker o libvirt en `172.16.x.x`.

> **CRÍTICO — `--apiserver-advertise-address`.** Si tu nodo tiene varias interfaces, kubeadm puede elegir la equivocada y publicar el endpoint del apiserver en una IP que los workers no pueden alcanzar. Especifica **siempre** la IP de la red interna del clúster.

Ejecuta esto **únicamente en `k8s-master`**:

```bash
sudo kubeadm init \
  --apiserver-advertise-address=10.0.0.10 \
  --pod-network-cidr=172.16.0.0/16 \
  --service-cidr=10.96.0.0/12 \
  --control-plane-endpoint=k8s-master:6443 \
  --upload-certs \
  --cri-socket=unix:///var/run/containerd/containerd.sock
```

Tardará unos minutos. Al terminar verás un comando `kubeadm join ...` parecido a:

```
kubeadm join k8s-master:6443 --token <token> \
    --discovery-token-ca-cert-hash sha256:<hash>
```

**Cópialo en un sitio seguro** — lo necesitas para los workers.

Configura `kubectl` para tu usuario normal en el master:

```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

Verifica que el master aparece (estará `NotReady` hasta que pongas el CNI):

```bash
kubectl get nodes
```

---

## 4. Instalar Calico CNI (desde el master)

### 4.1 Aplicar los manifests con el Pod CIDR correcto

```bash
# CRDs y operador
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.31.4/manifests/operator-crds.yaml
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.31.4/manifests/tigera-operator.yaml

# Descargar el custom-resources y ajustar el CIDR para que coincida con --pod-network-cidr
curl -o /tmp/custom-resources.yaml \
  https://raw.githubusercontent.com/projectcalico/calico/v3.31.4/manifests/custom-resources.yaml
sed -i 's|192.168.0.0/16|172.16.0.0/16|' /tmp/custom-resources.yaml

kubectl create -f /tmp/custom-resources.yaml
```

### 4.2 Forzar que el operador se ejecute en el master (bootstrap)

> **Por qué.** El `tigera-operator` necesita comunicarse con el apiserver vía la ClusterIP `10.96.0.1`, pero en los workers ese tráfico depende del CNI… que aún no está instalado. Se crea un deadlock. Forzando el operador al master (que ya tiene red funcional vía host) rompemos el ciclo.

```bash
kubectl patch deployment tigera-operator -n tigera-operator --patch '{
  "spec": {
    "template": {
      "spec": {
        "nodeSelector": {"kubernetes.io/hostname": "k8s-master"},
        "tolerations": [{"key": "node-role.kubernetes.io/control-plane", "operator": "Exists", "effect": "NoSchedule"}]
      }
    }
  }
}'
```

### 4.3 Configurar la autodetección de IP y desactivar BGP

> **Por qué.** Por defecto Calico hace autodetección "first-found" y elige cualquier interfaz, incluyendo Tailscale o redes de gestión. Hay que decirle qué CIDR usar para identificar el nodo. Además, con un clúster pequeño en una sola subnet, **VXLAN basta y BGP solo da problemas** (intentaría hacer peering con interfaces irrelevantes).

```bash
kubectl patch installation default --type=merge -p '{
  "spec": {
    "calicoNetwork": {
      "bgp": "Disabled",
      "nodeAddressAutodetectionV4": {
        "cidrs": ["10.0.0.0/24"]
      }
    }
  }
}'
```

> **Nota.** `nodeAddressAutodetectionV4.cidrs` y `firstFound` son mutuamente excluyentes. Si te diera el error `no more than one node address autodetection method can be specified per-family`, elimina `firstFound`:
> ```bash
> kubectl patch installation default --type=json -p '[
>   {"op": "remove", "path": "/spec/calicoNetwork/nodeAddressAutodetectionV4/firstFound"}
> ]'
> ```

Reinicia el daemonset para que recoja la configuración:

```bash
kubectl rollout restart daemonset/calico-node -n calico-system
```

Espera a que todos los pods de `calico-system` estén `Running` y `Ready`:

```bash
watch kubectl get pods -n calico-system
```

---

## 5. Unir los workers al clúster

En **cada worker**, ejecuta el comando `kubeadm join` que copiaste del paso 3:

```bash
sudo kubeadm join k8s-master:6443 --token <token> \
    --discovery-token-ca-cert-hash sha256:<hash>
```

Si el token ha caducado (validez 24 h), genera uno nuevo desde el master:

```bash
kubeadm token create --print-join-command
```

### 5.1 Symlink del directorio CNI (en cada worker)

> **Por qué.** En algunas distros (Debian 13/trixie), Calico busca los binarios CNI en `/usr/lib/cni` mientras que kubernetes-cni los instala en `/opt/cni/bin`. El init container `install-cni` crashea con `failed to find plugin "calico" in path [/usr/lib/cni]`.

En **cada worker**:

```bash
sudo mkdir -p /usr/lib/cni
sudo ln -s /opt/cni/bin/* /usr/lib/cni/
```

### 5.2 Verificación

Desde el master, espera 1-2 minutos y comprueba:

```bash
kubectl get nodes
```

Salida esperada:

```
NAME           STATUS   ROLES           AGE     VERSION
k8s-master     Ready    control-plane   10m     v1.35.x
k8s-worker01   Ready    <none>          2m      v1.35.x
k8s-worker02   Ready    <none>          2m      v1.35.x
```

Y todos los pods del sistema corriendo:

```bash
kubectl get pods -A
```

---

## Solución de problemas comunes

### Workers `NotReady` indefinidamente

```bash
# Desde el master, ver el motivo en los logs del init container
kubectl get pods -n calico-system -o wide
kubectl logs -n calico-system <calico-node-del-worker> -c install-cni
```

Errores típicos y sus causas:

| Error en los logs | Causa | Solución |
|-------------------|-------|----------|
| `failed to find plugin "calico" in path [/usr/lib/cni]` | Plugins CNI en otra ruta | Symlink del paso 5.1 |
| `dial tcp 10.96.0.1:443: connect: no route to host` | apiserver publicado en IP equivocada | Reset y volver a hacer `kubeadm init` con `--apiserver-advertise-address` correcto |
| `BIRD is not ready: BGP not established with X.X.X.X` | BGP intentando peer con interfaces no deseadas | Aplicar el patch del paso 4.3 (BGP Disabled) |
| `no more than one node address autodetection method` | Conflicto entre `firstFound` y `cidrs` | Ver nota en paso 4.3 |

### Reset completo del clúster

Si algo se ha torcido y quieres empezar de cero, en los **3 nodos**:

```bash
sudo kubeadm reset -f
sudo rm -rf /etc/kubernetes /var/lib/etcd /var/lib/kubelet $HOME/.kube
sudo rm -f /etc/cni/net.d/*
sudo systemctl restart containerd
```

Si el `kubeadm init` falla con `[ERROR Port-6443]: Port 6443 is in use`, comprueba qué proceso ocupa ese puerto:

```bash
sudo ss -tlnp | grep 6443
```

Si es un `docker-proxy`, hay un contenedor antiguo mapeando ese puerto:

```bash
sudo docker ps | grep 6443
sudo docker stop <container_id>
```

### Verificar conectividad de la red interna del clúster

Desde un worker, prueba que llega al apiserver del master:

```bash
curl -k --max-time 5 https://10.0.0.10:6443/healthz
# Debe devolver: ok
```

Y que las reglas DNAT de kube-proxy apuntan a la IP correcta:

```bash
sudo iptables -t nat -L KUBE-SVC-NPX46M4PTMTKRN6Y -n -v
# El target KUBE-SEP-* debe redirigir a 10.0.0.10:6443, NO a una IP de otra interfaz
```

---

## ✅ Clúster base listo

Kubernetes funcionando con containerd y Calico. Siguientes pasos sugeridos:

1. **MetalLB** — balanceador bare-metal para servicios `LoadBalancer`
2. **Traefik** — Ingress Controller (sustituto del obsoleto ingress-nginx)
3. **cert-manager** — Let's Encrypt automático
4. **Longhorn** — almacenamiento distribuido sobre los discos de los nodos
5. **Harbor** — registro privado de imágenes
6. **Servicios IoT** — Mosquitto, InfluxDB, Node-RED, Grafana, Home Assistant…