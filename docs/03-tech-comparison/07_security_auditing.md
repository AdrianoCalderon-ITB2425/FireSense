# Comparison: Security, Identity, and Auditing

---

## Trivy vs Clair

| Criterion | **Trivy** | Clair |
|---|---|---|
| License | Apache 2.0 | Apache 2.0 |
| Developer | Aqua Security | Quay / Red Hat |
| Current version | 0.5x.x | v4.x |
| What it scans | Images, files, Git repos, K8s, IaC | Mainly container images |
| CVE sources | NVD, GitHub Advisories, OS vendor advisories | NVD, OS vendor advisories |
| Harbor integration | Native (Harbor uses Trivy by default) | Available, but requires configuration |
| CI/CD integration | Direct CLI, Jenkins plugin, GitHub Actions | Requires API |
| Usage mode | Standalone CLI + integration | API service (client-server architecture) |
| Scanning speed | Fast (local database) | Slower (downloads layers) |
| IaC scanning | Yes (Kubernetes YAML, Terraform, Dockerfile) | No |
| Learning curve | Low | Medium-high |

### Justification for the choice: Trivy

- **Native Harbor integration**: Harbor uses Trivy as the default scanner since Harbor v2.0. Choosing Trivy means integration with the image registry works without any additional configuration.
- **Scanning beyond images**: Trivy can scan not only Docker images but also Kubernetes manifests themselves (Deployments, StatefulSets) and Dockerfiles, which adds an additional layer of security to the FireSense pipeline.
- **Standalone CLI**: Trivy works as an independent command-line tool, making it easy to integrate into the Jenkinsfile as an explicit pipeline step without needing to deploy an additional service.
- **Lower complexity**: Clair uses a client-server architecture that requires deploying the Clair service, an additional PostgreSQL database, and a client. Trivy can run directly as a container in the pipeline.

---

## kube-bench vs kube-hunter

| Criterion | **kube-bench** | kube-hunter |
|---|---|---|
| License | Apache 2.0 | Apache 2.0 |
| Developer | Aqua Security | Aqua Security |
| Function | Configuration auditing (CIS Benchmark) | Pentesting and active vulnerability detection |
| Analysis type | Static (cluster configuration) | Dynamic (simulates attacks from inside/outside) |
| Reference standard | CIS Kubernetes Benchmark | OWASP / Active CVEs |
| Result | List of pass/fail checks with remediation | List of found vulnerabilities |
| Execution mode | K8s Job or direct binary | K8s Pod or binary |
| Typical use | Hardening and compliance | Red team, pentesting |

### Justification for the choice: kube-bench

- **Project goal**: The FireSense proposal expressly specifies "CIS auditing with kube-bench". The CIS Kubernetes Benchmark is the reference standard for hardening K8s clusters, and kube-bench is the tool that implements it.
- **Complementary roles**: kube-bench and kube-hunter are not equivalent tools; they are complementary. kube-bench verifies that the cluster *configuration* complies with the CIS security benchmark. kube-hunter looks for *active* vulnerabilities by simulating attacks. For the project, kube-bench is the correct tool for the hardening and compliance documentation phase.
- **Guided remediation**: kube-bench not only indicates which checks fail but also provides specific steps to remediate each one, which is very useful during the cluster hardening phase.

---

## OpenLDAP vs FreeIPA

| Criterion | **OpenLDAP** | FreeIPA |
|---|---|---|
| License | OpenLDAP Public License | GPL 3.0 |
| Current version | 2.6.x | 4.11.x |
| Components | LDAP only | LDAP + Kerberos + DNS + CA + NTP |
| RAM consumption | < 50 MB | 1–2 GB |
| Recommended OS | Any Linux | RHEL, Fedora, Rocky Linux |
| Installation complexity | Medium | High |
| Authentication | Simple LDAP / SASL | Kerberos SSO + LDAP |
| Grafana integration | Yes, native LDAP | Yes, via LDAP |
| SSH integration | Yes (sssd + LDAP) | Yes, native (host enrollment) |
| Certificate management | Not included | Built-in CA |
| Typical use | Lightweight LDAP directory | Full enterprise IAM suite |

### Justification for the choice: OpenLDAP

- **Resources**: FreeIPA requires between 1 and 2 GB of RAM just for its own processes (LDAP + Kerberos + DNS + NTP + CA). In an environment with 3 VMs shared among all FireSense services, this is unfeasible.
- **Suitability for the use case**: FireSense only needs a centralized directory to authenticate users in Grafana, Node-RED, and SSH. OpenLDAP covers exactly these use cases with less than 50 MB of RAM.
- **Unnecessary complexity**: FreeIPA includes Kerberos (SSO), its own CA, its own DNS server, and NTP. None of these additional components are necessary in FireSense, where TLS is managed with cert-manager and DNS with CoreDNS.
- **Guaranteed compatibility**: LDAP integrations for Grafana, Node-RED, and OpenSSH are specifically documented for OpenLDAP, with example configuration files directly available.

---

## nftables vs Firewalld

| Criterion | **nftables** | Firewalld |
|---|---|---|
| License | GPL 2.0 | GPL 2.0 |
| Level | Low-level tool (kernel netfilter) | High-level frontend (uses nftables/iptables) |
| Configuration | Direct, rule files | Predefined zones and services |
| Performance | Very high (compiled to kernel bytecode) | Equal (uses nftables underneath in recent versions) |
| Flexibility | Total | Limited to firewalld abstractions |
| Learning curve | Medium-high | Low |
| Granular control | Very high | Limited |
| Use in containers/K8s | Native, no conflicts | Can have conflicts with K8s rules |

### Justification for the choice: nftables

- **Granular control needed for K8s**: In a Kubernetes environment, network rules are complex (kube-proxy generates dynamic rules, NetworkPolicies require specific rules). nftables allows defining these rules accurately without firewalld's abstractions, which could conflict.
- **Firewalld uses nftables underneath**: Since RHEL 8 / Fedora, firewalld uses nftables as a backend. Using nftables directly removes a layer of abstraction and gives full control over the rules.
- **Specific hardening**: The FireSense proposal requires specific network hardening (exposing only Grafana and the Node-RED API via Ingress, blocking direct outside access to Mosquitto). This type of granular rule is expressed more clearly and efficiently with nftables.

---

## WireGuard vs OpenVPN

| Criterion | **WireGuard** | OpenVPN |
|---|---|---|
| License | GPL 2.0 | GPL 2.0 |
| Current version | Integrated into Linux kernel 5.6+ | 2.6.x |
| Architecture | Kernel module (kernel space) | User space |
| Speed | Very high (~10 Gbps on modern hardware) | Moderate (~100–500 Mbps typical) |
| Latency | Very low | Higher |
| Lines of code | ~4,000 (easily auditable) | ~600,000 |
| Configuration | Simple (key pair + peers) | Complex (CA, certs, extensive configuration) |
| Protocol | UDP only | UDP and TCP |
| NAT Traversal | Good | Good (TCP allows bypassing firewalls) |
| Linux integration | Native since kernel 5.6 | Requires installation |

### Justification for the choice: WireGuard

- **Superior performance**: WireGuard operates in kernel space, giving it significantly higher performance than OpenVPN. For a real-time monitoring system like FireSense, minimal latency in the VPN tunnel is relevant.
- **Reduced attack surface**: WireGuard has approximately 4,000 lines of code compared to OpenVPN's ~600,000. Less code means a smaller potential attack surface and easier auditing, which fits the project's hardening approach.
- **Simple configuration**: WireGuard configuration is notably simpler than OpenVPN's (which requires a complete PKI with CA, certificate generation, CRL...). With WireGuard, key pairs are generated and peers are defined in a simple configuration file.
- **Available in the kernel**: WireGuard has been integrated into the Linux kernel since version 5.6. Modern distributions (Ubuntu 20.04+, Debian 11+) have it available without needing to install additional modules.

---

## cert-manager vs acme.sh

| Criterion | **cert-manager** | acme.sh |
|---|---|---|
| License | Apache 2.0 | GPL 3.0 |
| Type | K8s Operator (CRDs) | Standalone bash script |
| K8s integration | Native (CRDs: Certificate, Issuer, ClusterIssuer) | Manual (renew and copy certificates) |
| Automatic renewal | Yes, fully automatic | Yes, via cron |
| ACME providers | Let's Encrypt, ZeroSSL, others | Let's Encrypt, ZeroSSL, others |
| Private CA | Yes (SelfSigned Issuer, CA Issuer) | No |
| Ingress integration | Automatic via annotations | Manual |
| K8s Secrets management | Automatic (creates and updates TLS Secrets) | Manual |
| Complexity in K8s | Low (once installed) | High (manual integration) |

### Justification for the choice: cert-manager

- **Native K8s integration**: cert-manager is the standard for certificate management in Kubernetes. It is installed as an operator and certificates are defined as K8s resources (CRDs), perfectly fitting the project's Infrastructure as Code approach.
- **Complete automation**: cert-manager automatically renews certificates before expiration and updates the corresponding Kubernetes TLS Secrets without manual intervention. With acme.sh, renewal and Secrets updates would need to be managed manually or via scripts.
- **Private CA for internal services**: cert-manager can act as a private CA to generate TLS certificates for internal cluster services (pod-to-pod communication, internal services) using the SelfSigned Issuer, which acme.sh cannot do.
- **Nginx Ingress integration**: The cert-manager + Nginx Ingress Controller combination is the standard way to manage TLS in K8s. By just adding an annotation to the Ingress, cert-manager requests and manages the certificate automatically.

---

## phpLDAPadmin vs LDAP Account Manager (LAM)

| Criterion | **phpLDAPadmin** | LDAP Account Manager (LAM) |
|---|---|---|
| License | GPL 2.0 | GPL 2.0 |
| Current version | 1.2.x | 8.x |
| Type | Generic LDAP web administration interface | Web interface oriented towards user/group management |
| Technology | PHP | PHP |
| OpenLDAP compatibility | Full | Full |
| LDAP tree navigation | Yes, full (interactive tree view) | Limited (form-oriented) |
| Direct LDAP entry editing | Yes, any attribute | Yes, but via predefined forms |
| LDAP schema management | Yes | Partial |
| User/group creation | Yes (manual, via generic form) | Yes (specific forms for users, groups, hosts) |
| Predefined profiles | No | Yes (templates for posixAccount, sambaSamAccount...) |
| Application authentication | LDAP user | LDAP user or its own manager |
| RAM consumption | Very low (PHP + lightweight web server) | Very low (PHP + lightweight web server) |
| Documentation | Extensive, very well-known | Good |
| Community | Large, highly veteran tool | Active, but smaller |

### Justification for the choice: phpLDAPadmin

- **Full visibility of the LDAP tree**: phpLDAPadmin allows exploring, editing, and debugging any entry and attribute of the LDAP tree directly, without the restrictions of predefined forms. This is essential during the OpenLDAP configuration and testing phase in FireSense, where it is necessary to verify that user, group, and OU entries have been created correctly.
- **Reference tool for OpenLDAP**: phpLDAPadmin is the most well-known and documented LDAP web administration interface in the world. Any OpenLDAP guide includes examples with phpLDAPadmin, enormously facilitating troubleshooting.
- **Direct debugging and administration**: In a development and lab environment like FireSense, being able to directly see and modify any LDAP attribute (without going through forms that might hide information) is a clear advantage over LAM, which prioritizes ease of use over total control.
- **Lightweight**: Like LAM, phpLDAPadmin is a PHP application that can be deployed in a minimal Docker container, with no significant impact on cluster resources.
- **Use case in FireSense**: It is used as an internal administration tool to manage centralized OpenLDAP users (Grafana, Node-RED, SSH). It is not an externally exposed service, but an internal management tool for the team.