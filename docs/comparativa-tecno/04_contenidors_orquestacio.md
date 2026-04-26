# Comparativa: Contenidors i Orquestació

---

## Docker vs Podman

| Criteri | **Docker** | Podman |
|---|---|---|
| Llicència | Apache 2.0 (Engine) | Apache 2.0 |
| Versió actual | 26.x | 5.x |
| Arquitectura | Daemon centralitzat (dockerd) | Daemonless (sense procés en segon pla) |
| Execució rootless | Sí (des de v20.10) | Sí, per disseny des del principi |
| Compatibilitat de comandes | Referència estàndard | Compatible (`alias docker=podman`) |
| Suport a K8s | containerd com a runtime (no docker) | Igual, usa containerd/crun |
| Docker Compose | Natiu | Podman Compose (compatibilitat no total) |
| Ecosistema / documentació | Molt extens, estàndard de la indústria | Creixent, especialment a RHEL/Fedora |
| Integració amb Harbor | Nativa | Compatible |
| Integració amb Jenkins | Plugins oficials madurs | Compatible amb configuració addicional |

### Justificació de l'elecció: Docker

- **Estàndard de la indústria**: Docker és l'eina de referència per a contenidors. Tota la documentació dels serveis del stack (ChirpStack, InfluxDB, Grafana, Harbor...) proporciona imatges i exemples oficials basats en Docker.
- **Ecosistema de plugins a Jenkins**: Els plugins de Jenkins per a Docker estan molt madurs i àmpliament documentats. La integració Jenkins + Docker per a pipelines CI/CD és una combinació provada en producció durant anys.
- **Compatibilitat amb Harbor**: Harbor està dissenyat i documentat principalment per a entorns Docker. Tot i que Podman és compatible, Docker garanteix el flux més directe.
- **Corba d'aprenentatge de l'equip**: Docker és l'eina que l'equip coneix i ha treballat durant el curs. Canviar a Podman en aquest context afegiria complexitat sense benefici real.
- **Nota tècnica**: A K8s, Docker com a runtime va ser deprecat en favor de containerd directament des de K8s v1.24. No obstant això, Docker continua sent l'eina principal per *construir* imatges als pipelines CI/CD, que és el seu rol a FireSense.

---

## Docker Compose vs Podman Compose

| Criteri | **Docker Compose** | Podman Compose |
|---|---|---|
| Llicència | Apache 2.0 | GPL 2.0 |
| Versió actual | v2.x (plugin integrat a Docker) | 1.x |
| Maduresa | Molt alta, part oficial de Docker | Projecte de tercers, menys madur |
| Especificació Compose | 100% compatible | Compatibilitat parcial (no totes les features) |
| Ús a FireSense | Entorn de desenvolupament local | — |
| Documentació | Extensa, oficial | Més limitada |
| Networking entre serveis | Madur, ben provat | Pot tenir diferències de comportament |

### Justificació de l'elecció: Docker Compose

- **Rol al projecte**: Docker Compose s'utilitza a FireSense exclusivament per a l'**entorn de desenvolupament**, abans de desplegar a K8s. En producció s'utilitzen els manifests de Kubernetes.
- **Maduresa i fiabilitat**: Docker Compose v2 és un plugin oficial de Docker amb comportament completament predictible. Podman Compose és un projecte de tercers amb compatibilitat parcial que pot generar comportaments inesperats en treballar amb el mateix fitxer `compose.yaml` que s'utilitza com a referència per als manifests K8s.
- **Consistència**: Utilitzar Docker + Docker Compose garanteix que l'entorn de desenvolupament i l'entorn de CI/CD fan servir les mateixes eines, reduint el risc de diferències entre entorns.

---

## Kubernetes (K8s) vs K3s

| Criteri | **K8s (vanilla)** | K3s |
|---|---|---|
| Desenvolupador | CNCF / Google | Rancher (SUSE) |
| Llicència | Apache 2.0 | Apache 2.0 |
| Versió actual | 1.30.x | 1.30.x (mateixa API) |
| RAM mínima (master) | ~2–4 GB | ~512 MB |
| Binari | ~500+ MB | ~70 MB (tot en un) |
| Instal·lació | kubeadm (múltiples passos) | 1 comanda curl |
| etcd | Extern o embegut | SQLite o etcd embegut |
| API compatibility | 100% Kubernetes API | 100% Kubernetes API |
| Ingress inclòs | No (instal·lar manualment) | Traefik inclòs |
| CRI (container runtime) | containerd, CRI-O | containerd embegut |
| Ideal per a | Producció empresarial, clústers grans | Edge, IoT, labs, recursos limitats |

### Justificació de l'elecció: K8s vanilla

- **Objectiu acadèmic**: El projecte té com a objectiu demostrar el domini de Kubernetes en la seva forma estàndard. Utilitzar K8s vanilla amb kubeadm acredita el coneixement de tots els components del Control Plane (etcd, kube-apiserver, kube-scheduler, kube-controller-manager) tal com s'utilitzen en entorns professionals reals.
- **Compatibilitat 100%**: Tot i que K3s és compatible amb l'API de K8s, existeixen diferències en la gestió de l'etcd, el runtime per defecte i algunes configuracions de xarxa. Amb K8s vanilla es garanteix que tots els manifests, NetworkPolicies i PodSecurityStandards funcionen exactament com en producció.
- **Hardening complet**: El projecte requereix kube-bench (auditoria CIS) i PodSecurityStandards. Aquestes eines estan dissenyades i documentades per a K8s vanilla. A K3s algunes auditories CIS tenen resultats diferents per l'arquitectura simplificada.
- **Recursos disponibles**: Les VMs a IsardVDI tenen recursos suficients (4 GB RAM per node) per executar K8s vanilla sense problemes.

---

## Helm vs Kustomize

| Criteri | **Helm** | Kustomize |
|---|---|---|
| Llicència | Apache 2.0 | Apache 2.0 |
| Versió actual | v3.x | v5.x (integrat a kubectl) |
| Paradigma | Templating amb charts (Go templates) | Overlays sobre YAML base (sense templates) |
| Gestió de dependències | Sí (Chart dependencies) | No |
| Repositoris públics de charts | Molt extensos (ArtifactHub) | No aplica |
| Versionat de releases | Sí (helm history, rollback) | No natiu |
| Corba d'aprenentatge | Mitjana | Baixa |
| Integració amb CI/CD | Molt bona (helm upgrade als pipelines) | Bona (kubectl apply -k) |
| Generació de secrets | Plugins disponibles | Limitada |

### Justificació de l'elecció: Helm

- **Charts oficials disponibles**: La majoria dels serveis del stack FireSense (InfluxDB, Grafana, Harbor, Jenkins, ChirpStack) tenen charts oficials o àmpliament mantinguts a ArtifactHub, cosa que redueix enormement el temps de configuració inicial.
- **Gestió de releases**: Helm manté un historial de releases i permet fer rollback a versions anteriors amb una sola comanda (`helm rollback`), cosa que és essencial per al DRP (Disaster Recovery Plan) del projecte.
- **Integració amb Jenkins**: El pipeline CI/CD de FireSense inclou `helm upgrade --install` com a pas final del desplegament, cosa que permet actualitzacions atòmiques i reversibles dels serveis.
- **Parametrització**: Helm permet gestionar configuracions diferents per a desenvolupament i producció fent servir fitxers `values.yaml` diferents, mantenint el mateix chart base.
