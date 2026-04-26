# Comparativa: Redes y Enrutamiento

---

## Nginx Ingress Controller vs Traefik

| Criterio | **Nginx Ingress Controller** | Traefik |
|---|---|---|
| Licencia | Apache 2.0 | MIT |
| Versión actual | 1.10.x | v3.x |
| Base tecnológica | Nginx (C) | Go |
| Madurez en K8s | Muy alta, Ingress de referencia | Alta, especialmente en K3s |
| Configuración | Annotations + ConfigMaps | CRDs propios (IngressRoute) + annotations |
| TLS automático (cert-manager) | Sí, muy documentado | Sí, también compatible |
| Rate limiting | Sí, nativo via annotations | Sí, via middlewares |
| Autenticación básica | Sí | Sí |
| Dashboard | No (requiere herramientas externas) | Sí, incluido |
| Rendimiento bajo alta carga | Muy alto (motor Nginx en C) | Alto (Go) |
| Documentación K8s | Extensa, es el Ingress por defecto en muchos guides | Buena |
| Por defecto en | kubeadm (no, hay que instalarlo) | K3s (incluido por defecto) |

### Justificación de elección: Nginx Ingress Controller

- **Estándar de referencia en K8s vanilla**: Al usar K8s con kubeadm (no K3s), no se incluye ningún Ingress Controller por defecto. Nginx Ingress Controller es el más documentado y utilizado en esta configuración, con guías oficiales de Kubernetes apuntando a él.
- **Madurez y estabilidad**: Nginx Ingress Controller lleva años siendo el controlador de referencia en Kubernetes. Su comportamiento con TLS, rate limiting y autenticación está ampliamente probado y documentado.
- **Integración con cert-manager**: La combinación Nginx Ingress + cert-manager para TLS automático es la configuración más documentada del ecosistema K8s, lo que facilita la implementación del TLS requerido por la propuesta.
- **Traefik y K3s**: Traefik es la opción natural cuando se usa K3s, porque viene incluido. Como FireSense usa K8s vanilla, instalar Traefik requiere la misma cantidad de trabajo que Nginx, sin ventaja adicional.
- **Rendimiento**: El motor de Nginx está escrito en C y tiene un rendimiento bajo alta carga superior al de Traefik (Go), aunque para el volumen de tráfico de FireSense ambos serían más que suficientes.

---

## CoreDNS vs PowerDNS

| Criterio | **CoreDNS** | PowerDNS |
|---|---|---|
| Licencia | Apache 2.0 | GPL 2.0 |
| Versión actual | 1.11.x | 4.x |
| Integración en K8s | Componente nativo del Control Plane | Externo, requiere configuración adicional |
| Función en K8s | Resolución DNS interna de servicios y pods | DNS de propósito general |
| Configuración | Corefile (simple) | Múltiples backends (MySQL, PostgreSQL...) |
| Consumo RAM | ~50–100 MB | ~100–200 MB |
| Plugins | Extensible via plugins en Go | Backends y módulos |
| Uso típico | DNS interno de K8s | DNS autoritativo de red empresarial |

### Justificación de elección: CoreDNS

- **Componente nativo de K8s**: CoreDNS es el servidor DNS que kubeadm instala automáticamente como parte del Control Plane de Kubernetes. No es una elección opcional en K8s vanilla: es el componente estándar para la resolución DNS interna del clúster (resolución de nombres de servicios como `grafana.monitoring.svc.cluster.local`).
- **Sin necesidad de configuración adicional**: Al ser un componente del clúster, CoreDNS ya está funcionando tras la instalación con kubeadm. PowerDNS es un servidor DNS de propósito general que requeriría configuración adicional sin aportar ventajas en el contexto de un clúster K8s.
- **Casos de uso distintos**: CoreDNS gestiona el DNS interno del clúster. PowerDNS está diseñado para ser un servidor DNS autoritativo de red con múltiples zonas y backends, algo que va más allá de las necesidades de FireSense.

---

## ISC DHCP vs Kea DHCP

| Criterio | **ISC DHCP** | Kea DHCP |
|---|---|---|
| Licencia | MPL 2.0 | Apache 2.0 |
| Versión actual | 4.4.x | 2.6.x |
| Estado | Mantenimiento (EoL previsto 2026) | Sucesor activo de ISC DHCP |
| Arquitectura | Monolítica | Modular, con API REST |
| Configuración | Fichero dhcpd.conf (texto plano) | JSON + base de datos opcional |
| Soporte IPv6 | Sí | Sí (mejor soporte) |
| Alta disponibilidad | Failover básico | HA nativo más moderno |
| Consumo RAM | ~20–50 MB | ~30–70 MB |
| Documentación | Extensa (décadas) | Buena y creciente |
| Curva de aprendizaje | Baja (muy conocido) | Media |

### Justificación de elección: ISC DHCP

- **Familiaridad y documentación**: ISC DHCP es el servidor DHCP más conocido en el mundo Linux/Unix, con décadas de documentación y ejemplos. En un proyecto de laboratorio educativo, la facilidad de configuración y la abundancia de documentación son factores clave.
- **Simplicidad para el caso de uso**: ISC DHCP se usa en FireSense únicamente para el segmento IoT (asignación de IPs al gateway LoRaWAN y nodos). Es una tarea simple que no requiere las capacidades avanzadas de Kea (API REST, base de datos, HA).
- **Nota**: ISC DHCP tiene previsto su End of Life en 2026 y la ISF recomienda migrar a Kea. Para un proyecto en producción a largo plazo, Kea sería la elección correcta. En el contexto de este proyecto académico, ISC DHCP es perfectamente válido y su configuración es más directa.
