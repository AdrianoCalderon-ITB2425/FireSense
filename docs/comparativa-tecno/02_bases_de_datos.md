# Comparativa: Bases de Datos y Gestión de Datos

---

## MongoDB vs CouchDB

| Criterio | **MongoDB** | CouchDB |
|---|---|---|
| Licencia | SSPL (Server Side Public License) | Apache 2.0 |
| Versión actual | 7.0.x | 3.x |
| Modelo de datos | Documentos BSON (JSON binario) | Documentos JSON |
| Consultas | MQL (MongoDB Query Language), muy potente | Mango Query o MapReduce, más limitado |
| Replicación | Replica Sets nativos | Replicación multi-master nativa |
| Escalabilidad horizontal | Sharding nativo | Limitada comparado con MongoDB |
| Índices | Muy completos (compuestos, geoespaciales, texto) | Básicos |
| Consumo RAM | ~300–600 MB | ~100–200 MB |
| Ecosistema / drivers | Muy amplio (todos los lenguajes) | Más limitado |
| Comunidad | Muy grande | Pequeña |
| Caso de uso principal | Aplicaciones generales con datos complejos | Sincronización offline, replicación distribuida |

### Justificación de elección: MongoDB

- **Ecosistema y documentación**: MongoDB es la base de datos documental más utilizada del mundo, con drivers oficiales para todos los lenguajes y una comunidad enormemente activa. CouchDB tiene una comunidad considerablemente más pequeña.
- **Capacidades de consulta**: MQL de MongoDB es significativamente más potente y flexible que el sistema de consultas de CouchDB, lo que facilita filtrar alertas, configuraciones de sensores y metadatos del sistema.
- **Integración con el stack existente**: MongoDB tiene integración nativa y bien documentada con Node-RED, lo que reduce la complejidad de configuración.
- **Escalabilidad futura**: Aunque para este proyecto el volumen de datos es reducido, MongoDB ofrece sharding nativo si el proyecto escalara, mientras CouchDB tiene limitaciones en este aspecto.
- **Nota importante**: Como se ha mencionado en la planificación del proyecto, MongoDB es opcional en FireSense. Si todos los datos son series temporales de sensores, InfluxDB puede ser suficiente. MongoDB solo aportaría valor para guardar alertas históricas, configuraciones de sensores y metadatos no temporales.

---

## InfluxDB vs TimescaleDB

| Criterio | **InfluxDB** | TimescaleDB |
|---|---|---|
| Licencia | MIT (v1.8) / BSL 1.1 (v2.x+) | Apache 2.0 (Community) / Timescale License |
| Versión actual | 2.7.x / 1.8.x (LTS) | 2.x |
| Base tecnológica | Motor propio (TSM) | Extensión de PostgreSQL |
| Lenguaje de consulta | Flux (v2) / InfluxQL (v1) | SQL estándar |
| Optimización para series temporales | Nativa, motor diseñado para ello | Muy buena, pero heredada de PostgreSQL |
| Compresión de datos | Alta (motor TSM optimizado) | Alta (compresión por chunks) |
| Consumo RAM | ~200–500 MB | ~300–600 MB + overhead PostgreSQL |
| Integración con Grafana | Plugin oficial, primera clase | Plugin oficial disponible |
| Integración con Node-RED | Plugin nativo directo | Via PostgreSQL connector |
| Retention policies | Nativas y simples | Disponibles (data retention policies) |
| Curva de aprendizaje | Media (Flux es nuevo) | Baja si se conoce SQL |

### Justificación de elección: InfluxDB

- **Diseño nativo para series temporales**: InfluxDB fue construido desde cero para almacenar y consultar datos con marca de tiempo (métricas, lecturas de sensores). TimescaleDB es una extensión excelente, pero sigue siendo PostgreSQL con funciones añadidas, lo que implica mayor overhead en recursos.
- **Integración directa con el stack MING**: La combinación Mosquitto → Node-RED → InfluxDB → Grafana es una arquitectura ampliamente documentada y probada. Existe documentación específica para este stack en proyectos IoT industriales y académicos.
- **Retention policies simples**: InfluxDB tiene un sistema nativo de políticas de retención de datos (cuánto tiempo guardar las lecturas) que es trivial de configurar, algo muy útil para gestionar el espacio en disco en un entorno de laboratorio.
- **Versión 1.8 como opción ligera**: Para entornos con recursos limitados, InfluxDB v1.8 (aún mantenida como LTS) consume significativamente menos recursos que la v2.x, ofreciendo una opción de fallback si las VMs de IsardVDI tienen limitaciones.
- **Grafana datasource nativo**: El plugin oficial de InfluxDB en Grafana es uno de los más maduros y completos de la plataforma.
