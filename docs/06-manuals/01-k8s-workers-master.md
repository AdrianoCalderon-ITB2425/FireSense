# Kubernetes Cluster Setup — kubeadm + containerd + Calico

Nodes:
- **Master**: `k8s-master` (10.0.0.10)
- **Worker01**: `k8s-worker01` (10.0.0.11)
- **Worker02**: `k8s-worker02` (10.0.0.12)

Adjust IPs in `/etc/hosts` and commands as needed.

---

## 0. Prerequisites (ALL three nodes)

### 0.1 Hostname and local DNS resolution

```bash
# On the master
sudo hostnamectl set-hostname k8s-master

# On each worker (respectively)
sudo hostnamectl set-hostname k8s-worker01   # and k8s-worker02

# On ALL three nodes: add the entries to /etc/hosts
sudo tee -a /etc/hosts <<EOF
10.0.0.10  k8s-master
10.0.0.11  k8s-worker01
10.0.0.12  k8s-worker02
EOF
```

### 0.2 Disable swap (mandatory)

```bash
sudo swapoff -a
sudo sed -i '/\sswap\s/d' /etc/fstab
```

### 0.3 Load required kernel modules

```bash
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF

sudo modprobe overlay
sudo modprobe br_netfilter
```

### 0.4 Enable network parameters (bridging + IP forwarding)

```bash
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF

sudo sysctl --system
```

---

## 1. Install containerd as CRI (ALL three nodes)

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings

curl -fsSL https://download.docker.com/linux/debian/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/debian $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y containerd.io

# Configure containerd with SystemdCgroup = true (required with cgroup v2)
sudo mkdir -p /etc/containerd
containerd config default | sudo tee /etc/containerd/config.toml > /dev/null
sudo sed -i 's/SystemdCgroup = false/SystemdCgroup = true/' /etc/containerd/config.toml
sudo systemctl restart containerd && sudo systemctl enable containerd
```

---

## 2. Install kubeadm, kubelet and kubectl (ALL three nodes)

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

> At this point kubelet will enter a restart loop because the cluster doesn't exist yet. This is expected.

---

## 3. Initialize the cluster (master only)

Run this **only on `k8s-master`**:

```bash
sudo kubeadm init \
  --pod-network-cidr=192.168.0.0/16 \
  --control-plane-endpoint=k8s-master:6443 \
  --upload-certs \
  --cri-socket=unix:///var/run/containerd/containerd.sock
```

This will take a few minutes. When done you'll see a `kubeadm join ...` command like this:

```
kubeadm join k8s-master:6443 --token <token> \
    --discovery-token-ca-cert-hash sha256:<hash>
```

**Copy that command** somewhere safe — you'll need it for the workers.

Configure `kubectl` for your normal user on the master:

```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

Verify the master node appears (it will show `NotReady` until the CNI is installed):

```bash
kubectl get nodes
```

---

## 4. Install Calico CNI (from the master)

Using the Calico operator (official recommendation):

```bash
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.31.4/manifests/operator-crds.yaml
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.31.4/manifests/tigera-operator.yaml
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.31.4/manifests/custom-resources.yaml
```

Wait for all pods in the `calico-system` namespace to be running:

```bash
watch kubectl get pods -n calico-system
```

Once Calico is ready, the master node will transition to `Ready`.

---

## 5. Join the workers to the cluster

On **each worker**, run the `kubeadm join` command you copied from step 3:

```bash
sudo kubeadm join k8s-master:6443 --token <token> \
    --discovery-token-ca-cert-hash sha256:<hash>
```

If the token has expired (valid for 24 h), generate a new one on the master:

```bash
kubeadm token create --print-join-command
```

After joining both workers, check that all three nodes show `Ready` from the master:

```bash
kubectl get nodes
```

Expected output:

```
NAME           STATUS   ROLES           AGE     VERSION
k8s-master     Ready    control-plane   5m      v1.35.x
k8s-worker01   Ready    <none>          1m      v1.35.x
k8s-worker02   Ready    <none>          1m      v1.35.x
```

---

## 6. Quick cluster verification

```bash
# All system pods should be Running
kubectl get pods -A
```

---

## Base cluster ready

Kubernetes is up and running with containerd and Calico. Next steps:

1. **MetalLB** — bare-metal load balancer
2. **Traefik** — Ingress Controller
3. **cert-manager** — automatic Let's Encrypt certificates
4. **Longhorn** — distributed block storage
5. **Harbor** — private container registry
6. **IoT services** — Mosquitto, InfluxDB, Node-RED, Grafana…