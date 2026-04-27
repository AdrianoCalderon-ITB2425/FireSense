# Comparison: Networking and Routing

---

## Nginx Ingress Controller vs Traefik

| Criterion | **Nginx Ingress Controller** | Traefik |
|---|---|---|
| License | Apache 2.0 | MIT |
| Current version | 1.10.x | v3.x |
| Technological base | Nginx (C) | Go |
| K8s maturity | Very high, reference Ingress | High, especially in K3s |
| Configuration | Annotations + ConfigMaps | Custom CRDs (IngressRoute) + annotations |
| Automatic TLS (cert-manager) | Yes, highly documented | Yes, also compatible |
| Rate limiting | Yes, native via annotations | Yes, via middlewares |
| Basic authentication | Yes | Yes |
| Dashboard | No (requires external tools) | Yes, included |
| Performance under high load | Very high (Nginx C engine) | High (Go) |
| K8s documentation | Extensive, default Ingress in many guides | Good |
| Default in | kubeadm (no, must be installed) | K3s (included by default) |

### Justification for the choice: Nginx Ingress Controller

- **Reference standard in vanilla K8s**: When using K8s with kubeadm (not K3s), no Ingress Controller is included by default. Nginx Ingress Controller is the most documented and used in this setup, with official Kubernetes guides pointing to it.
- **Maturity and stability**: Nginx Ingress Controller has been the reference controller in Kubernetes for years. Its behavior with TLS, rate limiting, and authentication is widely tested and documented.
- **Integration with cert-manager**: The Nginx Ingress + cert-manager combination for automatic TLS is the most documented configuration in the K8s ecosystem, facilitating the implementation of the TLS required by the proposal.
- **Traefik and K3s**: Traefik is the natural choice when using K3s, as it comes included. Since FireSense uses vanilla K8s, installing Traefik requires the same amount of work as Nginx, with no additional advantage.
- **Performance**: The Nginx engine is written in C and has better performance under high load than Traefik (Go), although for FireSense's traffic volume, both would be more than sufficient.

---

## CoreDNS vs PowerDNS

| Criterion | **CoreDNS** | PowerDNS |
|---|---|---|
| License | Apache 2.0 | GPL 2.0 |
| Current version | 1.11.x | 4.x |
| K8s integration | Native Control Plane component | External, requires additional configuration |
| Role in K8s | Internal DNS resolution for services and pods | General-purpose DNS |
| Configuration | Corefile (simple) | Multiple backends (MySQL, PostgreSQL...) |
| RAM consumption | ~50–100 MB | ~100–200 MB |
| Plugins | Extensible via Go plugins | Backends and modules |
| Typical use | Internal K8s DNS | Enterprise network authoritative DNS |

### Justification for the choice: CoreDNS

- **Native K8s component**: CoreDNS is the DNS server that kubeadm installs automatically as part of the Kubernetes Control Plane. It is not an optional choice in vanilla K8s: it is the standard component for internal cluster DNS resolution (resolving service names like `grafana.monitoring.svc.cluster.local`).
- **No additional configuration required**: Being a cluster component, CoreDNS is already running after installation with kubeadm. PowerDNS is a general-purpose DNS server that would require additional configuration without providing advantages in the context of a K8s cluster.
- **Different use cases**: CoreDNS manages the cluster's internal DNS. PowerDNS is designed to be an authoritative network DNS server with multiple zones and backends, which goes beyond FireSense's needs.

---

## ISC DHCP vs Kea DHCP

| Criterion | **ISC DHCP** | Kea DHCP |
|---|---|---|
| License | MPL 2.0 | Apache 2.0 |
| Current version | 4.4.x | 2.6.x |
| Status | Maintenance (EoL planned for 2026) | Active successor to ISC DHCP |
| Architecture | Monolithic | Modular, with REST API |
| Configuration | dhcpd.conf file (plain text) | JSON + optional database |
| IPv6 support | Yes | Yes (better support) |
| High availability | Basic failover | More modern native HA |
| RAM consumption | ~20–50 MB | ~30–70 MB |
| Documentation | Extensive (decades) | Good and growing |
| Learning curve | Low (well-known) | Medium |

### Justification for the choice: ISC DHCP

- **Familiarity and documentation**: ISC DHCP is the most well-known DHCP server in the Linux/Unix world, with decades of documentation and examples. In an educational lab project, ease of configuration and abundance of documentation are key factors.
- **Simplicity for the use case**: ISC DHCP is used in FireSense solely for the IoT segment (assigning IPs to the LoRaWAN gateway and nodes). It is a simple task that does not require Kea's advanced capabilities (REST API, database, HA).
- **Note**: ISC DHCP has its End of Life scheduled for 2026, and the ISC recommends migrating to Kea. For a long-term production project, Kea would be the right choice. In the context of this academic project, ISC DHCP is perfectly valid, and its configuration is more straightforward.