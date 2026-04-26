# Comparativa: IoT y Mensajería

---

## ChirpStack vs The Things Stack (Open Source Edition)

| Criterio | **ChirpStack** | The Things Stack OSS |
|---|---|---|
| Licencia | MIT (totalmente libre) | Apache 2.0 (con restricciones en algunas features) |
| Versión actual | v4.x | v3.x |
| Soporte LoRaWAN | 1.0 y 1.1 | 1.0 y 1.1 |
| Documentación | Extensa, comunidad activa | Buena, pero orientada a su SaaS comercial |
| Despliegue en contenedores | Docker oficial, fácil | Docker oficial, más complejo |
| Dependencias | PostgreSQL + Redis | PostgreSQL + Redis + CockroachDB (opcional) |
| UI de gestión | Web UI incluida | Web UI incluida |
| Comunidad | Muy activa, foros propios | Activa, pero sesgada hacia la versión cloud |
| Multitenancy | Sí | Sí |
| Integración MQTT | Nativa | Nativa |

### Justificación de elección: ChirpStack

ChirpStack es la opción elegida por varios motivos objetivos:

- **Licencia MIT sin restricciones**: The Things Stack OSS limita algunas funcionalidades de su versión empresarial que solo están disponibles en su oferta cloud de pago. ChirpStack no tiene este tipo de limitaciones.
- **Menor complejidad de despliegue**: ChirpStack v4 funciona correctamente con PostgreSQL y Redis. The Things Stack puede requerir componentes adicionales como CockroachDB para algunas configuraciones.
- **Orientación al self-hosting**: ChirpStack está diseñado desde su origen para ser desplegado on-premises, lo que encaja perfectamente con la arquitectura local de FireSense sobre K8s e IsardVDI.
- **Integración directa con el stack MING**: La integración nativa con MQTT permite enviar datos directamente a Mosquitto sin configuraciones adicionales.

---

## Mosquitto vs EMQX

| Criterio | **Mosquitto** | EMQX |
|---|---|---|
| Licencia | EPL 2.0 / EDL 1.0 (open source) | Apache 2.0 (Community Edition) |
| Versión actual | 2.0.x | 5.x |
| Consumo RAM | < 5 MB | 200–500 MB mínimo |
| Escalabilidad | Limitada (single-node) | Alta (clúster distribuido) |
| Protocolos soportados | MQTT 3.1, 3.1.1, 5.0 | MQTT, MQTT-SN, CoAP, LwM2M, WebSocket |
| Persistencia de mensajes | Básica (fichero local) | Avanzada (base de datos integrada) |
| Dashboard web | No (solo config por fichero) | Sí, incluido |
| TLS/SSL | Sí | Sí |
| Auth | usuario/pass, TLS certs, plugins | Integración con BD, LDAP, JWT |
| Complejidad de configuración | Baja | Media-alta |

### Justificación de elección: Mosquitto

- **Consumo de recursos**: En un entorno con recursos limitados como IsardVDI, Mosquitto consume menos de 5 MB de RAM frente a los 200–500 MB mínimos de EMQX. Con 3 VMs compartidas entre todos los servicios del stack MING, esto es un factor determinante.
- **Simplicidad acorde al caso de uso**: FireSense maneja datos de un número reducido de nodos RAK WisBlock. EMQX está diseñado para escenarios con millones de conexiones simultáneas, lo cual es innecesario aquí.
- **Madurez y estabilidad**: Mosquitto es el broker MQTT de referencia, mantenido por la Eclipse Foundation, con más de una década de uso en producción en entornos IoT industriales.
- **Integración probada con Node-RED e InfluxDB**: El trio Mosquitto + Node-RED + InfluxDB es una combinación extremadamente documentada y estable.

---

## Node-RED vs Apache NiFi

| Criterio | **Node-RED** | Apache NiFi |
|---|---|---|
| Licencia | Apache 2.0 | Apache 2.0 |
| Versión actual | 3.1.x | 2.x |
| Consumo RAM | ~80–150 MB | 1–2 GB mínimo recomendado |
| Orientación | IoT, automatización de flujos ligeros | Big Data, flujos de datos empresariales |
| Interfaz visual | Sí, drag-and-drop simple | Sí, más compleja |
| Integración MQTT | Plugin nativo, 1 nodo | Processor disponible, más configuración |
| Integración InfluxDB | Plugin nativo | Disponible pero menos directo |
| Curva de aprendizaje | Baja | Alta |
| Soporte LDAP | Sí | Sí |
| Comunidad IoT | Muy grande | Menor en contexto IoT |

### Justificación de elección: Node-RED

- **Recursos**: Apache NiFi requiere un mínimo de 1–2 GB de RAM para funcionar de forma estable, lo que lo hace inviable en el contexto de las VMs de IsardVDI. Node-RED opera con menos de 150 MB.
- **Orientación al caso de uso**: NiFi está diseñado para pipelines de Big Data empresariales con provenance, clustering y alta disponibilidad. Node-RED está específicamente orientado a IoT y automatización de flujos ligeros, que es exactamente lo que FireSense necesita.
- **Ecosistema de plugins**: Node-RED dispone de plugins nativos para MQTT, InfluxDB, Telegram y alertas, lo que reduce el tiempo de integración considerablemente.
- **Programación visual accesible**: La curva de aprendizaje de Node-RED es significativamente menor, lo que permite al equipo centrarse en la lógica del proyecto en lugar de en la configuración de la herramienta.
