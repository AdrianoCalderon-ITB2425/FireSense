# Kubernetes Cluster Installation — kubeadm + containerd + Calico

A tested and debugged guide to setting up a vanilla 3-node Kubernetes cluster on Debian/Ubuntu machines with multiple network interfaces (common in virtualized environments like IsardVDI, libvirt, or Proxmox).

## Assumed Topology

| Role      | Hostname       | Cluster IP  | Interface                        |
|-----------|----------------|-------------|----------------------------------|
| Master    | `k8s-master`   | `10.0.0.10` | `enp2s0` (internal cluster network) |
| Worker01  | `k8s-worker01` | `10.0.0.11` | `enp2s0`                         |
| Worker02  | `k8s-worker02` | `10.0.0.12` | `enp2s0`                         |

> **IMPORTANT — read before you start.** If your nodes have multiple network interfaces (common in VMs: a NAT management interface, an internal cluster interface, Tailscale, libvirt bridges, etc.), identify which interface is **dedicated to internal cluster traffic** and its CIDR. You will need that information in steps 3 and 4. A wrong choice here is the #1 cause of failures in this type of deployment.

---

## 0. Prerequisites (on ALL THREE nodes)

### 0.1 Hostname and local resolution

```bash
# On the master
sudo hostnamectl set-hostname k8s-master

# On each worker (respectively)
sudo hostnamectl set-hostname k8s-worker01   # and k8s-worker02

# On ALL THREE nodes: add entries to /etc/hosts
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

### 0.3 Load kernel modules

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

## 1. Install containerd as CRI (on all 3 nodes)

> **Note.** If Docker is already installed on the node, `containerd.io` is also installed (it is a Docker dependency). In that case you can skip the installation and go directly to the `SystemdCgroup` configuration at the end of this block.

Detect your distro and use the correct repo:

- **Debian** → `https://download.docker.com/linux/debian`
- **Ubuntu** → `https://download.docker.com/linux/ubuntu`

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings

# CHANGE `debian` TO `ubuntu` IF USING UBUNTU
curl -fsSL https://download.docker.com/linux/debian/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# CHANGE `debian` TO `ubuntu` IF USING UBUNTU
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

## 2. Install kubeadm, kubelet and kubectl (on all 3 nodes)

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

> At this point `kubelet` will enter a restart loop because the cluster does not exist yet. This is normal.

---

## 3. Initialize the cluster (master only)

> **CRITICAL — Pod CIDR selection.** The `--pod-network-cidr` parameter defines the internal network Kubernetes will assign to pods. That network **must not overlap with ANY existing network on your nodes** (including Docker networks, libvirt bridges, Tailscale, corporate networks, etc.).
>
> Check all your networks with `ip a` before choosing. The official Calico guide suggests `192.168.0.0/16`, but in many virtualized environments **that network conflicts** with the VM management network. This guide uses `172.16.0.0/16`, which is safe as long as you do not already have a Docker or libvirt network on `172.16.x.x`.

> **CRITICAL — `--apiserver-advertise-address`.** If your node has multiple interfaces, kubeadm may pick the wrong one and advertise the apiserver endpoint on an IP the workers cannot reach. **Always** specify the IP of the internal cluster network.

Run this **only on `k8s-master`**:

```bash
sudo kubeadm init \
  --apiserver-advertise-address=10.0.0.10 \
  --pod-network-cidr=172.16.0.0/16 \
  --service-cidr=10.96.0.0/12 \
  --control-plane-endpoint=k8s-master:6443 \
  --upload-certs \
  --cri-socket=unix:///var/run/containerd/containerd.sock
```

This will take a few minutes. When it finishes you will see a `kubeadm join ...` command similar to:

```
kubeadm join k8s-master:6443 --token <token> \
    --discovery-token-ca-cert-hash sha256:<hash>
```

**Copy it somewhere safe** — you need it for the workers.

Configure `kubectl` for your regular user on the master:

```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

Verify that the master appears (it will be `NotReady` until the CNI is installed):

```bash
kubectl get nodes
```

---

## 4. Install Calico CNI (from the master)

### 4.1 Apply manifests with the correct Pod CIDR

```bash
# CRDs and operator
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.31.4/manifests/operator-crds.yaml
kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.31.4/manifests/tigera-operator.yaml

# Download custom-resources and adjust the CIDR to match --pod-network-cidr
curl -o /tmp/custom-resources.yaml \
  https://raw.githubusercontent.com/projectcalico/calico/v3.31.4/manifests/custom-resources.yaml
sed -i 's|192.168.0.0/16|172.16.0.0/16|' /tmp/custom-resources.yaml

kubectl create -f /tmp/custom-resources.yaml
```

### 4.2 Force the operator to run on the master (bootstrap)

> **Why.** The `tigera-operator` needs to communicate with the apiserver via ClusterIP `10.96.0.1`, but on the workers that traffic depends on the CNI… which is not yet installed. This creates a deadlock. Forcing the operator onto the master (which already has working networking via the host) breaks the cycle.

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

### 4.3 Configure IP autodetection and disable BGP

> **Why.** By default Calico does "first-found" autodetection and picks any interface, including Tailscale or management networks. You need to tell it which CIDR to use to identify the node. Also, with a small cluster on a single subnet, **VXLAN is sufficient and BGP only causes problems** (it would try to peer with irrelevant interfaces).

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

> **Note.** `nodeAddressAutodetectionV4.cidrs` and `firstFound` are mutually exclusive. If you get the error `no more than one node address autodetection method can be specified per-family`, remove `firstFound`:
> ```bash
> kubectl patch installation default --type=json -p '[
>   {"op": "remove", "path": "/spec/calicoNetwork/nodeAddressAutodetectionV4/firstFound"}
> ]'
> ```

Restart the daemonset so it picks up the new configuration:

```bash
kubectl rollout restart daemonset/calico-node -n calico-system
```

Wait until all pods in `calico-system` are `Running` and `Ready`:

```bash
watch kubectl get pods -n calico-system
```

---

## 5. Join workers to the cluster

On **each worker**, run the `kubeadm join` command you saved from step 3:

```bash
sudo kubeadm join k8s-master:6443 --token <token> \
    --discovery-token-ca-cert-hash sha256:<hash>
```

If the token has expired (valid for 24 h), generate a new one from the master:

```bash
kubeadm token create --print-join-command
```

### 5.1 CNI directory symlink (on each worker)

> **Why.** On some distros (Debian 13/trixie), Calico looks for CNI binaries in `/usr/lib/cni` while kubernetes-cni installs them in `/opt/cni/bin`. The `install-cni` init container crashes with `failed to find plugin "calico" in path [/usr/lib/cni]`.

On **each worker**:

```bash
sudo mkdir -p /usr/lib/cni
sudo ln -s /opt/cni/bin/* /usr/lib/cni/
```

### 5.2 Verification

From the master, wait 1–2 minutes and check:

```bash
kubectl get nodes
```

Expected output:

```
NAME           STATUS   ROLES           AGE     VERSION
k8s-master     Ready    control-plane   10m     v1.35.x
k8s-worker01   Ready    <none>          2m      v1.35.x
k8s-worker02   Ready    <none>          2m      v1.35.x
```

And all system pods running:

```bash
kubectl get pods -A
```

---

## Troubleshooting

### Workers stuck `NotReady`

```bash
# From the master, check the reason in the init container logs
kubectl get pods -n calico-system -o wide
kubectl logs -n calico-system <calico-node-pod-on-worker> -c install-cni
```

Common errors and their causes:

| Log error | Cause | Fix |
|-----------|-------|-----|
| `failed to find plugin "calico" in path [/usr/lib/cni]` | CNI plugins in wrong path | Symlink from step 5.1 |
| `dial tcp 10.96.0.1:443: connect: no route to host` | apiserver advertised on wrong IP | Reset and redo `kubeadm init` with the correct `--apiserver-advertise-address` |
| `BIRD is not ready: BGP not established with X.X.X.X` | BGP trying to peer with unwanted interfaces | Apply the patch from step 4.3 (BGP Disabled) |
| `no more than one node address autodetection method` | Conflict between `firstFound` and `cidrs` | See note in step 4.3 |

### Full cluster reset

If something went wrong and you want to start over, on **all 3 nodes**:

```bash
sudo kubeadm reset -f
sudo rm -rf /etc/kubernetes /var/lib/etcd /var/lib/kubelet $HOME/.kube
sudo rm -f /etc/cni/net.d/*
sudo systemctl restart containerd
```

If `kubeadm init` fails with `[ERROR Port-6443]: Port 6443 is in use`, check what process is using that port:

```bash
sudo ss -tlnp | grep 6443
```

If it is a `docker-proxy`, there is an old container mapping that port:

```bash
sudo docker ps | grep 6443
sudo docker stop <container_id>
```

### Verify internal cluster network connectivity

From a worker, test that it can reach the master's apiserver:

```bash
curl -k --max-time 5 https://10.0.0.10:6443/healthz
# Expected response: ok
```

And that kube-proxy's DNAT rules point to the correct IP:

```bash
sudo iptables -t nat -L KUBE-SVC-NPX46M4PTMTKRN6Y -n -v
# The KUBE-SEP-* target should redirect to 10.0.0.10:6443, NOT to an IP from another interface
```

---

## Base cluster ready

Kubernetes running with containerd and Calico. Suggested next steps:

1. **MetalLB** — bare-metal load balancer for `LoadBalancer` services
2. **Traefik** — Ingress Controller (replacement for the deprecated ingress-nginx)
3. **cert-manager** — automatic Let's Encrypt certificates
4. **Longhorn** — distributed storage over node disks
5. **Harbor** — private image registry
6. **IoT services** — Mosquitto, InfluxDB, Node-RED, Grafana...

