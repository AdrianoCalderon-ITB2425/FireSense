# Comparison: IoT and Messaging

---

## ChirpStack vs The Things Stack (Open Source Edition)

| Criterion | **ChirpStack** | The Things Stack OSS |
|---|---|---|
| License | MIT (completely free) | Apache 2.0 (with restrictions on some features) |
| Current version | v4.x | v3.x |
| LoRaWAN Support | 1.0 and 1.1 | 1.0 and 1.1 |
| Documentation | Extensive, active community | Good, but oriented towards its commercial SaaS |
| Container deployment | Official Docker, easy | Official Docker, more complex |
| Dependencies | PostgreSQL + Redis | PostgreSQL + Redis + CockroachDB (optional) |
| Management UI | Web UI included | Web UI included |
| Community | Very active, own forums | Active, but biased towards the cloud version |
| Multitenancy | Yes | Yes |
| MQTT Integration | Native | Native |

### Justification for the choice: ChirpStack

ChirpStack is the chosen option for several objective reasons:

- **Unrestricted MIT License**: The Things Stack OSS limits some features of its enterprise version that are only available in its paid cloud offering. ChirpStack does not have these types of limitations.
- **Lower deployment complexity**: ChirpStack v4 works correctly with PostgreSQL and Redis. The Things Stack may require additional components like CockroachDB for some configurations.
- **Self-hosting orientation**: ChirpStack is designed from its origin to be deployed on-premises, which fits perfectly with the local architecture of FireSense on K8s and IsardVDI.
- **Direct integration with the MING stack**: Native integration with MQTT allows sending data directly to Mosquitto without additional configuration.

---

## Mosquitto vs EMQX

| Criterion | **Mosquitto** | EMQX |
|---|---|---|
| License | EPL 2.0 / EDL 1.0 (open source) | Apache 2.0 (Community Edition) |
| Current version | 2.0.x | 5.x |
| RAM Consumption | < 5 MB | 200–500 MB minimum |
| Scalability | Limited (single-node) | High (distributed cluster) |
| Supported protocols | MQTT 3.1, 3.1.1, 5.0 | MQTT, MQTT-SN, CoAP, LwM2M, WebSocket |
| Message persistence | Basic (local file) | Advanced (integrated database) |
| Web dashboard | No (file config only) | Yes, included |
| TLS/SSL | Yes | Yes |
| Auth | user/password, TLS certs, plugins | DB integration, LDAP, JWT |
| Configuration complexity | Low | Medium-high |

### Justification for the choice: Mosquitto

- **Resource consumption**: In an environment with limited resources like IsardVDI, Mosquitto consumes less than 5 MB of RAM compared to the minimum 200–500 MB of EMQX. With 3 VMs shared among all MING stack services, this is a determining factor.
- **Simplicity according to the use case**: FireSense manages data from a small number of RAK WisBlock nodes. EMQX is designed for scenarios with millions of concurrent connections, which is unnecessary here.
- **Maturity and stability**: Mosquitto is the reference MQTT broker, maintained by the Eclipse Foundation, with more than a decade of production use in industrial IoT environments.
- **Proven integration with Node-RED and InfluxDB**: The Mosquitto + Node-RED + InfluxDB trio is an extremely documented and stable combination.

---

## Node-RED vs Apache NiFi

| Criterion | **Node-RED** | Apache NiFi |
|---|---|---|
| License | Apache 2.0 | Apache 2.0 |
| Current version | 3.1.x | 2.x |
| RAM Consumption | ~80–150 MB | 1–2 GB recommended minimum |
| Orientation | IoT, lightweight flow automation | Big Data, enterprise data flows |
| Visual interface | Yes, simple drag-and-drop | Yes, more complex |
| MQTT Integration | Native plugin, 1 node | Processor available, more configuration |
| InfluxDB Integration | Native plugin | Available but less direct |
| Learning curve | Low | High |
| LDAP Support | Yes | Yes |
| IoT Community | Very large | Smaller in IoT context |

### Justification for the choice: Node-RED

- **Resources**: Apache NiFi requires a minimum of 1–2 GB of RAM to operate stably, making it unfeasible in the context of IsardVDI VMs. Node-RED operates with less than 150 MB.
- **Orientation to the use case**: NiFi is designed for enterprise Big Data pipelines with provenance, clustering, and high availability. Node-RED is specifically aimed at IoT and lightweight flow automation, which is exactly what FireSense needs.
- **Plugin ecosystem**: Node-RED has native plugins for MQTT, InfluxDB, Telegram, and alerts, which considerably reduces integration time.
- **Accessible visual programming**: The learning curve of Node-RED is significantly lower, allowing the team to focus on the project's logic rather than the tool's configuration.