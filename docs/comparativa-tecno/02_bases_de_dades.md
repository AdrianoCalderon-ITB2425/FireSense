# Comparativa: Bases de Dades i Gestió de Dades

---

## MongoDB vs CouchDB

| Criteri | **MongoDB** | CouchDB |
|---|---|---|
| Llicència | SSPL (Server Side Public License) | Apache 2.0 |
| Versió actual | 7.0.x | 3.x |
| Model de dades | Documents BSON (JSON binari) | Documents JSON |
| Consultes | MQL (MongoDB Query Language), molt potent | Mango Query o MapReduce, més limitat |
| Replicació | Replica Sets natius | Replicació multi-master nativa |
| Escalabilitat horitzontal | Sharding natiu | Limitada comparat amb MongoDB |
| Índexs | Molt complets (compostos, geoespacials, text) | Bàsics |
| Consum RAM | ~300–600 MB | ~100–200 MB |
| Ecosistema / drivers | Molt ampli (tots els llenguatges) | Més limitat |
| Comunitat | Molt gran | Petita |
| Cas d'ús principal | Aplicacions generals amb dades complexes | Sincronització offline, replicació distribuïda |

### Justificació de l'elecció: MongoDB

- **Ecosistema i documentació**: MongoDB és la base de dades documental més utilitzada del món, amb drivers oficials per a tots els llenguatges i una comunitat enormement activa. CouchDB té una comunitat considerablement més petita.
- **Capacitats de consulta**: MQL de MongoDB és significativament més potent i flexible que el sistema de consultes de CouchDB, cosa que facilita filtrar alertes, configuracions de sensors i metadades del sistema.
- **Integració amb el stack existent**: MongoDB té integració nativa i ben documentada amb Node-RED, cosa que redueix la complexitat de configuració.
- **Escalabilitat futura**: Tot i que per a aquest projecte el volum de dades és reduït, MongoDB ofereix sharding natiu si el projecte escalés, mentre que CouchDB té limitacions en aquest aspecte.
- **Nota important**: Com s'ha esmentat en la planificació del projecte, MongoDB és opcional a FireSense. Si totes les dades són sèries temporals de sensors, InfluxDB pot ser suficient. MongoDB només aportaria valor per guardar alertes històriques, configuracions de sensors i metadades no temporals.

---

## InfluxDB vs TimescaleDB

| Criteri | **InfluxDB** | TimescaleDB |
|---|---|---|
| Llicència | MIT (v1.8) / BSL 1.1 (v2.x+) | Apache 2.0 (Community) / Timescale License |
| Versió actual | 2.7.x / 1.8.x (LTS) | 2.x |
| Base tecnològica | Motor propi (TSM) | Extensió de PostgreSQL |
| Llenguatge de consulta | Flux (v2) / InfluxQL (v1) | SQL estàndard |
| Optimització per a sèries temporals | Nativa, motor dissenyat per a això | Molt bona, però heretada de PostgreSQL |
| Compressió de dades | Alta (motor TSM optimitzat) | Alta (compressió per chunks) |
| Consum RAM | ~200–500 MB | ~300–600 MB + overhead PostgreSQL |
| Integració amb Grafana | Plugin oficial, primera classe | Plugin oficial disponible |
| Integració amb Node-RED | Plugin natiu directe | Via connector PostgreSQL |
| Retention policies | Natives i simples | Disponibles (data retention policies) |
| Corba d'aprenentatge | Mitjana (Flux és nou) | Baixa si es coneix SQL |

### Justificació de l'elecció: InfluxDB

- **Disseny natiu per a sèries temporals**: InfluxDB va ser construït des de zero per emmagatzemar i consultar dades amb marca de temps (mètriques, lectures de sensors). TimescaleDB és una extensió excel·lent, però continua sent PostgreSQL amb funcions afegides, cosa que implica un overhead major en recursos.
- **Integració directa amb el stack MING**: La combinació Mosquitto → Node-RED → InfluxDB → Grafana és una arquitectura àmpliament documentada i provada. Existeix documentació específica per a aquest stack en projectes IoT industrials i acadèmics.
- **Retention policies simples**: InfluxDB té un sistema natiu de polítiques de retenció de dades (quant de temps guardar les lectures) que és trivial de configurar, cosa molt útil per gestionar l'espai en disc en un entorn de laboratori.
- **Versió 1.8 com a opció lleugera**: Per a entorns amb recursos limitats, InfluxDB v1.8 (encara mantinguda com a LTS) consumeix significativament menys recursos que la v2.x, oferint una opció de fallback si les VMs d'IsardVDI tenen limitacions.
- **Grafana datasource natiu**: El plugin oficial d'InfluxDB a Grafana és un dels més madurs i complets de la plataforma.
