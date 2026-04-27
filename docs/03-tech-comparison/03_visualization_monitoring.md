# Comparison: Visualization and Monitoring

---

## Grafana vs Kibana

| Criterion | **Grafana** | Kibana |
|---|---|---|
| License | AGPL 3.0 (OSS) | Elastic License 2.0 (non-OSI) |
| Current version | 10.x / 11.x | 8.x |
| Backend dependency | Agnostic (multiple datasources) | Strictly requires Elasticsearch |
| Supported datasources | InfluxDB, Prometheus, MySQL, PostgreSQL, Loki, and over 150 plugins | Primarily Elasticsearch / OpenSearch |
| Alerts | Complete built-in system (Grafana Alerting) | Yes, integrated with Elastic Stack |
| RAM consumption | ~150–300 MB | ~500 MB – 1 GB (plus Elasticsearch) |
| LDAP authentication | Yes, native | Yes, but requires X-Pack license |
| Dashboards as code | Yes (exportable JSON) | Yes |
| Primary focus | Metrics monitoring, IoT, infrastructure | Log analysis and full-text search |
| Community | Very large, thousands of public dashboards | Large, oriented towards Elastic Stack |

### Justification for the choice: Grafana

- **Datasource independence**: Grafana can simultaneously connect to InfluxDB (sensor data), Prometheus (K8s cluster metrics), and other sources. Kibana is exclusively designed to work with Elasticsearch, which would force all data to be replicated in that engine.
- **More open license**: Kibana uses Elastic License 2.0, which is not an OSI-recognized open-source license and restricts its use in managed services. Grafana OSS uses AGPL 3.0, which is completely free.
- **LDAP authentication at no cost**: Kibana's LDAP integration requires the X-Pack feature, which in its more advanced versions involves a commercial license. Grafana includes native LDAP integration in its open-source version.
- **Community dashboards**: The Grafana community has published thousands of reusable dashboards at grafana.com/grafana/dashboards, including specific dashboards for K8s, Node-RED, InfluxDB, and Mosquitto that the team can adapt directly.
- **Lower resource consumption**: Grafana only requires ~150–300 MB of RAM. Kibana needs Elasticsearch as a backend, which adds at least 500 MB–1 GB additionally.

---

## Prometheus vs Elasticsearch

| Criterion | **Prometheus** | Elasticsearch |
|---|---|---|
| License | Apache 2.0 | Elastic License 2.0 (non-OSI) |
| Current version | 2.x | 8.x |
| Main use case | Infrastructure and application metrics | Full-text search, log analysis |
| Data model | Time series (metrics with labels) | Indexed JSON documents |
| Collection method | Pull (active endpoint scraping) | Push (Beats agents, Logstash) |
| RAM consumption | ~200–400 MB | 1–2 GB recommended minimum |
| K8s integration | Native (kube-state-metrics, node-exporter) | Requires additional configuration |
| Grafana integration | Official datasource, first-class | Datasource available |
| Alerts | Native Alertmanager | Yes, with Elastic Stack |
| Scalability | Thanos/Cortex for HA | Natively high |

### Justification for the choice: Prometheus

- **De facto standard in Kubernetes**: Prometheus is the reference monitoring tool in the Kubernetes and CNCF ecosystem. There is native integration with kube-state-metrics and node-exporter to monitor the status of pods, nodes, and cluster resources without additional configuration.
- **Pull model suitable for K8s**: Prometheus's active scraping model fits perfectly with the K8s service architecture, where endpoints are automatically discoverable via service discovery.
- **Resources**: Elasticsearch requires a minimum of 1–2 GB of RAM to operate stably, making it unfeasible in the context of IsardVDI VMs. Prometheus operates correctly with 200–400 MB.
- **Apache 2.0 License**: Unlike Elasticsearch (Elastic License 2.0), Prometheus is completely open source and is part of the CNCF (Cloud Native Computing Foundation), the same organization that maintains Kubernetes and Harbor.
- **Complementary use cases**: Prometheus is used in FireSense specifically to monitor K8s cluster health (CPU, memory, pods, nodes), while InfluxDB stores IoT sensor data. They are complementary tools with different use cases, not substitutes.