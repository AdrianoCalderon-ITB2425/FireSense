# Comparativa: Seguretat, Identitat i Auditoria

---

## Trivy vs Clair

| Criteri | **Trivy** | Clair |
|---|---|---|
| Llicència | Apache 2.0 | Apache 2.0 |
| Desenvolupador | Aqua Security | Quay / Red Hat |
| Versió actual | 0.5x.x | v4.x |
| Què escaneja | Imatges, fitxers, repos Git, K8s, IaC | Principalment imatges de contenidor |
| Fonts de CVE | NVD, GitHub Advisories, OS vendor advisories | NVD, OS vendor advisories |
| Integració amb Harbor | Nativa (Harbor usa Trivy per defecte) | Disponible, però requereix configuració |
| Integració amb CI/CD | CLI directa, plugin Jenkins, GitHub Actions | Requereix API |
| Mode d'ús | CLI standalone + integració | Servei d'API (arquitectura client-servidor) |
| Velocitat d'escaneig | Ràpid (base de dades local) | Més lent (descàrrega de layers) |
| Escaneig IaC | Sí (Kubernetes YAML, Terraform, Dockerfile) | No |
| Corba d'aprenentatge | Baixa | Mitjana-alta |

### Justificació de l'elecció: Trivy

- **Integració nativa amb Harbor**: Harbor usa Trivy com a escàner per defecte des de Harbor v2.0. Escollir Trivy significa que la integració amb el registre d'imatges funciona sense cap configuració addicional.
- **Escaneig més enllà d'imatges**: Trivy pot escanejar no només imatges Docker sinó també els propis manifests de Kubernetes (Deployments, StatefulSets) i Dockerfiles, cosa que aporta una capa addicional de seguretat al pipeline de FireSense.
- **CLI standalone**: Trivy funciona com a eina de línia de comandes independent, cosa que facilita la seva integració al Jenkinsfile com a pas explícit del pipeline sense necessitat de desplegar un servei addicional.
- **Menor complexitat**: Clair usa una arquitectura client-servidor que requereix desplegar el servei de Clair, una base de dades PostgreSQL addicional i un client. Trivy pot executar-se directament com a contenidor al pipeline.

---

## kube-bench vs kube-hunter

| Criteri | **kube-bench** | kube-hunter |
|---|---|---|
| Llicència | Apache 2.0 | Apache 2.0 |
| Desenvolupador | Aqua Security | Aqua Security |
| Funció | Auditoria de configuració (CIS Benchmark) | Pentesting i detecció de vulnerabilitats actives |
| Tipus d'anàlisi | Estàtic (configuració del clúster) | Dinàmic (simula atacs des de dins/fora) |
| Estàndard de referència | CIS Kubernetes Benchmark | OWASP / CVEs actius |
| Resultat | Llista de checks pass/fail amb remediació | Llista de vulnerabilitats trobades |
| Mode d'execució | Job de K8s o binari directe | Pod de K8s o binari |
| Ús típic | Hardening i compliance | Red team, pentesting |

### Justificació de l'elecció: kube-bench

- **Objectiu del projecte**: La proposta de FireSense especifica expressament "auditoria CIS amb kube-bench". El CIS Kubernetes Benchmark és l'estàndard de referència per al hardening de clústers K8s, i kube-bench és l'eina que l'implementa.
- **Rols complementaris**: kube-bench i kube-hunter no són eines equivalents; són complementàries. kube-bench verifica que la *configuració* del clúster compleix el benchmark de seguretat CIS. kube-hunter cerca vulnerabilitats *actives* simulant atacs. Per al projecte, kube-bench és l'eina correcta per a la fase de hardening i documentació de compliance.
- **Remediació guiada**: kube-bench no només indica quins checks fallen, sinó que proporciona els passos específics per remediar cadascun, cosa que és molt útil durant la fase de hardening del clúster.

---

## OpenLDAP vs FreeIPA

| Criteri | **OpenLDAP** | FreeIPA |
|---|---|---|
| Llicència | OpenLDAP Public License | GPL 3.0 |
| Versió actual | 2.6.x | 4.11.x |
| Components | Només LDAP | LDAP + Kerberos + DNS + CA + NTP |
| Consum RAM | < 50 MB | 1–2 GB |
| SO recomanat | Qualsevol Linux | RHEL, Fedora, Rocky Linux |
| Complexitat d'instal·lació | Mitjana | Alta |
| Autenticació | LDAP simple / SASL | Kerberos SSO + LDAP |
| Integració amb Grafana | Sí, LDAP natiu | Sí, via LDAP |
| Integració amb SSH | Sí (sssd + LDAP) | Sí, nativa (host enrollment) |
| Gestió de certificats | No inclosa | CA integrada |
| Ús típic | Directori LDAP lleuger | Suite IAM empresarial completa |

### Justificació de l'elecció: OpenLDAP

- **Recursos**: FreeIPA requereix entre 1 i 2 GB de RAM només per als seus propis processos (LDAP + Kerberos + DNS + NTP + CA). En un entorn amb 3 VMs compartides entre tots els serveis de FireSense, això és inassumible.
- **Adequació al cas d'ús**: FireSense només necessita un directori centralitzat per autenticar usuaris a Grafana, Node-RED i SSH. OpenLDAP cobreix exactament aquests casos d'ús amb menys de 50 MB de RAM.
- **Complexitat innecessària**: FreeIPA inclou Kerberos (SSO), una CA pròpia, un servidor DNS propi i NTP. Cap d'aquests components addicionals és necessari a FireSense, on TLS es gestiona amb cert-manager i DNS amb CoreDNS.
- **Compatibilitat garantida**: Les integracions LDAP de Grafana, Node-RED i OpenSSH estan documentades específicament per a OpenLDAP, amb fitxers de configuració d'exemple disponibles directament.

---

## nftables vs Firewalld

| Criteri | **nftables** | Firewalld |
|---|---|---|
| Llicència | GPL 2.0 | GPL 2.0 |
| Nivell | Eina de baix nivell (kernel netfilter) | Frontend d'alt nivell (usa nftables/iptables) |
| Configuració | Directa, fitxers de regles | Zones i serveis predefinits |
| Rendiment | Molt alt (compilació a bytecode al kernel) | Igual (usa nftables per sota en versions recents) |
| Flexibilitat | Total | Limitada a les abstraccions de firewalld |
| Corba d'aprenentatge | Mitjana-alta | Baixa |
| Control granular | Molt alt | Limitat |
| Ús en contenidors/K8s | Natiu, sense conflictes | Pot tenir conflictes amb regles de K8s |

### Justificació de l'elecció: nftables

- **Control granular necessari per a K8s**: En un entorn Kubernetes, les regles de xarxa són complexes (kube-proxy genera regles dinàmiques, les NetworkPolicies requereixen regles específiques). nftables permet definir aquestes regles amb precisió sense les abstraccions de firewalld que poden entrar en conflicte.
- **Firewalld usa nftables per sota**: Des de RHEL 8 / Fedora, firewalld usa nftables com a backend. Usar nftables directament elimina una capa d'abstracció i dóna control total sobre les regles.
- **Hardening específic**: La proposta de FireSense requereix hardening de xarxa específic (exposar només Grafana i l'API de Node-RED via Ingress, bloquejar accés directe a Mosquitto des de l'exterior). Aquest tipus de regles granulars s'expressen més clarament i eficientment amb nftables.

---

## WireGuard vs OpenVPN

| Criteri | **WireGuard** | OpenVPN |
|---|---|---|
| Llicència | GPL 2.0 | GPL 2.0 |
| Versió actual | Integrat al kernel Linux 5.6+ | 2.6.x |
| Arquitectura | Mòdul de kernel (espai de kernel) | Espai d'usuari |
| Velocitat | Molt alta (~10 Gbps en maquinari modern) | Moderada (~100–500 Mbps típic) |
| Latència | Molt baixa | Major |
| Línies de codi | ~4.000 (auditable fàcilment) | ~600.000 |
| Configuració | Simple (parell de claus + peers) | Complexa (CA, certs, configuració extensa) |
| Protocol | UDP únicament | UDP i TCP |
| Traversal de NAT | Bo | Bo (TCP permet bypassar firewalls) |
| Integració a Linux | Nativa des del kernel 5.6 | Requereix instal·lació |

### Justificació de l'elecció: WireGuard

- **Rendiment superior**: WireGuard opera en l'espai de kernel, cosa que li dona un rendiment significativament superior a OpenVPN. Per a un sistema de monitorització en temps real com FireSense, la latència mínima al túnel VPN és rellevant.
- **Superfície d'atac reduïda**: WireGuard té aproximadament 4.000 línies de codi enfront de les ~600.000 d'OpenVPN. Menys codi significa menys superfície d'atac potencial i major facilitat d'auditoria, cosa que encaixa amb l'enfocament de hardening del projecte.
- **Configuració simple**: La configuració de WireGuard és notablement més senzilla que la d'OpenVPN (que requereix una PKI completa amb CA, generació de certificats, CRL...). Amb WireGuard es generen parells de claus i es defineixen els peers en un fitxer de configuració simple.
- **Disponible al kernel**: WireGuard està integrat al kernel Linux des de la versió 5.6. Les distribucions modernes (Ubuntu 20.04+, Debian 11+) el tenen disponible sense necessitat d'instal·lar mòduls addicionals.

---

## cert-manager vs acme.sh

| Criteri | **cert-manager** | acme.sh |
|---|---|---|
| Llicència | Apache 2.0 | GPL 3.0 |
| Tipus | Operador de K8s (CRDs) | Script bash standalone |
| Integració K8s | Nativa (CRDs: Certificate, Issuer, ClusterIssuer) | Manual (renovar i copiar certificats) |
| Renovació automàtica | Sí, completament automàtica | Sí, via cron |
| Proveïdors ACME | Let's Encrypt, ZeroSSL, altres | Let's Encrypt, ZeroSSL, altres |
| CA privada | Sí (SelfSigned Issuer, CA Issuer) | No |
| Integració amb Ingress | Automàtica via annotations | Manual |
| Gestió de Secrets K8s | Automàtica (crea i actualitza Secrets TLS) | Manual |
| Complexitat a K8s | Baixa (un cop instal·lat) | Alta (integració manual) |

### Justificació de l'elecció: cert-manager

- **Integració nativa amb K8s**: cert-manager és l'estàndard per a gestió de certificats a Kubernetes. S'instal·la com un operador i els certificats es defineixen com a recursos de K8s (CRDs), cosa que encaixa perfectament amb l'enfocament Infrastructure as Code del projecte.
- **Automatització completa**: cert-manager renova automàticament els certificats abans de la seva expiració i actualitza els Kubernetes Secrets TLS corresponents, sense intervenció manual. Amb acme.sh caldria gestionar la renovació i l'actualització dels Secrets manualment o via scripts.
- **CA privada per a serveis interns**: cert-manager pot actuar com a CA privada per generar certificats TLS per als serveis interns del clúster (comunicació entre pods, serveis interns) usant el SelfSigned Issuer, cosa que acme.sh no pot fer.
- **Integració amb Nginx Ingress**: La combinació cert-manager + Nginx Ingress Controller és la forma estàndard de gestionar TLS a K8s. Només afegint una annotation a l'Ingress, cert-manager sol·licita i gestiona el certificat automàticament.
