# Comparativa: CI/CD y Registros

---

## Jenkins vs Gitea (como CI/CD)

| Criterio | **Jenkins** | Gitea Actions |
|---|---|---|
| Licencia | MIT | MIT |
| Versión actual | 2.452.x LTS | Incluido en Gitea 1.21+ |
| Rol principal | Servidor CI/CD dedicado | CI/CD integrado en el repositorio Git |
| Madurez | Muy alta (>15 años) | Relativamente reciente |
| Ecosistema de plugins | +1800 plugins oficiales | Compatible con sintaxis GitHub Actions |
| Integración con GitHub | Webhook oficial, plugin maduro | No aplica (Gitea es el repo) |
| Integración con Harbor | Plugin oficial (docker-workflow) | Via scripts en el pipeline |
| Integración con K8s | Plugin oficial kubernetes-plugin | Via kubectl en runners |
| UI de gestión | Propia, muy completa | Integrada en la UI de Gitea |
| Escalabilidad | Alta (agentes distribuidos) | Limitada (runners propios) |
| Curva de aprendizaje | Media-alta (Groovy/Jenkinsfile) | Baja (YAML, similar a GitHub Actions) |
| Recursos (RAM) | ~300–600 MB | Incluido en Gitea (~150 MB total) |

### Justificación de elección: Jenkins

- **Uso del repositorio en GitHub**: Como se decidió en la planificación del proyecto, el código se mantiene en GitHub. Jenkins se integra con GitHub via webhooks de forma nativa y con un plugin oficial maduro, sin necesidad de migrar el código a otro repositorio.
- **Madurez y ecosistema**: Jenkins lleva más de 15 años siendo el estándar de CI/CD en la industria. Sus plugins para Docker, Harbor, Kubernetes y Helm están ampliamente documentados y tienen soporte activo.
- **Pipeline como código**: Los Jenkinsfiles en Groovy permiten definir pipelines complejos con stages paralelas, condiciones, rollback automático y notificaciones, lo que encaja con el pipeline completo de FireSense (build → Trivy scan → push Harbor → helm deploy).
- **Valor curricular**: Jenkins es una de las herramientas CI/CD más demandadas en el mercado laboral. Su conocimiento es directamente transferible a entornos profesionales, a diferencia de Gitea Actions que es una herramienta más específica del self-hosting.
- **Separación de responsabilidades**: Mantener el CI/CD en Jenkins separado del repositorio (GitHub) sigue el principio de separación de responsabilidades y permite que el pipeline funcione independientemente de la disponibilidad del repositorio.

---

## Harbor vs Distribution (Docker Registry CNCF)

| Criterio | **Harbor** | Distribution (Docker Registry) |
|---|---|---|
| Licencia | Apache 2.0 | Apache 2.0 |
| Versión actual | 2.10.x | 3.x |
| Tipo | Registro empresarial completo | Registro básico minimalista |
| UI web | Sí, completa | No (solo API) |
| Escáner de vulnerabilidades | Trivy integrado nativamente | No incluido |
| Control de acceso (RBAC) | Sí, por proyecto y usuario | Básico (htpasswd) |
| Autenticación LDAP/OIDC | Sí | No nativo |
| Replicación entre registros | Sí | No |
| Firma de imágenes (Notary) | Sí | No nativo |
| Quotas por proyecto | Sí | No |
| Auditoría y logs | Sí | Básico |
| Consumo RAM | ~500 MB – 1 GB | ~20–50 MB |

### Justificación de elección: Harbor

- **Escáner Trivy integrado**: La propuesta de FireSense incluye expresamente el escaneig de vulnerabilitats como parte del pipeline de seguridad. Harbor incluye Trivy de forma nativa, lo que permite escanear cada imagen automáticamente antes de desplegarla en K8s, sin configurar integraciones adicionales.
- **Control de acceso por roles (RBAC)**: Harbor permite gestionar permisos por proyecto (por ejemplo, separar las imágenes del stack MING de las de la infraestructura), con usuarios y roles diferenciados. Docker Registry solo ofrece autenticación básica via htpasswd.
- **Integración LDAP**: Harbor soporta autenticación contra OpenLDAP de forma nativa, lo que encaja con la estrategia de directorio centralizado del proyecto. Docker Registry no tiene esta capacidad.
- **UI de gestión**: Harbor proporciona una interfaz web completa para gestionar imágenes, etiquetas, políticas de retención y resultados de escaneig. Docker Registry es puramente una API sin interfaz.
- **Valor técnico del proyecto**: Harbor es una herramienta de nivel empresarial, parte de la CNCF, usada en producción en organizaciones grandes. Su inclusión en FireSense demuestra un nivel de madurez técnica superior al de un registro básico.
- **Tradeoff de recursos**: El mayor consumo de RAM de Harbor (~500 MB–1 GB vs ~50 MB de Distribution) queda justificado por todas las funcionalidades adicionales que aporta al proyecto.
