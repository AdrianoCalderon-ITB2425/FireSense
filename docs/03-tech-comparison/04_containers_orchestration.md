# Comparison: Containers and Orchestration

---

## Docker vs Podman

| Criterion | **Docker** | Podman |
|---|---|---|
| License | Apache 2.0 (Engine) | Apache 2.0 |
| Current version | 26.x | 5.x |
| Architecture | Centralized daemon (dockerd) | Daemonless (no background process) |
| Rootless execution | Yes (since v20.10) | Yes, by design from the start |
| Command compatibility | Standard reference | Compatible (`alias docker=podman`) |
| K8s support | containerd as runtime (not docker) | Same, uses containerd/crun |
| Docker Compose | Native | Podman Compose (not fully compatible) |
| Ecosystem / documentation | Very extensive, industry standard | Growing, especially in RHEL/Fedora |
| Harbor integration | Native | Compatible |
| Jenkins integration | Mature official plugins | Compatible with additional configuration |

### Justification for the choice: Docker

- **Industry standard**: Docker is the reference tool for containers. All the documentation for the stack services (ChirpStack, InfluxDB, Grafana, Harbor...) provides official images and examples based on Docker.
- **Jenkins plugin ecosystem**: Jenkins plugins for Docker are very mature and widely documented. The Jenkins + Docker integration for CI/CD pipelines is a production-proven combination for years.
- **Harbor compatibility**: Harbor is primarily designed and documented for Docker environments. Although Podman is compatible, Docker guarantees the most direct workflow.
- **Team's learning curve**: Docker is the tool the team knows and has worked with during the course. Switching to Podman in this context would add complexity without real benefit.
- **Technical note**: In K8s, Docker as a runtime was deprecated in favor of containerd directly from K8s v1.24. However, Docker remains the main tool to *build* images in CI/CD pipelines, which is its role in FireSense.

---

## Docker Compose vs Podman Compose

| Criterion | **Docker Compose** | Podman Compose |
|---|---|---|
| License | Apache 2.0 | GPL 2.0 |
| Current version | v2.x (integrated Docker plugin) | 1.x |
| Maturity | Very high, official part of Docker | Third-party project, less mature |
| Compose specification | 100% compatible | Partial compatibility (not all features) |
| Use in FireSense | Local development environment | — |
| Documentation | Extensive, official | More limited |
| Inter-service networking | Mature, well-tested | May have behavioral differences |

### Justification for the choice: Docker Compose

- **Role in the project**: Docker Compose is used in FireSense exclusively for the **development environment**, before deploying to K8s. In production, Kubernetes manifests are used.
- **Maturity and reliability**: Docker Compose v2 is an official Docker plugin with completely predictable behavior. Podman Compose is a third-party project with partial compatibility that can generate unexpected behaviors when working with the same `compose.yaml` file used as a reference for K8s manifests.
- **Consistency**: Using Docker + Docker Compose ensures that the development environment and the CI/CD environment use the same tools, reducing the risk of differences between environments.

---

## Kubernetes (K8s) vs K3s

| Criterion | **K8s (vanilla)** | K3s |
|---|---|---|
| Developer | CNCF / Google | Rancher (SUSE) |
| License | Apache 2.0 | Apache 2.0 |
| Current version | 1.30.x | 1.30.x (same API) |
| Minimum RAM (master) | ~2–4 GB | ~512 MB |
| Binary | ~500+ MB | ~70 MB (all-in-one) |
| Installation | kubeadm (multiple steps) | 1 curl command |
| etcd | External or embedded | SQLite or embedded etcd |
| API compatibility | 100% Kubernetes API | 100% Kubernetes API |
| Ingress included | No (manual installation) | Traefik included |
| CRI (container runtime) | containerd, CRI-O | embedded containerd |
| Ideal for | Enterprise production, large clusters | Edge, IoT, labs, limited resources |

### Justification for the choice: vanilla K8s

- **Academic goal**: The project aims to demonstrate mastery of Kubernetes in its standard form. Using vanilla K8s with kubeadm proves knowledge of all Control Plane components (etcd, kube-apiserver, kube-scheduler, kube-controller-manager) as they are used in real professional environments.
- **100% compatibility**: Although K3s is compatible with the K8s API, there are differences in etcd management, the default runtime, and some network configurations. Vanilla K8s guarantees that all manifests, NetworkPolicies, and PodSecurityStandards work exactly as they do in production.
- **Complete hardening**: The project requires kube-bench (CIS auditing) and PodSecurityStandards. These tools are designed and documented for vanilla K8s. In K3s, some CIS audits have different results due to the simplified architecture.
- **Available resources**: The VMs in IsardVDI have sufficient resources (4 GB RAM per node) to run vanilla K8s without issues.

---

## Helm vs Kustomize

| Criterion | **Helm** | Kustomize |
|---|---|---|
| License | Apache 2.0 | Apache 2.0 |
| Current version | v3.x | v5.x (integrated into kubectl) |
| Paradigm | Templating with charts (Go templates) | Overlays on base YAML (no templates) |
| Dependency management | Yes (Chart dependencies) | No |
| Public chart repositories | Very extensive (ArtifactHub) | N/A |
| Release versioning | Yes (helm history, rollback) | Not native |
| Learning curve | Medium | Low |
| CI/CD integration | Very good (helm upgrade in pipelines) | Good (kubectl apply -k) |
| Secret generation | Plugins available | Limited |

### Justification for the choice: Helm

- **Official charts available**: Most of the FireSense stack services (InfluxDB, Grafana, Harbor, Jenkins, ChirpStack) have official or widely maintained charts on ArtifactHub, enormously reducing the initial configuration time.
- **Release management**: Helm maintains a release history and allows rolling back to previous versions with a single command (`helm rollback`), which is essential for the project's DRP (Disaster Recovery Plan).
- **Jenkins integration**: The FireSense CI/CD pipeline includes `helm upgrade --install` as the final deployment step, allowing atomic and reversible service updates.
- **Parameterization**: Helm allows managing different configurations for development and production using different `values.yaml` files, while maintaining the same base chart.