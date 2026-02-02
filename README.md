# ProjecteEspVRna_IOTs

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![ESP32](https://img.shields.io/badge/Hardware-ESP32-blue.svg)](https://www.espressif.com/en/products/socs/esp32)
[![Meshtastic](https://img.shields.io/badge/Network-Meshtastic-green.svg)](https://meshtastic.org/)

Repositori dels prototips de sensors i nodes Meshtastic per al **Projecte EspVRna** - Sistema IoT de prevenció d'incendis forestals per al Parc Natural de Collserola.

## Descripció del Projecte

EspVRna és un sistema integral de detecció i prevenció d'incendis forestals que combina tecnologies IoT avançades per monitoritzar zones boscoses en temps real. El projecte utilitza una xarxa mesh de sensors distribuïts per detectar moviment, temperatura i altres indicadors d'incendis potencials.

### Objectius Principals

- Detecció primerenca d'incendis forestals
- Xarxa mesh descentralitzada per comunicació fiable
- Integració amb plataforma cloud per anàlisi de dades
- Dashboard en temps real per visualització de dades
- Solució autònoma amb energia solar

## Característiques Principals

- **Detecció de Moviment:** Sensors PIR per detectar presència humana o animal
- **Xarxa Mesh:** Comunicació LoRaWAN i Meshtastic per cobertura extensa
- **Monitorització Cloud:** Integració amb AWS IoT Core
- **Dashboard Web:** Visualització en temps real de l'estat dels sensors
- **Alimentació Solar:** Panells solars mini i bateries per autonomia energètica
- **Baix Consum:** Optimitzat per funcionar amb recursos limitats

## Tecnologies Utilitzades

# Integració Sensor BME280 amb Heltec V4
## Sistema de Predicció de Risc d'Incendis - Parc Natural de Collserola

---

## Resum Executiu

Integració exitosa del sensor ambiental BME280 en un node Heltec WiFi LoRa 32 V4 (ESP32-S3) per al sistema de monitoratge i predicció de risc d'incendis del Parc Natural de Collserola. El sensor proporciona mesures crítiques de temperatura ambient, humitat relativa i pressió atmosfèrica en temps real a través de xarxa mesh LoRa utilitzant firmware Meshtastic.

**Estat:** Sistema completament operatiu  
**Data finalització:** 3 febrer 2026  
**Temps total desenvolupament:** 5 hores 15 minuts  
**Mètriques operatives:** 3 (temperatura, humitat, pressió)  
**Interval transmissió:** 1800 segons (30 minuts)

---

## Taula de Continguts

- [Context del Projecte](#context-del-projecte)
- [Repte Tècnic](#repte-tècnic)
- [Investigació](#investigació)
- [Solució Implementada](#solució-implementada)
- [Diagnòstic i Resolució](#diagnòstic-i-resolució)
- [Resultats](#resultats)
- [Validació Sistema](#validació-sistema)
- [Especificacions Tècniques](#especificacions-tècniques)
- [Estat del Projecte](#estat-del-projecte)
- [Referències](#referències)
- [Aprenentatges](#aprenentatges)
- [Autoria](#autoria)

---

## Context del Projecte

### Objectiu General
Desenvolupament d'un sistema IoT de monitoratge ambiental per predicció proactiva de risc d'incendis forestals al Parc Natural de Collserola, en col·laboració amb els Bombers de la Generalitat de Catalunya.

### Requisits Bombers (Reunió 12/12/2025)
1. Humitat del sòl (prioritat màxima)
2. Temperatura ambient  
3. Humitat relativa de l'aire (a 2 metres alçada)

### Arquitectura Sistema
- **Nodes sensors:** Heltec V4 amb sensors ambientals
- **Xarxa:** LoRa mesh (Meshtastic)
- **Cobertura:** 10 km per node sense infraestructura
- **Gateway:** Publicació MQTT a servidor Nuvulet-CPD ITB
- **Autonomia:** 2-4 setmanes (bateria) / Infinita (placa solar futura)

---

## Repte Tècnic

### Problema Inicial
El sensor BME280 subministrat pel professorat necessitava integració amb el node Heltec V4, però la placa no exposa clarament els pins I2C als headers estàndard. La documentació oficial sobre configuració I2C en aquesta versió específica és limitada.

### Intents No Funcionals

#### Intent 1: GPIO 41/42
```
Connexió: BME280 → GPIO 41 (SDA) / GPIO 42 (SCL)
Resultat: Pantalla OLED distorsionada
Causa: Pins interns, no accessibles als headers
```

#### Intent 2: GPIO 33/47  
```
Connexió: BME280 → GPIO 33 (SDA) / GPIO 47 (SCL)
Resultat: Sensor no detectat
Causa: Bus I2C no inicialitzat per aquests pins
```

---

## Investigació

### Recerca Repositoris Oficials

Anàlisi del repositori oficial de firmware Meshtastic va revelar una limitació crítica documentada:

**Font:** [Meshtastic Firmware Repository](https://github.com/meshtastic/firmware)  
**Issue identificat:** #8417 - "Activate Secondary I2C bus on Heltec V4"  
**URL:** https://github.com/meshtastic/firmware/issues/8417

#### Cita textual de l'Issue:
> "It appears there was initial work done to have a secondary i2c bus added to pins 3+4 on the Heltec V4 however currently only the one used for the screen (17+18) is active."

### Conclusions Investigació

1. **Pins I2C actius:** Només GPIO 17 (SDA) i GPIO 18 (SCL)
2. **Bus secundari:** GPIO 3/4 definit en codi però NO implementat en firmware
3. **Implicació:** Qualsevol sensor I2C extern ha de compartir bus amb pantalla OLED integrada
4. **Estat issue:** Obert des d'octubre 2025 (5 reaccions confirmant problema)

### Comparació amb Heltec V3

Anàlisi del fitxer `variant.h` de Heltec V3 confirma que versions anteriors SÍ tenen bus secundari:

**Font:** [variants/heltec_v3/variant.h](https://github.com/meshtastic/firmware/blob/master/variants/heltec_v3/variant.h)

```c
// Heltec V3 - Bus primari
#define I2C_SDA SDA_OLED
#define I2C_SCL SCL_OLED

// Heltec V3 - Bus secundari (DISPONIBLE)
#define I2C_SDA1 SDA
#define I2C_SCL1 SCL
```

**Conclusió:** Heltec V4 representa una regressió respecte V3 en disponibilitat de bus I2C.

---

## Solució Implementada

### Disseny Hardware

Connexió del sensor BME280 en paral·lel amb la pantalla OLED utilitzant el bus I2C compartit.

```
Sensor BME280          Heltec V4
─────────────          ─────────
VIN (Alimentació)  →   3.3V
GND (Terra)        →   GND
SDA (Dades)        →   GPIO 17 (compartit amb OLED)
SCL (Rellotge)     →   GPIO 18 (compartit amb OLED)
```

### Justificació Tècnica

#### Protocol I2C
El protocol I2C (Inter-Integrated Circuit) permet múltiples dispositius esclaus al mateix bus de comunicació. Cada dispositiu s'identifica per una adreça única de 7 bits, permetent fins a 127 dispositius teòrics (128 adreces - 1 reservada).

#### Assignació Adreces
- **OLED SSD1306:** Adreça 0x3C (60 decimal)
- **BME280:** Adreça 0x76 (118 decimal)

**No hi ha conflicte:** Les adreces són diferents, permetent comunicació multiplexada sense interferències.

#### Avantatges Connexió Paral·lel
1. Aprofita bus I2C ja actiu i configurat
2. No requereix modificació firmware
3. Manté funcionalitat pantalla OLED
4. Solució estable i testada en altres projectes

### Implementació Física

**Procés de soldadura:**
1. Preparació superfícies amb flux
2. Soldadura de 4 conductors (AWG 24-26)
3. Verificació continuïtat amb multímetre digital
4. Test funcional OLED (no degradació)
5. Comprovació LED alimentació BME280 (actiu)

**Eines utilitzades:**
- Estació de soldadura regulable (300-350°C)
- Estany 60/40 amb flux integrat
- Multímetre digital (mode continuïtat)
- Lupa d'augment per inspecció visual

---

## Diagnòstic i Resolució

### Problema: Telemetria No Visible

#### Símptoma Observat
Després de connexió física correcta del sensor, execució de comanda diagnòstica no mostrava dades ambientals:

```bash
meshtastic --info
```

**Output observat:**
```
deviceMetrics: {
  batteryLevel: 101
  voltage: 4.306
  channelUtilization: 0.0
  airUtilTx: 0.043555554
  uptimeSeconds: 307
}

# environmentMetrics: ABSENT
```

#### Anàlisi Causa Arrel

Inspecció de configuració de telemetria:

```bash
meshtastic --get telemetry
```

**Configuració detectada:**
```
telemetry.environment_measurement_enabled: True
telemetry.environment_update_interval: 1800
telemetry.environment_screen_enabled: True
```

**Identificació problema:**  
- Interval actualització: 1800 segons = 30 minuts
- Primera lectura sensor: 30 minuts POST-arrencada
- Temps espera insuficient durant validació inicial

**Conclusió:** No és un error de hardware ni software, sinó una qüestió de timing del sistema.

### Comportament Firmware Meshtastic

Segons documentació oficial (https://meshtastic.org/docs/configuration/module/telemetry/):

> "How often we should send Environment(Sensor) Metrics over the mesh. Default is 1800 seconds (30 minutes)."

El firmware Meshtastic no llegeix el sensor immediatament a l'arrencada. El comportament és:

1. **T+0 min:** Sistema arrenca, inicialitza perifèrics
2. **T+0 a T+30 min:** Sensor detectat però NO llegit
3. **T+30 min:** Primera lectura i transmissió telemetria
4. **T+60 min, T+90 min...:** Lectures subsegüents cada 30 min

### IMPORTANT: Limitacions Configuració Interval

**ADVERTÈNCIA CRÍTICA:** Malgrat que la documentació oficial indica que l'interval de telemetria es pot modificar amb comandes CLI, en la pràctica el firmware NO ACCEPTA modificacions de l'interval per defecte.

**Proves realitzades que NO funcionen:**
```bash
# AQUESTA COMANDA NO TÉ EFECTE REAL
meshtastic --set telemetry.environment_update_interval 60
meshtastic --set telemetry.environment_update_interval 300

# Després de reboot, la configuració torna a 1800 segons
```

**Evidència documentada:**
- **GitHub Issue #6263:** "Although I set the Environment Metrics Update Interval to 30 seconds in the Meshtastic app, after reconnecting the device the interval still shows as 1800 seconds"
- **URL:** https://github.com/meshtastic/firmware/issues/6263
- **Estat:** Comportament confirmat per múltiples usuaris

**Comportament real del firmware:**
El firmware Meshtastic manté l'interval fixat en **1800 segons (30 minuts)** independentment dels intents de modificació via CLI, app mòbil o configuració YAML. Aquest és un comportament de disseny per evitar saturació de la xarxa mesh.

**Solució que funciona:**
L'única configuració efectiva és verificar que el mòdul de telemetria està habilitat:

```bash
meshtastic --get telemetry
```

**Output esperat:**
```
telemetry.environment_measurement_enabled: True
telemetry.environment_update_interval: 1800
telemetry.environment_screen_enabled: True
```

**Conclusió:** Mantenir interval per defecte (1800s) és l'única opció funcional en firmware actual.

### Procés de Validació Real

**Pas 1: Verificació configuració telemetria**

Després de connexió física del sensor, primera acció va ser comprovar estat mòdul telemetria:

```bash
meshtastic --get telemetry
```

**Output obtingut:**
```
telemetry.device_update_interval: 1800
telemetry.environment_measurement_enabled: True
telemetry.environment_update_interval: 1800
telemetry.environment_screen_enabled: True
telemetry.environment_display_fahrenheit: False
```

**Diagnòstic inicial:**
- Mòdul telemetria: **HABILITAT** (environment_measurement_enabled: True)
- Interval actualització: **1800 segons** (30 minuts)
- Visualització pantalla: **HABILITADA**

**Pas 2: Test immediat (INCORRECTE)**

Primer intent de validació:

```bash
meshtastic --info
```

**Resultat (T+2 minuts):**
```
deviceMetrics: {
  batteryLevel: 101
  voltage: 4.306
  channelUtilization: 0.0
  airUtilTx: 0.043555554
  uptimeSeconds: 307
}

# environmentMetrics: NO PRESENT
```

**Error comès:** Assumir problema de hardware sense considerar timing.

**Pas 3: Anàlisi causa arrel**

**Pregunta clau:** Per què deviceMetrics apareix però environmentMetrics no?

**Resposta:** `deviceMetrics` s'envia sempre cada minut a client connectat (documentació oficial), però `environmentMetrics` només es llegeix/transmet segons `environment_update_interval`.

**Càlcul temporal:**
- Temps arrencada: T+0 min
- Primera lectura sensor: T+30 min (1800 segons)
- Temps esperat inicial: 2 minuts
- **Error:** Insuficient temps espera

**Pas 4: Validació després 30 minuts**

```bash
meshtastic --info
```

**Resultat (T+32 minuts):**
```
environmentMetrics: {
  temperature: 22.5
  relativeHumidity: 65.3
  barometricPressure: 1013.2
  uptimeSeconds: 1920
}

deviceMetrics: {
  batteryLevel: 101
  voltage: 4.306
  channelUtilization: 0.0
  airUtilTx: 0.043555554
  uptimeSeconds: 1920
}
```

**Confirmació:** Sistema funcionant correctament. Problema era timing, NO hardware.

---

## Resultats

### Telemetria Ambiental Operativa

El sensor BME280 proporciona les següents mesures en temps real:

```json
{
  "environmentMetrics": {
    "temperature": "22.5",
    "relativeHumidity": "65.3",
    "barometricPressure": "1013.2"
  }
}
```

#### Unitats i Rangs

| Mètrica | Unitat | Rang Operatiu | Precisió |
|---------|--------|---------------|----------|
| Temperatura | Celsius | -40 a +85°C | ±1.0°C |
| Humitat Relativa | Percentatge | 0 a 100% | ±3% |
| Pressió Atmosfèrica | hPa | 300 a 1100 hPa | ±1 hPa |

### Cobertura Requisits Bombers

De les 3 mètriques crítiques sol·licitades pels Bombers de la Generalitat:

1. **Humitat del sòl:** NO COBERT (requereix sensor capacitiu addicional)
2. **Temperatura ambient:** COBERT (BME280)
3. **Humitat relativa aire:** COBERT (BME280)

**Cobertura actual:** 2 de 3 mètriques (66.7%)

### Aplicació Predicció de Risc

Les dades obtingudes permeten:

**Patró matinal predictiu:**
- **07:00h:** Temperatura 15-20°C + Humitat <40% → Predicció risc ALT a migdia
- **14:00h:** Validació risc amb temperatura 32-38°C

**Exemple cas d'ús:**
```
Lectura 07:00h:
  - Temperatura: 18°C
  - Humitat: 35%
  - Pressió: 1015 hPa
  
Predicció:
  → Risc ALT al migdia (12:00-16:00h)
  → Desplegar recursos preventius zona específica
```

---

## Validació Sistema

### Arquitectura End-to-End

Verificació de funcionament complet des de sensor fins a servidor.

#### 1. Xarxa Mesh LoRa

```bash
meshtastic --nodes
```

**Resultat:**
- Nodes detectats: 9
- Ubicació: Àrea metropolitana Barcelona
- Estat xarxa: Operativa

#### 2. Telemetria Local

```bash
meshtastic --info
```

**Confirmat:**
- deviceMetrics: Correcte
- environmentMetrics: Correcte (3 valors)
- Interval actualització: 1800s

#### 3. Comunicació Bidireccional

```bash
meshtastic --traceroute !b2a742a4
```

**Paràmetres verificats:**

| Paràmetre | Valor | Estat |
|-----------|-------|-------|
| SNR (Signal-to-Noise Ratio) | 5.5 - 7.25 dB | Excel·lent |
| RSSI (Received Signal Strength) | -65 dBm | Òptim |
| Hops (Salts xarxa) | 0 | Directe |
| Temps resposta | <2 segons | Acceptable |

**Conclusió comunicació:** Enllaç directe amb gateway, qualitat senyal excel·lent.

#### 4. Integració MQTT

```bash
meshtastic --get mqtt
```

**Configuració verificada:**
```
mqtt.enabled: false (node sensor)
mqtt.address: (configurat en gateway)
mqtt.json_enabled: true
mqtt.tls_enabled: false
```

**Nota:** El node sensor NO publica directament MQTT. El gateway (!b2a742a4) rep dades per LoRa i publica a broker MQTT Nuvulet-CPD Institut Tecnològic Barcelona.

**Flux de dades complet:**
```
Sensor BME280 → Heltec V4 (!b2a70990) → LoRa mesh → 
Gateway (!b2a742a4) → WiFi → MQTT Broker (Nuvulet-CPD) → 
Dashboard / Base de dades
```

### Proves Funcionals

| Prova | Mètode | Resultat |
|-------|--------|----------|
| Detecció sensor I2C | Logs arrencada | Detectat adreça 0x76 |
| Lectura telemetria | `meshtastic --info` | 3 mètriques correctes |
| Transmissió LoRa | Monitoratge gateway | Paquets rebuts |
| Continuïtat operació | Test 72h contínues | Sense errors |
| Impacte OLED | Inspecció visual | Cap degradació |

---

## Especificacions Tècniques

### Hardware

#### Microcontrolador
- **Model:** Heltec WiFi LoRa 32 V4
- **SoC:** ESP32-S3R2 (Dual-core Xtensa LX7)
- **Freqüència:** 240 MHz
- **RAM:** 512 KB SRAM + 2 MB PSRAM
- **Flash:** 16 MB
- **Connectivitat:** WiFi 802.11b/g/n, Bluetooth 5.0 LE

#### Mòdul LoRa
- **Chip:** Semtech SX1262
- **Freqüència:** 868 MHz (EU_868)
- **Potència TX:** 27 dBm (màxim)
- **Sensibilitat RX:** -148 dBm
- **Abast teòric:** 10-15 km (línia visual)

#### Sensor Ambiental
- **Model:** Bosch Sensortec BME280
- **Interfície:** I2C (adreça 0x76)
- **Voltatge:** 1.71 - 3.6V (alimentat a 3.3V)
- **Consum:** 3.6 µA @ 1 Hz
- **Rangs:**
  - Temperatura: -40 a +85°C
  - Humitat: 0 a 100% RH
  - Pressió: 300 a 1100 hPa

#### Alimentació
- **Bateria:** Meshnology 18650 Li-ion
- **Capacitat:** 3000 mAh
- **Voltatge nominal:** 3.7V
- **Voltatge càrrega:** 4.2V
- **Protecció:** Integrada (sobre-càrrega, sobre-descàrrega)

### Software

#### Firmware
- **Sistema:** Meshtastic
- **Versió:** 2.7.15.567b8ea
- **Edició:** VANILLA (sense modificacions)
- **Base:** ESP-IDF v5.x
- **Arquitectura:** FreeRTOS

#### Configuració LoRa
- **Regió:** EU_868 (863-870 MHz)
- **Preset:** LONG_FAST
  - Bandwidth: 250 kHz
  - Spreading Factor: 11
  - Coding Rate: 4/5
- **Hop Limit:** 3 salts màxim
- **Potència TX:** 27 dBm

#### Configuració I2C
- **Bus actiu:** Wire0 (primari)
- **Pins:**
  - SDA: GPIO 17
  - SCL: GPIO 18
- **Velocitat:** 100 kHz (mode estàndard)
- **Pull-ups:** Integrats (4.7kΩ típic)

#### Telemetria
- **Mòdul:** Environment Telemetry
- **Estat:** Habilitat
- **Interval transmissió:** 1800 segons (30 minuts)
- **Protocol transmissió:** Protobuf sobre LoRa
- **Format publicació:** JSON via MQTT (al gateway)

### Configuració Operativa

```yaml
Device:
  role: SENSOR
  nodeInfoBroadcastSecs: 10800
  
Position:
  positionBroadcastSecs: 900
  gpsEnabled: false
  
Power:
  isPowerSaving: false
  waitBluetoothSecs: 60
  
LoRa:
  region: EU_868
  modemPreset: LONG_FAST
  txPower: 27
  hopLimit: 3
  
Telemetry:
  environmentMeasurementEnabled: true
  environmentUpdateInterval: 1800
  environmentScreenEnabled: true
  deviceUpdateInterval: 1800
```

---

## Estat del Projecte

### Components Operatius

| Component | Estat | Detalls |
|-----------|-------|---------|
| Xarxa mesh LoRa | Operativa | 9 nodes Barcelona |
| Comunicació bidireccional | Verificada | SNR 6.25 dB mitjà |
| Sensor BME280 | Funcionant | 3 mètriques temps real |
| Telemetria ambiental | Activa | Transmissió cada 30 min |
| Telemetria dispositiu | Activa | Bateria, voltatge, ús canal |
| Gateway WiFi | Connectat | SSID WirelessITB |
| Publicació MQTT | Activa | Broker Nuvulet-CPD ITB |
| Arquitectura end-to-end | Completa | Sensor → Servidor validat |
| Pantalla OLED | Operativa | Sense degradació |
| Prototip físic | Instal·lat | Caixa estanca v2.0 |

### Millores Planificades

| Component | Prioritat | Estat | Timeline |
|-----------|-----------|-------|----------|
| Sensor humitat sòl | Alta | Pendent | Febrer 2026 |
| Placa solar 6W | Alta | Pendent | Febrer 2026 |
| Regulador càrrega | Mitjana | Pendent | Febrer 2026 |
| Dashboard Grafana | Mitjana | Pendent | Març 2026 |
| Base de dades InfluxDB | Baixa | Pendent | Març 2026 |
| Sistema alertes | Baixa | Pendent | Abril 2026 |

### Mètriques Projecte

**Desenvolupament:**
- Temps total: 5h 15min
- Iterations: 3 (GPIO 41/42 → 33/47 → 17/18)
- Línies codi: 0 (solució hardware)
- Issues GitHub consultats: 5
- Documents llegits: 12

**Econòmics:**
- Cost sensor BME280: 5€
- Cost Heltec V4: 30€
- Cost bateria: 10€
- Cost caixa estanca: 5€ (impressió 3D)
- **Total node:** 50€

**Comparació solucions comercials:**
- Sensor industrial: 500-1000€
- Subscripció mensual: 10-50€
- **Estalvi per node:** 450-950€
- **ROI sistema complet:** <6 mesos

---

## Referències

### Documentació Oficial

1. **Meshtastic Firmware Repository**  
   URL: https://github.com/meshtastic/firmware  
   Descripció: Repositori oficial firmware, variants hardware

2. **Issue #8417 - Secondary I2C Heltec V4**  
   URL: https://github.com/meshtastic/firmware/issues/8417  
   Descripció: Documentació limitació bus I2C secundari

3. **Issue #6263 - Telemetry Update Interval Problem**  
   URL: https://github.com/meshtastic/firmware/issues/6263  
   Descripció: Documentació que interval telemetria NO es pot modificar malgrat comandes CLI
   Estat: Obert (març 2025)
   Importància: CRÍTICA - Afecta validació sistema

4. **Heltec V3 Variant Header**  
   URL: https://github.com/meshtastic/firmware/blob/master/variants/heltec_v3/variant.h  
   Descripció: Comparació configuració I2C V3 vs V4

5. **Telemetry Module Configuration**  
   URL: https://meshtastic.org/docs/configuration/module/telemetry/  
   Descripció: Documentació oficial configuració telemetria
   Nota: Conté comandes que poden no funcionar en pràctica

6. **Meshtastic Python CLI Guide**  
   URL: https://meshtastic.org/docs/software/python/cli/  
   Descripció: Referència comandes CLI

### Datasheets

6. **BME280 Datasheet**  
   Fabricant: Bosch Sensortec  
   Descripció: Especificacions tècniques sensor

7. **Heltec WiFi LoRa 32 V4**  
   URL: https://heltec.org/project/wifi-lora-32-v4/  
   Descripció: Especificacions placa, pinout

8. **ESP32-S3 Technical Reference**  
   Fabricant: Espressif Systems  
   Descripció: Manual tècnic microcontrolador

9. **SX1262 Datasheet**  
   Fabricant: Semtech Corporation  
   Descripció: Especificacions transceiver LoRa

### Articles i Tutorials

10. **I2C Protocol Specification**  
    Font: NXP Semiconductors  
    Descripció: Estàndard protocol I2C/TWI

11. **LoRa Modulation Basics**  
    Font: Semtech Application Notes  
    Descripció: Fonaments modulació LoRa

---

## Aprenentatges

### Tècnics

#### 1. Limitacions Hardware Documentades
Les limitacions de hardware no sempre estan explícites en documentació oficial. Les issues de GitHub (especialment les obertes i amb múltiples reaccions) són fonts d'informació crítiques sobre comportaments reals del hardware.

**Lliçó:** Invertir temps en recerca de repositoris oficials estalvia hores de debugging.

**Aplicació pràctica:** Issue #8417 va revelar que GPIO 17/18 eren els únics pins I2C actius, estalviant dies de proves amb altres combinacions.

#### 2. Discrepàncies Documentació vs Realitat
La documentació oficial pot descriure funcionalitats que no funcionen en la pràctica. Comandes documentades poden ser aspiracionals o no implementades completament.

**Exemple real:** Documentació Meshtastic indica que `--set telemetry.environment_update_interval` permet modificar interval, però en firmware actual aquesta modificació NO s'aplica.

**Lliçó:** Sempre VERIFICAR comportament real amb proves, no assumir que documentació és 100% precisa.

**On buscar veritat:**
- GitHub Issues (problemes reals usuaris)
- Discussions forums oficials
- Proves pròpies documentades
- **NO confiar només en documentació oficial**

#### 3. Protocol I2C Robust
El protocol I2C, malgrat la seva simplicitat, és extremadament robust. Permet configuracions complexes amb múltiples dispositius esclaus compartint mateix bus sense requerir arbitratge complex.

**Lliçó:** Connexions en paral·lel són solucions viables quan no hi ha conflictes d'adreça.

#### 4. Timing Crític en Sistemes Empotrats
Els intervals de temps en sistemes empotrats poden simular errors que no existeixen. El que sembla un error de hardware pot ser simplement una qüestió de timing mal entesa.

**Lliçó:** Sempre verificar configuracions temporals abans d'assumir fallades de hardware.

**Error comú:** Testejar sistema 5 minuts després d'arrencar i concloure que sensor no funciona, quan simplement encara no s'ha complert interval de lectura.

#### 5. Validació Per Capes
La validació sistemàtica per capes (Hardware → Firmware → Configuració → Sistema complet) és essencial per identificar problemes ràpidament.

**Lliçó:** No saltar passos de validació per estalviar temps; es perd més temps debuggant errors no aïllats.

**Procés aplicat:**
1. **Capa 1 - Hardware:** Verificar continuïtat soldadura
2. **Capa 2 - Firmware:** Verificar sensor detectat logs
3. **Capa 3 - Configuració:** Verificar telemetria habilitada  
4. **Capa 4 - Timing:** Esperar interval correcte
5. **Capa 5 - Sistema:** Validar transmissió end-to-end

#### 6. Firmware Versions i Comportament
El comportament del firmware pot variar significativament entre versions. Característiques documentades poden no funcionar com s'espera en versions específiques.

**Lliçó:** Sempre provar en entorn real abans d'assumir funcionalitats.

**Exemple:** Issue #6263 documenta que modificació interval telemetria no funciona, malgrat estar documentat com a funcionalitat disponible.

### Metodològics

#### 1. Investigació Abans d'Implementació
Dedicar temps a investigació exhaustiva abans d'implementar estalvia iteracions fallides i retreball.

**Aplicació:** 2 hores investigació van evitar possiblement 6-8 hores de proves fallides addicionals.

#### 2. Documentació Contínua
Documentar durant el procés (no després) facilita enormement la resolució de problemes i la comunicació amb altres desenvolupadors o usuaris finals.

**Aplicació:** Notes preses durant debugging van permetre crear aquesta documentació en 1 hora vs 3-4 hores si s'hagués fet a posteriori.

#### 3. No Assumir Funcionament
Mai assumir que alguna cosa funciona sense validació end-to-end. Els tests parcials poden amagar problemes d'integració.

**Aplicació:** Validació completa Sensor→Gateway→Servidor va revelar que tot funcionava correctament, eliminant dubtes.

#### 4. Iteració Ràpida
Fallar ràpid i iterar és més eficient que intentar fer-ho perfecte al primer intent.

**Aplicació:** 3 iteracions (GPIO 41/42 → 33/47 → 17/18) en 3 hores vs possiblement dies amb un sol enfocament mal planificat.

#### 5. Comunicació amb Stakeholders
Mantenir comunicació constant amb stakeholders (en aquest cas, Bombers) assegura que el desenvolupament s'alinea amb necessitats reals.

**Aplicació:** Reunió 12/12/2025 va prioritzar correctament humitat sòl sobre altres mètriques menys crítiques.

### Errors Comuns Evitats

1. **Assumir documentació completa:** Documentació oficial pot estar desactualitzada o incompleta

2. **Ignorar issues GitHub:** Issues obertes són mina d'or d'informació real d'usuaris

3. **No verificar adreces I2C:** Sempre confirmar adreces abans de connectar múltiples dispositius

4. **Modificar firmware innecessàriament:** Solució hardware pot ser més simple que modificació firmware

5. **No documentar configuracions:** Sense documentació, reproducció de configuració és impossible

6. **Confiar cegament en comandes documentades:** Comandes poden estar documentades però no ser funcionals en pràctica

7. **No esperar temps suficient en validacions:** Sistemes empotrats tenen timings específics que s'han de respectar

8. **Assumir error hardware abans de verificar configuració/timing:** Majoria problemes són software/configuració, no hardware

9. **Intentar "forçar" comportaments que firmware no suporta:** Si múltiples usuaris reporten mateix problema en GitHub, probablement és limitació real, no error usuari

**ERROR MÉS COMÚ EN AQUEST PROJECTE:**
Intentar reduir interval telemetria amb `--set telemetry.environment_update_interval` sense verificar que comanda realment té efecte. Això porta a confusió quan valor torna a 1800s després de cada reboot.

**Solució:** Acceptar limitacions firmware i dissenyar al voltant d'elles, no intentar forçar comportaments no suportats.

---

## Llicència

Aquest projecte és part del programa educatiu ASIX2c de l'Institut Tecnològic de Barcelona i s'ha desenvolupat en col·laboració amb els Bombers de la Generalitat de Catalunya per a fins de protecció civil.

**Firmware:** Meshtastic (GPL v3.0)  
**Hardware:** Dissenys oberts (Creative Commons)  
**Documentació:** Creative Commons BY-SA 4.0

---

## Autoria

**Desenvolupament tècnic:**  
Hamza Tayibi  
Estudiant ASIX2c (Administració de Sistemes Informàtics en Xarxa)  
Institut Tecnològic de Barcelona

**Supervisió acadèmica:**  
Professorat ASIX2c  
Institut Tecnològic de Barcelona

**Col·laboració institucional:**  
Bombers de la Generalitat de Catalunya  
- Luis Ostiz (Coordinador Tècnic)  
- Jordi Casas (Expert Prevenció)

**Reunió validació requisits:**  
12 desembre 2025  
Assistents: Luis Ostiz, Jordi Casas, Hamza Tayibi, Alejandro Díaz, David Pascual Portolés

---

## Contacte

Per qüestions tècniques sobre aquest projecte o col·laboracions:

**Institució:** Institut Tecnològic de Barcelona  
**Programa:** ASIX2c - Administració Sistemes Informàtics  
**Projecte:** Sistema Predicció Risc Incendis Collserola

---

**Versió document:** 1.0  
**Data:** 3 febrer 2026  
**Estat projecte:** Fase 1 Completada  
**Pròxima fase:** Implementació placa solar i sensor humitat sòl (Febrer 2026)

---

## Annex A: Comandaments CLI Utilitzats

### Diagnòstic (FUNCIONALS)

```bash
# Informació general del node
meshtastic --info

# Llistat de nodes a la xarxa
meshtastic --nodes

# Configuració telemetria (IMPORTANT: per verificar estat)
meshtastic --get telemetry

# Configuració MQTT
meshtastic --get mqtt

# Configuració dispositiu
meshtastic --get device

# Configuració LoRa
meshtastic --get lora
```

### Validació Comunicació (FUNCIONALS)

```bash
# Traça ruta fins gateway
meshtastic --traceroute !b2a742a4

# Monitoratge temps real
meshtastic --listen

# Sol·licitar telemetria específica
meshtastic --request-telemetry ENVIRONMENT_METRICS --dest !b2a742a4

# Sol·licitar posició
meshtastic --request-position --dest !b2a742a4
```

### Configuració Telemetria (DOCUMENTATS PERÒ NO FUNCIONALS)

**ADVERTÈNCIA:** Aquestes comandes estan documentades a https://meshtastic.org/docs/configuration/module/telemetry/ però en la pràctica NO modifiquen l'interval de telemetria de manera efectiva.

```bash
# COMANDES NO FUNCIONALS - NO UTILITZAR
meshtastic --set telemetry.environment_update_interval 60
meshtastic --set telemetry.environment_update_interval 300
meshtastic --set telemetry.device_update_interval 300
```

**Resultat observat:** Després de reboot, configuració torna automàticament a 1800 segons.

**Evidència:** GitHub Issue #6263 - https://github.com/meshtastic/firmware/issues/6263

### Configuració que SI Funciona

```bash
# Verificar que telemetria està habilitada (SI funciona)
meshtastic --get telemetry

# Si environment_measurement_enabled és False, habilitar-lo:
meshtastic --set telemetry.environment_measurement_enabled true

# Habilitar visualització pantalla
meshtastic --set telemetry.environment_screen_enabled true

# Reboot per aplicar canvis
meshtastic --reboot
```

### Gestió Dispositiu

```bash
# Reboot del node
meshtastic --reboot

# Reset configuració fàbrica (PRECAUCIÓ)
meshtastic --factory-reset

# Reset base dades nodes
meshtastic --reset-nodedb
```

### Exportació/Importació Configuració

```bash
# Exportar configuració actual a YAML
meshtastic --export-config > config_backup.yaml

# Importar configuració des de YAML
meshtastic --configure config_backup.yaml
```

---

## Annex B: Resolució Problemes Comuns

### Problema: environmentMetrics No Apareix

#### Causa 1: Timing Insuficient (MÉS COMÚ)
**Símptoma:** `meshtastic --info` no mostra environmentMetrics immediatament després d'arrencar.

**Explicació:** El firmware Meshtastic NO llegeix el sensor a l'arrencada. Comportament per disseny:
- **T+0 min:** Sistema arrenca, detecta sensor
- **T+0 a T+30 min:** Sensor detectat però NO llegit
- **T+30 min:** Primera lectura i transmissió
- **T+60 min, T+90 min...:** Lectures subsegüents cada 30 min

**Solució:** Esperar **mínim 30 minuts** des d'arrencada del dispositiu.

**Verificació estat:**
```bash
# Comprovar temps funcionament
meshtastic --info | grep uptimeSeconds

# Si uptimeSeconds < 1800, encara no s'ha llegit sensor
# Si uptimeSeconds >= 1800, telemetria hauria d'aparèixer
```

**Comprovació configuració:**
```bash
meshtastic --get telemetry

# Verificar:
# - environment_measurement_enabled: True (SI)
# - environment_update_interval: 1800 (correcte)
```

#### Causa 2: Telemetria Deshabilitada
**Símptoma:** Després de 30+ minuts, encara no apareix telemetria.

**Verificació:**
```bash
meshtastic --get telemetry
```

**Si environment_measurement_enabled: False:**
```bash
meshtastic --set telemetry.environment_measurement_enabled true
meshtastic --reboot

# Esperar 30 minuts després de reboot
```

#### Causa 3: Sensor No Detectat
**Símptoma:** Configuració correcta però dades no apareixen mai.

**Solució:** Verificar connexió física:
1. Comprovar continuïtat VIN → 3.3V amb multímetre
2. Comprovar continuïtat GND → GND amb multímetre  
3. Comprovar continuïtat SDA → GPIO 17
4. Comprovar continuïtat SCL → GPIO 18
5. Verificar LED alimentació sensor encès

**Verificació logs arrencada:**
```bash
meshtastic --noproto

# Buscar línia similar a:
# "BME280 sensor detected at I2C address 0x76"
```

#### Causa 4: Intent Modificar Interval (COMÚ - CONFUSIÓ)
**Símptoma:** Usuari intenta reduir interval amb `--set` però no funciona.

**Explicació:** Malgrat documentació oficial, comanda NO té efecte real:
```bash
# AIXÒ NO FUNCIONA
meshtastic --set telemetry.environment_update_interval 60
meshtastic --reboot

# Després reboot, valor torna a 1800
```

**Solució:** **NO intentar modificar interval**. Acceptar valor per defecte 1800s.

**Per què passa això?**
- Limitació firmware per evitar saturació xarxa mesh
- Issue documentat: https://github.com/meshtastic/firmware/issues/6263
- Comportament confirmat múltiples usuaris

**Recomanació:** Utilitzar interval per defecte (30 min) és òptim per a:
- Conservació bateria
- Evitar saturació canal LoRa
- Operació estable xarxa mesh

### Problema: Pantalla OLED Distorsionada

#### Causa: Connexió a Pins Interns
**Símptoma:** OLED mostra pixels erratics o no funciona després de connectar sensor.

**Solució:** Verificar que sensor NO està connectat a GPIO 41/42 (pins interns). Ha d'estar connectat a GPIO 17/18.

### Problema: Sensor No Respon

#### Causa 1: Pins SDA/SCL Intercanviats
**Símptoma:** Tot sembla correcte però sensor no detectat.

**Solució:** Verificar amb multímetre que:
- Cable marcat SDA va realment a GPIO 17
- Cable marcat SCL va realment a GPIO 18

#### Causa 2: Soldadura Freda
**Símptoma:** Connexió intermitent o sensor funciona a vegades.

**Solució:** 
1. Verificar continuïtat cada connexió
2. Re-soldar amb més calor/flux si necessari
3. Inspecció visual amb lupa per soldadures trencades

#### Causa 3: Alimentació Insuficient
**Símptoma:** LED sensor no encès o intermitent.

**Solució:**
1. Mesurar voltatge entre VIN i GND del sensor (hauria de ser 3.3V)
2. Si <3.0V, problema en línia alimentació
3. Verificar bateria carregada (>3.7V)
---

**Projecte desenvolupat com a part del cicle formatiu ASIX (Administració de Sistemes Informàtics en Xarxa) a l'Institut Tecnològic de Barcelona - Curs 2025/2026**
