# Comparativa: Visualització i Monitorització

---

## Grafana vs Kibana

| Criteri | **Grafana** | Kibana |
|---|---|---|
| Llicència | AGPL 3.0 (OSS) | Elastic License 2.0 (no OSI) |
| Versió actual | 10.x / 11.x | 8.x |
| Dependència de backend | Agnòstic (múltiples datasources) | Requereix Elasticsearch obligatòriament |
| Datasources suportats | InfluxDB, Prometheus, MySQL, PostgreSQL, Loki, i més de 150 plugins | Principalment Elasticsearch / OpenSearch |
| Alertes | Sistema propi complet (Grafana Alerting) | Sí, integrat amb Elastic Stack |
| Consum RAM | ~150–300 MB | ~500 MB – 1 GB (més Elasticsearch) |
| Autenticació LDAP | Sí, nativa | Sí, però requereix llicència X-Pack |
| Dashboards com a codi | Sí (JSON exportable) | Sí |
| Orientació principal | Monitorització de mètriques, IoT, infraestructura | Anàlisi de logs i cerca full-text |
| Comunitat | Molt gran, milers de dashboards públics | Gran, orientada a Elastic Stack |

### Justificació de l'elecció: Grafana

- **Independència de datasource**: Grafana pot connectar-se simultàniament a InfluxDB (dades de sensors), Prometheus (mètriques del clúster K8s) i altres fonts. Kibana està dissenyat exclusivament per treballar amb Elasticsearch, cosa que obligaria a replicar totes les dades en aquest motor.
- **Llicència més oberta**: Kibana usa Elastic License 2.0, que no és una llicència open source reconeguda per la OSI i restringeix el seu ús en serveis gestionats. Grafana OSS usa AGPL 3.0, completament lliure.
- **Autenticació LDAP sense cost**: La integració LDAP de Kibana requereix la funcionalitat X-Pack, que en les seves versions més avançades implica llicència comercial. Grafana inclou integració LDAP nativa a la seva versió open source.
- **Dashboards comunitaris**: La comunitat de Grafana ha publicat milers de dashboards reutilitzables a grafana.com/grafana/dashboards, incloent dashboards específics per a K8s, Node-RED, InfluxDB i Mosquitto que l'equip pot adaptar directament.
- **Menor consum de recursos**: Grafana només requereix ~150–300 MB de RAM. Kibana necessita Elasticsearch com a backend, cosa que afegeix almenys 500 MB–1 GB addicionals.

---

## Prometheus vs Elasticsearch

| Criteri | **Prometheus** | Elasticsearch |
|---|---|---|
| Llicència | Apache 2.0 | Elastic License 2.0 (no OSI) |
| Versió actual | 2.x | 8.x |
| Cas d'ús principal | Mètriques d'infraestructura i aplicacions | Cerca full-text, anàlisi de logs |
| Model de dades | Sèries temporals (mètriques amb etiquetes) | Documents JSON indexats |
| Mètode de recollida | Pull (scraping actiu d'endpoints) | Push (agents Beats, Logstash) |
| Consum RAM | ~200–400 MB | 1–2 GB mínim recomanat |
| Integració amb K8s | Nativa (kube-state-metrics, node-exporter) | Requereix configuració addicional |
| Integració amb Grafana | Datasource oficial, primera classe | Datasource disponible |
| Alertes | Alertmanager natiu | Sí, amb Elastic Stack |
| Escalabilitat | Thanos/Cortex per a HA | Alta de forma nativa |

### Justificació de l'elecció: Prometheus

- **Estàndard de facto a Kubernetes**: Prometheus és l'eina de monitorització de referència a l'ecosistema Kubernetes i CNCF. Existeix integració nativa amb kube-state-metrics i node-exporter per monitoritzar l'estat dels pods, nodes i recursos del clúster sense configuració addicional.
- **Model pull adequat per a K8s**: El model de scraping actiu de Prometheus encaixa perfectament amb l'arquitectura de serveis de K8s, on els endpoints són descobribles automàticament via service discovery.
- **Recursos**: Elasticsearch requereix un mínim d'1–2 GB de RAM per funcionar de forma estable, cosa que el fa inviable en el context de les VMs d'IsardVDI. Prometheus opera correctament amb 200–400 MB.
- **Llicència Apache 2.0**: A diferència d'Elasticsearch (Elastic License 2.0), Prometheus és completament open source i forma part de la CNCF (Cloud Native Computing Foundation), la mateixa organització que manté Kubernetes i Harbor.
- **Casos d'ús complementaris**: Prometheus s'utilitza a FireSense específicament per monitoritzar la salut del clúster K8s (CPU, memòria, pods, nodes), mentre InfluxDB emmagatzema les dades de sensors IoT. Són eines complementàries amb casos d'ús diferents, no substituts.
