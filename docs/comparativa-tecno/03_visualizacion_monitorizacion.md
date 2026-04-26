# Comparativa: Visualización y Monitorización

---

## Grafana vs Kibana

| Criterio | **Grafana** | Kibana |
|---|---|---|
| Licencia | AGPL 3.0 (OSS) | Elastic License 2.0 (no OSI) |
| Versión actual | 10.x / 11.x | 8.x |
| Dependencia de backend | Agnóstico (múltiples datasources) | Requiere Elasticsearch obligatoriamente |
| Datasources soportados | InfluxDB, Prometheus, MySQL, PostgreSQL, Loki, y más de 150 plugins | Principalmente Elasticsearch / OpenSearch |
| Alertas | Sistema propio completo (Grafana Alerting) | Sí, integrado con Elastic Stack |
| Consumo RAM | ~150–300 MB | ~500 MB – 1 GB (más Elasticsearch) |
| Autenticación LDAP | Sí, nativa | Sí, pero requiere licencia X-Pack |
| Dashboards como código | Sí (JSON exportable) | Sí |
| Orientación principal | Monitorización de métricas, IoT, infraestructura | Análisis de logs y búsqueda full-text |
| Comunidad | Muy grande, miles de dashboards públicos | Grande, orientada a Elastic Stack |

### Justificación de elección: Grafana

- **Independencia de datasource**: Grafana puede conectarse simultáneamente a InfluxDB (datos de sensores), Prometheus (métricas del clúster K8s) y otras fuentes. Kibana está diseñado exclusivamente para trabajar con Elasticsearch, lo que obligaría a replicar todos los datos en ese motor.
- **Licencia más abierta**: Kibana usa Elastic License 2.0, que no es una licencia open source reconocida por la OSI y restringe su uso en servicios gestionados. Grafana OSS usa AGPL 3.0, completamente libre.
- **Autenticación LDAP sin coste**: La integración LDAP de Kibana requiere la funcionalidad X-Pack, que en sus versiones más avanzadas implica licencia comercial. Grafana incluye integración LDAP nativa en su versión open source.
- **Dashboards comunitarios**: La comunidad de Grafana ha publicado miles de dashboards reutilizables en grafana.com/grafana/dashboards, incluyendo dashboards específicos para K8s, Node-RED, InfluxDB y Mosquitto que el equipo puede adaptar directamente.
- **Menor consumo de recursos**: Grafana solo requiere ~150–300 MB de RAM. Kibana necesita Elasticsearch como backend, lo que añade al menos 500 MB–1 GB adicionales.

---

## Prometheus vs Elasticsearch

| Criterio | **Prometheus** | Elasticsearch |
|---|---|---|
| Licencia | Apache 2.0 | Elastic License 2.0 (no OSI) |
| Versión actual | 2.x | 8.x |
| Caso de uso principal | Métricas de infraestructura y aplicaciones | Búsqueda full-text, análisis de logs |
| Modelo de datos | Series temporales (métricas con etiquetas) | Documentos JSON indexados |
| Método de recogida | Pull (scraping activo de endpoints) | Push (agentes Beats, Logstash) |
| Consumo RAM | ~200–400 MB | 1–2 GB mínimo recomendado |
| Integración con K8s | Nativa (kube-state-metrics, node-exporter) | Requiere configuración adicional |
| Integración con Grafana | Datasource oficial, primera clase | Datasource disponible |
| Alertas | Alertmanager nativo | Sí, con Elastic Stack |
| Escalabilidad | Thanos/Cortex para HA | Alta de forma nativa |

### Justificación de elección: Prometheus

- **Estándar de facto en Kubernetes**: Prometheus es la herramienta de monitorización de referencia en el ecosistema Kubernetes y CNCF. Existe integración nativa con kube-state-metrics y node-exporter para monitorizar el estado de los pods, nodos y recursos del clúster sin configuración adicional.
- **Modelo pull adecuado para K8s**: El modelo de scraping activo de Prometheus encaja perfectamente con la arquitectura de servicios de K8s, donde los endpoints son descubribles automáticamente via service discovery.
- **Recursos**: Elasticsearch requiere un mínimo de 1–2 GB de RAM para funcionar de forma estable, lo que lo hace inviable en el contexto de las VMs de IsardVDI. Prometheus opera correctamente con 200–400 MB.
- **Licencia Apache 2.0**: A diferencia de Elasticsearch (Elastic License 2.0), Prometheus es completamente open source y parte de la CNCF (Cloud Native Computing Foundation), la misma organización que mantiene Kubernetes y Harbor.
- **Casos de uso complementarios**: Prometheus se usa en FireSense específicamente para monitorizar la salud del clúster K8s (CPU, memoria, pods, nodos), mientras InfluxDB almacena los datos de sensores IoT. Son herramientas complementarias con casos de uso distintos, no sustitutos.
