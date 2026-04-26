# Comparativa: Seguridad, Identidad y Auditoría

---

## Trivy vs Clair

| Criterio | **Trivy** | Clair |
|---|---|---|
| Licencia | Apache 2.0 | Apache 2.0 |
| Desarrollador | Aqua Security | Quay / Red Hat |
| Versión actual | 0.5x.x | v4.x |
| Qué escanea | Imágenes, ficheros, repos Git, K8s, IaC | Principalmente imágenes de contenedor |
| Fuentes de CVE | NVD, GitHub Advisories, OS vendor advisories | NVD, OS vendor advisories |
| Integración con Harbor | Nativa (Harbor usa Trivy por defecto) | Disponible, pero requiere configuración |
| Integración con CI/CD | CLI directa, plugin Jenkins, GitHub Actions | Requiere API |
| Modo de uso | CLI standalone + integración | Servicio de API (arquitectura cliente-servidor) |
| Velocidad de escaneig | Rápido (base de datos local) | Más lento (descarga de layers) |
| Escaneig IaC | Sí (Kubernetes YAML, Terraform, Dockerfile) | No |
| Curva de aprendizaje | Baja | Media-alta |

### Justificación de elección: Trivy

- **Integración nativa con Harbor**: Harbor usa Trivy como escáner por defecto desde Harbor v2.0. Elegir Trivy significa que la integración con el registro de imágenes funciona sin ninguna configuración adicional.
- **Escaneig más allá de imágenes**: Trivy puede escanear no solo imágenes Docker sino también los propios manifests de Kubernetes (Deployments, StatefulSets) y Dockerfiles, lo que aporta una capa adicional de seguridad al pipeline de FireSense.
- **CLI standalone**: Trivy funciona como herramienta de línea de comandos independiente, lo que facilita su integración en el Jenkinsfile como paso explícito del pipeline sin necesidad de desplegar un servicio adicional.
- **Menor complejidad**: Clair usa una arquitectura cliente-servidor que requiere desplegar el servicio de Clair, una base de datos PostgreSQL adicional y un cliente. Trivy puede ejecutarse directamente como contenedor en el pipeline.

---

## kube-bench vs kube-hunter

| Criterio | **kube-bench** | kube-hunter |
|---|---|---|
| Licencia | Apache 2.0 | Apache 2.0 |
| Desarrollador | Aqua Security | Aqua Security |
| Función | Auditoría de configuración (CIS Benchmark) | Pentesting y detección de vulnerabilidades activas |
| Tipo de análisis | Estático (configuración del clúster) | Dinámico (simula ataques desde dentro/fuera) |
| Estándar de referencia | CIS Kubernetes Benchmark | OWASP / CVEs activos |
| Resultado | Lista de checks pass/fail con remediación | Lista de vulnerabilidades encontradas |
| Modo de ejecución | Job de K8s o binario directo | Pod de K8s o binario |
| Uso típico | Hardening y compliance | Red team, pentesting |

### Justificación de elección: kube-bench

- **Objetivo del proyecto**: La propuesta de FireSense especifica expresamente "auditoria CIS amb kube-bench". El CIS Kubernetes Benchmark es el estándar de referencia para el hardening de clústeres K8s, y kube-bench es la herramienta que lo implementa.
- **Roles complementarios**: kube-bench y kube-hunter no son herramientas equivalentes; son complementarias. kube-bench verifica que la *configuración* del clúster cumple el benchmark de seguridad CIS. kube-hunter busca vulnerabilidades *activas* simulando ataques. Para el proyecto, kube-bench es la herramienta correcta para la fase de hardening y documentación de compliance.
- **Remediación guiada**: kube-bench no solo indica qué checks fallan, sino que proporciona los pasos específicos para remediar cada uno, lo que es muy útil durante la fase de hardening del clúster.

---

## OpenLDAP vs FreeIPA

| Criterio | **OpenLDAP** | FreeIPA |
|---|---|---|
| Licencia | OpenLDAP Public License | GPL 3.0 |
| Versión actual | 2.6.x | 4.11.x |
| Componentes | Solo LDAP | LDAP + Kerberos + DNS + CA + NTP |
| Consumo RAM | < 50 MB | 1–2 GB |
| SO recomendado | Cualquier Linux | RHEL, Fedora, Rocky Linux |
| Complejidad instalación | Media | Alta |
| Autenticación | LDAP simple / SASL | Kerberos SSO + LDAP |
| Integración con Grafana | Sí, LDAP nativo | Sí, via LDAP |
| Integración con SSH | Sí (sssd + LDAP) | Sí, nativa (host enrollment) |
| Gestión de certificados | No incluida | CA integrada |
| Uso típico | Directorio LDAP ligero | Suite IAM empresarial completa |

### Justificación de elección: OpenLDAP

- **Recursos**: FreeIPA requiere entre 1 y 2 GB de RAM solo para sus propios procesos (LDAP + Kerberos + DNS + NTP + CA). En un entorno con 3 VMs compartidas entre todos los servicios de FireSense, esto es inasumible.
- **Adecuación al caso de uso**: FireSense solo necesita un directorio centralizado para autenticar usuarios en Grafana, Node-RED y SSH. OpenLDAP cubre exactamente estos casos de uso con menos de 50 MB de RAM.
- **Complejidad innecesaria**: FreeIPA incluye Kerberos (SSO), una CA propia, un servidor DNS propio y NTP. Ninguno de estos componentes adicionales es necesario en FireSense, donde TLS se gestiona con cert-manager y DNS con CoreDNS.
- **Compatibilidad garantizada**: Las integraciones LDAP de Grafana, Node-RED y OpenSSH están documentadas específicamente para OpenLDAP, con ficheros de configuración de ejemplo disponibles directamente.

---

## nftables vs Firewalld

| Criterio | **nftables** | Firewalld |
|---|---|---|
| Licencia | GPL 2.0 | GPL 2.0 |
| Nivel | Herramienta de bajo nivel (kernel netfilter) | Frontend de alto nivel (usa nftables/iptables) |
| Configuración | Directa, ficheros de reglas | Zonas y servicios predefinidos |
| Rendimiento | Muy alto (compilación a bytecode en kernel) | Igual (usa nftables por debajo en versiones recientes) |
| Flexibilidad | Total | Limitada a las abstracciones de firewalld |
| Curva de aprendizaje | Media-alta | Baja |
| Control granular | Muy alto | Limitado |
| Uso en contenedores/K8s | Nativo, sin conflictos | Puede tener conflictos con reglas de K8s |

### Justificación de elección: nftables

- **Control granular necesario para K8s**: En un entorno Kubernetes, las reglas de red son complejas (kube-proxy genera reglas dinámicas, las NetworkPolicies requieren reglas específicas). nftables permite definir estas reglas con precisión sin las abstracciones de firewalld que pueden entrar en conflicto.
- **Firewalld usa nftables por debajo**: Desde RHEL 8 / Fedora, firewalld usa nftables como backend. Usar nftables directamente elimina una capa de abstracción y da control total sobre las reglas.
- **Hardening específico**: La propuesta de FireSense requiere hardening de red específico (exponer solo Grafana y la API de Node-RED via Ingress, bloquear acceso directo a Mosquitto desde el exterior). Este tipo de reglas granulares se expresan más claramente y eficientemente en nftables.

---

## WireGuard vs OpenVPN

| Criterio | **WireGuard** | OpenVPN |
|---|---|---|
| Licencia | GPL 2.0 | GPL 2.0 |
| Versión actual | Integrado en kernel Linux 5.6+ | 2.6.x |
| Arquitectura | Módulo de kernel (espacio de kernel) | Espacio de usuario |
| Velocidad | Muy alta (~10 Gbps en hardware moderno) | Moderada (~100–500 Mbps típico) |
| Latencia | Muy baja | Mayor |
| Líneas de código | ~4.000 (auditable fácilmente) | ~600.000 |
| Configuración | Simple (par de claves + peers) | Compleja (CA, certs, configuración extensa) |
| Protocolo | UDP únicamente | UDP y TCP |
| Traversal de NAT | Bueno | Bueno (TCP permite bypassar firewalls) |
| Integración en Linux | Nativa desde kernel 5.6 | Requiere instalación |

### Justificación de elección: WireGuard

- **Rendimiento superior**: WireGuard opera en el espacio de kernel, lo que le da un rendimiento significativamente superior a OpenVPN. Para un sistema de monitorización en tiempo real como FireSense, la latencia mínima en el túnel VPN es relevante.
- **Superficie de ataque reducida**: WireGuard tiene aproximadamente 4.000 líneas de código frente a las ~600.000 de OpenVPN. Menos código significa menos superficie de ataque potencial y mayor facilidad de auditoría, lo que encaja con el enfoque de hardening del proyecto.
- **Configuración simple**: La configuración de WireGuard es notablemente más sencilla que la de OpenVPN (que requiere una PKI completa con CA, generación de certificados, CRL...). Con WireGuard se generan pares de claves y se definen los peers en un fichero de configuración simple.
- **Disponible en el kernel**: WireGuard está integrado en el kernel Linux desde la versión 5.6. Las distribuciones modernas (Ubuntu 20.04+, Debian 11+) lo tienen disponible sin necesidad de instalar módulos adicionales.

---

## cert-manager vs acme.sh

| Criterio | **cert-manager** | acme.sh |
|---|---|---|
| Licencia | Apache 2.0 | GPL 3.0 |
| Tipo | Operador de K8s (CRDs) | Script bash standalone |
| Integración K8s | Nativa (CRDs: Certificate, Issuer, ClusterIssuer) | Manual (renovar y copiar certificados) |
| Renovación automática | Sí, completamente automática | Sí, via cron |
| Proveedores ACME | Let's Encrypt, ZeroSSL, otros | Let's Encrypt, ZeroSSL, otros |
| CA privada | Sí (SelfSigned Issuer, CA Issuer) | No |
| Integración con Ingress | Automática via annotations | Manual |
| Gestión de Secrets K8s | Automática (crea y actualiza Secrets TLS) | Manual |
| Complejidad en K8s | Baja (una vez instalado) | Alta (integración manual) |

### Justificación de elección: cert-manager

- **Integración nativa con K8s**: cert-manager es el estándar para gestión de certificados en Kubernetes. Se instala como un operador y luego los certificados se definen como recursos de K8s (CRDs), lo que encaja perfectamente con el enfoque Infrastructure as Code del proyecto.
- **Automatización completa**: cert-manager renueva automáticamente los certificados antes de su expiración y actualiza los Kubernetes Secrets TLS correspondientes, sin intervención manual. Con acme.sh habría que gestionar la renovación y la actualización de los Secrets manualmente o via scripts.
- **CA privada para servicios internos**: cert-manager puede actuar como CA privada para generar certificados TLS para los servicios internos del clúster (comunicación entre pods, servicios internos) usando el SelfSigned Issuer, algo que acme.sh no puede hacer.
- **Integración con Nginx Ingress**: La combinación cert-manager + Nginx Ingress Controller es la forma estándar de gestionar TLS en K8s. Solo con añadir una annotation al Ingress, cert-manager solicita y gestiona el certificado automáticamente.
