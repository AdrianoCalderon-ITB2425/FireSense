# Comparison: Virtualization (Private Cloud)

---

## IsardVDI vs AWS/ISARD

| Criterion | **IsardVDI** | AWS (EC2 / EKS) |
|---|---|---|
| Type | On-premises virtualization platform | Third-party public cloud |
| License | AGPL 3.0 (open source) | Proprietary (pay-as-you-go) |
| Cost | Free (self-hosted) | Paid (instances, storage, traffic) |
| Infrastructure control | Total | Limited (provider abstraction) |
| Internet dependency | No | Yes |
| Internal network latency | Minimal (local network) | Variable (depends on region) |
| Scalability | Limited by available hardware | Practically unlimited |
| Data privacy | Total (local data) | Subject to AWS policies |
| Availability at educational center| Yes (ITB has IsardVDI) | Requires account and credit card |
| Suitability for academic project | High | Medium (added cost and complexity) |

### Justification for the choice: IsardVDI

- **Availability in the educational environment**: The *Institut Tecnològic de Barcelona* (ITB) has IsardVDI as its institutional virtualization platform. This eliminates any dependency on external accounts, credit cards, or variable costs.
- **Zero cost**: AWS generates costs for instance usage, storage, and data transfer. For an academic project, this adds an unnecessary barrier and a risk of uncontrolled costs.
- **Total infrastructure control**: IsardVDI allows complete control over VM configuration (CPU, RAM, network, storage), which is essential for properly configuring the K8s cluster with the necessary resources.
- **Offline work**: IsardVDI works on the center's local network, without relying on internet connectivity. This ensures that the project can be developed and demonstrated under any conditions.
- **Pedagogical goal**: Managing on-premises virtualization is part of the ASIR curriculum, bringing additional value to the project compared to using a managed cloud platform that abstracts the infrastructure.

---

# Comparison: Artificial Intelligence / Machine Learning

## scikit-learn vs PyTorch

| Criterion | **scikit-learn** | PyTorch |
|---|---|---|
| License | BSD 3-Clause | BSD 3-Clause |
| Current version | 1.4.x | 2.x |
| Orientation | Classic ML (statistical algorithms) | Deep Learning (neural networks) |
| Use case in FireSense | Anomaly detection (Isolation Forest) | Complex deep learning models |
| Resource consumption | Very low (~50–100 MB) | High (~500 MB – several GB with GPU) |
| Learning curve | Low-medium | High |
| API | Simple and consistent | Flexible but more complex |
| Isolation Forest algorithm | Optimized official implementation | Not natively included |
| CPU execution | Efficient | Possible, but designed for GPU |
| Training time | Very fast for small datasets | Requires more data and time |
| K8s CronJob deployment | Very lightweight Docker image | Heavy Docker image |

### Justification for the choice: scikit-learn

- **Correct algorithm for the use case**: The FireSense proposal specifies the use of **Isolation Forest** for thermal anomaly detection. Scikit-learn has an official, optimized, and well-documented implementation of Isolation Forest. PyTorch does not include this algorithm natively and would require implementing it from scratch.
- **Adequate resources for the environment**: Scikit-learn executes classic ML models efficiently on the CPU with minimal memory consumption. PyTorch is primarily designed for deep learning with GPUs, making it unnecessarily heavy for an anomaly detection model on sensor time series.
- **Suitability for data volume**: The FireSense data (temperature and humidity from a small number of RAK WisBlock nodes) is a small dataset. PyTorch deep learning models require large volumes of data to be effective; scikit-learn's Isolation Forest works correctly with small datasets.
- **Deployment as a CronJob**: The model runs as a CronJob in K8s. A Docker image with scikit-learn weighs ~200–300 MB compared to the multiple GBs a PyTorch image can weigh. This significantly reduces the impact on the cluster.

---

# Comparison: Auxiliary and System Services

## Postfix vs Exim

| Criterion | **Postfix** | Exim |
|---|---|---|
| License | IPL / Eclipse (free) | GPL 2.0 |
| Current version | 3.8.x | 4.97.x |
| Architecture | Modular (multiple small processes) | Monolithic |
| Security | Designed with security as a priority | Good, but more history of critical CVEs |
| Configuration | main.cf / master.cf, well-documented | Single acl file, more complex |
| Use as SMTP relay | Yes, very common | Yes |
| Grafana Alerting integration | Yes (SMTP relay) | Yes |
| Usage share on Linux servers | ~33% of internet servers | ~57% (mostly on cPanel systems) |
| Learning curve | Medium | High |
| Documentation | Extensive | Extensive |

### Justification for the choice: Postfix

- **Specific use case**: In FireSense, Postfix acts as an **SMTP relay** to send alerts from Grafana Alerting and Node-RED. For this role, Postfix is the most documented and straightforward choice in Linux environments.
- **Security**: Postfix was designed from the ground up with security as a fundamental principle (principle of least privilege, process separation). Historically, it has had fewer critical CVEs than Exim.
- **Simplicity for the use case**: Configuring Postfix as an SMTP relay is very straightforward and is widely documented for integrations with Grafana and alerting systems.

---

## Samba vs NFS

| Criterion | **Samba** | NFS |
|---|---|---|
| License | GPL 3.0 | Integrated into Linux kernel |
| Protocol | SMB/CIFS (Windows protocol) | NFS (Unix/Linux protocol) |
| Windows compatibility | Total | Limited (NFS client on Windows is basic) |
| Linux compatibility | Yes | Native |
| Authentication | User/password, LDAP/AD integration | IP/host-based, less granular |
| Use cases | Windows-Linux interoperability | File sharing between Linux systems |
| Local network performance | Good | Very high |
| Configuration | Medium | Simple |

### Justification for the choice: Samba

- **Windows interoperability**: The FireSense proposal expressly specifies "Samba for Windows interoperability". In an environment where forest rangers might use Windows workstations to access reports or data, Samba is essential. NFS has very limited support on Windows.
- **LDAP integration**: Samba can integrate with OpenLDAP for centralized authentication, fitting the project's single-directory strategy.

---

## rsync vs Rclone

| Criterion | **rsync** | Rclone |
|---|---|---|
| License | GPL 3.0 | MIT |
| Current version | 3.2.x | 1.6x.x |
| Own protocol | Yes (rsync protocol, delta sync) | No (uses each provider's APIs) |
| Supported destinations | Local, SSH/SFTP | +70 backends (S3, GCS, Azure, SFTP, local...) |
| Incremental transfer (delta)| Yes, very efficient | Yes (but without real delta in block storage) |
| Main use case | Local backups and via SSH | Synchronization with cloud storage |
| In-transit compression | Yes | Depends on the backend |
| Script integration | Very simple | Simple |
| K8s CronJob use | Lightweight Docker image | Docker image available |

### Justification for the choice: rsync

- **Local use case**: FireSense backups (InfluxDB, MongoDB) are performed between K8s cluster nodes via SSH, which is exactly the scenario rsync is optimized for. Its delta transfer algorithm minimizes network traffic by copying only the blocks that have changed.
- **Simplicity and maturity**: rsync is a reference Unix tool, with decades of production use for backups. Integrating it into K8s CronJob scripts is trivial.
- **No cloud dependencies**: Rclone shines when the destination is cloud storage (S3, GCS, Backblaze...). Since FireSense does not use the cloud (everything is on-premises on IsardVDI), Rclone's additional capabilities do not add value.

---

## SSH (OpenSSH) vs Dropbear SSH

| Criterion | **OpenSSH** | Dropbear SSH |
|---|---|---|
| License | BSD / MIT | MIT |
| Current version | 9.x | 2022.x |
| Features | Full (SSH, SCP, SFTP, port forwarding, agent...) | Reduced (basic SSH client/server) |
| Resource consumption | Low (~5–10 MB) | Very low (~110 KB binary) |
| Main use case | General-purpose servers | Embedded systems, routers, IoT with minimal resources |
| Key support | RSA, ECDSA, Ed25519 | RSA, ECDSA, Ed25519 |
| SFTP included | Yes | Optional (separate sftp-server) |
| Port forwarding | Yes | Yes (limited) |
| Standard in Linux distros | Yes, included by default | No |

### Justification for the choice: OpenSSH

- **Standard in Linux**: OpenSSH comes installed by default on all modern Linux distributions (Ubuntu, Debian, Rocky...). It requires no additional installation on the IsardVDI VMs.
- **Necessary features**: FireSense uses SSH not only for remote access but also for encrypted backups via rsync/SSH and for remote cluster management. OpenSSH natively supports all these functions.
- **Dropbear for embedded systems**: Dropbear is designed for systems with extremely limited resources, such as routers and IoT devices with a few KB of RAM. On IsardVDI VMs with 4 GB of RAM, Dropbear's resource savings are irrelevant.
- **Security and updates**: OpenSSH has an active update cycle and is the most audited SSH client/server in the world.