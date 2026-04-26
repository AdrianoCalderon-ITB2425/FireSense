# Comparativa: IoT i Missatgeria

---

## ChirpStack vs The Things Stack (Open Source Edition)

| Criteri | **ChirpStack** | The Things Stack OSS |
|---|---|---|
| Llicència | MIT (totalment lliure) | Apache 2.0 (amb restriccions en algunes features) |
| Versió actual | v4.x | v3.x |
| Suport LoRaWAN | 1.0 i 1.1 | 1.0 i 1.1 |
| Documentació | Extensa, comunitat activa | Bona, però orientada al seu SaaS comercial |
| Desplegament en contenidors | Docker oficial, fàcil | Docker oficial, més complex |
| Dependències | PostgreSQL + Redis | PostgreSQL + Redis + CockroachDB (opcional) |
| UI de gestió | Web UI inclosa | Web UI inclosa |
| Comunitat | Molt activa, fòrums propis | Activa, però esbiaixada cap a la versió cloud |
| Multitenancy | Sí | Sí |
| Integració MQTT | Nativa | Nativa |

### Justificació de l'elecció: ChirpStack

ChirpStack és l'opció escollida per diversos motius objectius:

- **Llicència MIT sense restriccions**: The Things Stack OSS limita algunes funcionalitats de la seva versió empresarial que només estan disponibles a la seva oferta cloud de pagament. ChirpStack no té aquest tipus de limitacions.
- **Menor complexitat de desplegament**: ChirpStack v4 funciona correctament amb PostgreSQL i Redis. The Things Stack pot requerir components addicionals com CockroachDB per a algunes configuracions.
- **Orientació al self-hosting**: ChirpStack està dissenyat des del seu origen per ser desplegat on-premises, cosa que encaixa perfectament amb l'arquitectura local de FireSense sobre K8s i IsardVDI.
- **Integració directa amb el stack MING**: La integració nativa amb MQTT permet enviar dades directament a Mosquitto sense configuracions addicionals.

---

## Mosquitto vs EMQX

| Criteri | **Mosquitto** | EMQX |
|---|---|---|
| Llicència | EPL 2.0 / EDL 1.0 (open source) | Apache 2.0 (Community Edition) |
| Versió actual | 2.0.x | 5.x |
| Consum RAM | < 5 MB | 200–500 MB mínim |
| Escalabilitat | Limitada (single-node) | Alta (clúster distribuït) |
| Protocols suportats | MQTT 3.1, 3.1.1, 5.0 | MQTT, MQTT-SN, CoAP, LwM2M, WebSocket |
| Persistència de missatges | Bàsica (fitxer local) | Avançada (base de dades integrada) |
| Dashboard web | No (només config per fitxer) | Sí, inclòs |
| TLS/SSL | Sí | Sí |
| Auth | usuari/contrasenya, TLS certs, plugins | Integració amb BD, LDAP, JWT |
| Complexitat de configuració | Baixa | Mitjana-alta |

### Justificació de l'elecció: Mosquitto

- **Consum de recursos**: En un entorn amb recursos limitats com IsardVDI, Mosquitto consumeix menys de 5 MB de RAM enfront dels 200–500 MB mínims d'EMQX. Amb 3 VMs compartides entre tots els serveis del stack MING, aquest és un factor determinant.
- **Simplicitat d'acord amb el cas d'ús**: FireSense gestiona dades d'un nombre reduït de nodes RAK WisBlock. EMQX està dissenyat per a escenaris amb milions de connexions simultànies, cosa que és innecessària aquí.
- **Maduresa i estabilitat**: Mosquitto és el broker MQTT de referència, mantingut per la Eclipse Foundation, amb més d'una dècada d'ús en producció en entorns IoT industrials.
- **Integració provada amb Node-RED i InfluxDB**: El trio Mosquitto + Node-RED + InfluxDB és una combinació extremadament documentada i estable.

---

## Node-RED vs Apache NiFi

| Criteri | **Node-RED** | Apache NiFi |
|---|---|---|
| Llicència | Apache 2.0 | Apache 2.0 |
| Versió actual | 3.1.x | 2.x |
| Consum RAM | ~80–150 MB | 1–2 GB mínim recomanat |
| Orientació | IoT, automatització de fluxos lleugers | Big Data, fluxos de dades empresarials |
| Interfície visual | Sí, drag-and-drop simple | Sí, més complexa |
| Integració MQTT | Plugin natiu, 1 node | Processor disponible, més configuració |
| Integració InfluxDB | Plugin natiu | Disponible però menys directe |
| Corba d'aprenentatge | Baixa | Alta |
| Suport LDAP | Sí | Sí |
| Comunitat IoT | Molt gran | Menor en context IoT |

### Justificació de l'elecció: Node-RED

- **Recursos**: Apache NiFi requereix un mínim d'1–2 GB de RAM per funcionar de forma estable, cosa que el fa inviable en el context de les VMs d'IsardVDI. Node-RED opera amb menys de 150 MB.
- **Orientació al cas d'ús**: NiFi està dissenyat per a pipelines de Big Data empresarials amb provenance, clustering i alta disponibilitat. Node-RED està específicament orientat a IoT i automatització de fluxos lleugers, que és exactament el que FireSense necessita.
- **Ecosistema de plugins**: Node-RED disposa de plugins natius per a MQTT, InfluxDB, Telegram i alertes, cosa que redueix considerablement el temps d'integració.
- **Programació visual accessible**: La corba d'aprenentatge de Node-RED és significativament menor, cosa que permet a l'equip centrar-se en la lògica del projecte en lloc de la configuració de l'eina.
