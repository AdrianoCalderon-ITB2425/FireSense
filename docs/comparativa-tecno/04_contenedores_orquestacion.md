# Comparativa: Contenedores y Orquestación

---

## Docker vs Podman

| Criterio | **Docker** | Podman |
|---|---|---|
| Licencia | Apache 2.0 (Engine) | Apache 2.0 |
| Versión actual | 26.x | 5.x |
| Arquitectura | Daemon centralizado (dockerd) | Daemonless (sin proceso en segundo plano) |
| Ejecución rootless | Sí (desde v20.10) | Sí, por diseño desde el inicio |
| Compatibilidad de comandos | Referencia estándar | Compatible (`alias docker=podman`) |
| Soporte en K8s | containerd como runtime (no docker) | Igual, usa containerd/crun |
| Docker Compose | Nativo | Podman Compose (compatibilidad no total) |
| Ecosistema / documentación | Muy extenso, estándar de la industria | Creciente, especialmente en RHEL/Fedora |
| Integración con Harbor | Nativa | Compatible |
| Integración con Jenkins | Plugins oficiales maduros | Compatible con configuración adicional |

### Justificación de elección: Docker

- **Estándar de la industria**: Docker es la herramienta de referencia para contenedores. Toda la documentación de los servicios del stack (ChirpStack, InfluxDB, Grafana, Harbor...) proporciona imágenes y ejemplos oficiales basados en Docker.
- **Ecosistema de plugins en Jenkins**: Los plugins de Jenkins para Docker están muy maduros y ampliamente documentados. La integración Jenkins + Docker para pipelines CI/CD es una combinación probada en producción durante años.
- **Compatibilidad con Harbor**: Harbor está diseñado y documentado principalmente para entornos Docker. Aunque Podman es compatible, Docker garantiza el flujo más directo.
- **Curva de aprendizaje del equipo**: Docker es la herramienta que el equipo conoce y ha trabajado durante el curso. Cambiar a Podman en este contexto añadiría complejidad sin beneficio real.
- **Nota técnica**: En K8s, Docker como runtime fue deprecado en favor de containerd directamente desde K8s v1.24. Sin embargo, Docker sigue siendo la herramienta principal para *construir* imágenes en los pipelines CI/CD, que es su rol en FireSense.

---

## Docker Compose vs Podman Compose

| Criterio | **Docker Compose** | Podman Compose |
|---|---|---|
| Licencia | Apache 2.0 | GPL 2.0 |
| Versión actual | v2.x (plugin integrado en Docker) | 1.x |
| Madurez | Muy alta, parte oficial de Docker | Proyecto de terceros, menos maduro |
| Especificación Compose | 100% compatible | Compatibilidad parcial (no todas las features) |
| Uso en FireSense | Entorno de desarrollo local | — |
| Documentación | Extensa, oficial | Más limitada |
| Networking entre servicios | Maduro, bien probado | Puede tener diferencias de comportamiento |

### Justificación de elección: Docker Compose

- **Rol en el proyecto**: Docker Compose se usa en FireSense exclusivamente para el **entorno de desarrollo**, antes de desplegar en K8s. En producción se usan los manifests de Kubernetes.
- **Madurez y fiabilidad**: Docker Compose v2 es un plugin oficial de Docker con comportamiento completamente predecible. Podman Compose es un proyecto de terceros con compatibilidad parcial que puede generar comportamientos inesperados al trabajar con el mismo fichero `compose.yaml` que se usa como referencia para los manifests K8s.
- **Consistencia**: Usar Docker + Docker Compose garantiza que el entorno de desarrollo y el entorno de CI/CD usan las mismas herramientas, reduciendo el riesgo de diferencias entre entornos.

---

## Kubernetes (K8s) vs K3s

| Criterio | **K8s (vanilla)** | K3s |
|---|---|---|
| Desarrollador | CNCF / Google | Rancher (SUSE) |
| Licencia | Apache 2.0 | Apache 2.0 |
| Versión actual | 1.30.x | 1.30.x (misma API) |
| RAM mínima (master) | ~2–4 GB | ~512 MB |
| Binario | ~500+ MB | ~70 MB (todo en uno) |
| Instalación | kubeadm (múltiples pasos) | 1 comando curl |
| etcd | Externo o embebido | SQLite o etcd embebido |
| API compatibility | 100% Kubernetes API | 100% Kubernetes API |
| Ingress incluido | No (instalar manualmente) | Traefik incluido |
| CRI (container runtime) | containerd, CRI-O | containerd embebido |
| Ideal para | Producción empresarial, clusters grandes | Edge, IoT, labs, recursos limitados |

### Justificación de elección: K8s vanilla

- **Objetivo académico**: El proyecto tiene como objetivo demostrar el dominio de Kubernetes en su forma estándar. Usar K8s vanilla con kubeadm acredita el conocimiento de todos los componentes del Control Plane (etcd, kube-apiserver, kube-scheduler, kube-controller-manager) tal y como se usan en entornos profesionales reales.
- **Compatibilidad 100%**: Aunque K3s es compatible con la API de K8s, existen diferencias en la gestión del etcd, el runtime por defecto y algunas configuraciones de red. Con K8s vanilla se garantiza que todos los manifests, NetworkPolicies y PodSecurityStandards funcionan exactamente como en producción.
- **Hardening completo**: El proyecto requiere kube-bench (auditoría CIS) y PodSecurityStandards. Estas herramientas están diseñadas y documentadas para K8s vanilla. En K3s algunas auditorías CIS tienen resultados diferentes por la arquitectura simplificada.
- **Recursos disponibles**: Las VMs en IsardVDI tienen suficientes recursos (4 GB RAM por nodo) para ejecutar K8s vanilla sin problemas.

---

## Helm vs Kustomize

| Criterio | **Helm** | Kustomize |
|---|---|---|
| Licencia | Apache 2.0 | Apache 2.0 |
| Versión actual | v3.x | v5.x (integrado en kubectl) |
| Paradigma | Templating con charts (Go templates) | Overlays sobre YAML base (sin templates) |
| Gestión de dependencias | Sí (Chart dependencies) | No |
| Repositorios públicos de charts | Muy extensos (ArtifactHub) | No aplica |
| Versionado de releases | Sí (helm history, rollback) | No nativo |
| Curva de aprendizaje | Media | Baja |
| Integración con CI/CD | Muy buena (helm upgrade en pipelines) | Buena (kubectl apply -k) |
| Generación de secretos | Plugins disponibles | Limitada |

### Justificación de elección: Helm

- **Charts oficiales disponibles**: La mayoría de los servicios del stack FireSense (InfluxDB, Grafana, Harbor, Jenkins, ChirpStack) tienen charts oficiales o ampliamente mantenidos en ArtifactHub, lo que reduce enormemente el tiempo de configuración inicial.
- **Gestión de releases**: Helm mantiene un historial de releases y permite hacer rollback a versiones anteriores con un solo comando (`helm rollback`), lo que es esencial para el DRP (Disaster Recovery Plan) del proyecto.
- **Integración con Jenkins**: El pipeline CI/CD de FireSense incluye `helm upgrade --install` como paso final del despliegue, lo que permite actualizaciones atómicas y reversibles de los servicios.
- **Parametrización**: Helm permite gestionar configuraciones diferentes para desarrollo y producción usando ficheros `values.yaml` distintos, manteniendo el mismo chart base.
