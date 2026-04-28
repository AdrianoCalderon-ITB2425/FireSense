# Occupational Risk Assessment — FireSense Project

> Document prepared in accordance with **Law 31/1995 on Occupational Risk Prevention** and **Royal Decree 39/1997** approving the Regulation of Prevention Services.

---

## Table of Contents

- [Occupational Risk Assessment — FireSense Project](#occupational-risk-assessment--firesense-project)
  - [Table of Contents](#table-of-contents)
  - [1. Project Identification](#1-project-identification)
  - [2. Assessment Methodology](#2-assessment-methodology)
  - [3. Ergonomic and Postural Risks](#3-ergonomic-and-postural-risks)
    - [Description](#description)
    - [Identified Risks](#identified-risks)
    - [Preventive Measures](#preventive-measures)
  - [4. Visual Fatigue Risks](#4-visual-fatigue-risks)
    - [Description](#description-1)
    - [Identified Risks](#identified-risks-1)
    - [Preventive Measures](#preventive-measures-1)
  - [5. Electrical Risks](#5-electrical-risks)
    - [Description](#description-2)
    - [Identified Risks](#identified-risks-2)
    - [Preventive Measures](#preventive-measures-2)
  - [6. Hardware Handling Risks](#6-hardware-handling-risks)
    - [Description](#description-3)
    - [Identified Risks](#identified-risks-3)
    - [Preventive Measures](#preventive-measures-3)
  - [7. Environmental Risks (Noise and Temperature)](#7-environmental-risks-noise-and-temperature)
    - [Description](#description-4)
    - [Identified Risks](#identified-risks-4)
    - [Preventive Measures](#preventive-measures-4)
  - [8. Psychosocial Risks](#8-psychosocial-risks)
    - [Description](#description-5)
    - [Identified Risks](#identified-risks-5)
    - [Preventive Measures](#preventive-measures-5)
  - [9. Risks from Working with Electronic Components](#9-risks-from-working-with-electronic-components)
    - [Description](#description-6)
    - [Identified Risks](#identified-risks-6)
    - [Preventive Measures](#preventive-measures-6)
  - [10. Risks Associated with Working in Data Centre / Server Room Environments](#10-risks-associated-with-working-in-data-centre--server-room-environments)
    - [Description](#description-7)
    - [Identified Risks](#identified-risks-7)
    - [Preventive Measures](#preventive-measures-7)
  - [11. Risk Summary Table](#11-risk-summary-table)
  - [12. Preventive Measures Plan](#12-preventive-measures-plan)
    - [Important-level Risks (Priority Action)](#important-level-risks-priority-action)
    - [Moderate-level Risks (Action Within Short Timeframe)](#moderate-level-risks-action-within-short-timeframe)

---

## 1. Project Identification

| Field | Detail |
|---|---|
| **Project name** | FireSense — IoT Forest Monitoring System for Fire Prevention |
| **Institution** | Institut Tecnològic de Barcelona (ITB) |
| **Team** | Hamza Tayibi, Adriano Calderón, Alejandro Díaz |
| **Duration** | Late March – Late May 2026 |
| **Work environment** | ITB computer classrooms and remote work |
| **Main activities** | VM configuration (IsardVDI), K8s cluster deployment, CI/CD pipeline programming, IoT hardware assembly and testing (RAK WisBlock, LoRaWAN gateway), technical documentation |

---

## 2. Assessment Methodology

Each risk is assessed according to two parameters:

- **Probability (P)**: Low / Medium / High
- **Severity (S)**: Minor / Serious / Very serious

The combination of both determines the **Risk Level (RL)**:

| | Minor | Serious | Very serious |
|---|---|---|---|
| **Low** | Trivial | Tolerable | Moderate |
| **Medium** | Tolerable | Moderate | Important |
| **High** | Moderate | Important | Intolerable |

---

## 3. Ergonomic and Postural Risks

### Description

The project involves prolonged sessions in front of computers to configure servers, write code, draft documentation and manage the K8s cluster via terminal. These sessions can last several consecutive hours without adequate breaks.

### Identified Risks

| ID | Risk | Cause | P | S | RL |
|---|---|---|---|---|---|
| ERG-01 | Cervical and lower back pain | Incorrect posture in front of the PC for hours | High | Serious | **Important** |
| ERG-02 | Musculoskeletal disorders in upper limbs | Intensive use of keyboard and mouse (carpal tunnel syndrome) | Medium | Serious | **Moderate** |
| ERG-03 | Poor circulation in lower limbs | Prolonged seated position without movement | Medium | Minor | **Tolerable** |
| ERG-04 | Headache from muscle tension | Accumulated tension in neck and shoulders | Medium | Minor | **Tolerable** |

### Preventive Measures

- Adjust the chair so that the thighs are parallel to the floor and the feet rest flat.
- Keep the screen at a distance of 50–70 cm and at eye level or slightly below.
- Apply the **20-20-20 rule**: every 20 minutes, look at a point 20 feet (~6 metres) away for 20 seconds.
- Take 5-minute active breaks every hour: stand up, walk and stretch the neck, shoulders and wrists.
- Use wrist supports during prolonged writing sessions.

---

## 4. Visual Fatigue Risks

### Description

Working with multiple simultaneous screens (terminals, Grafana dashboards, IDE, documentation) exposes the team to a high and sustained visual load.

### Identified Risks

| ID | Risk | Cause | P | S | RL |
|---|---|---|---|---|---|
| VIS-01 | Eye strain (asthenopia) | Prolonged screen exposure without breaks | High | Minor | **Moderate** |
| VIS-02 | Dry eyes | Reduced blinking in front of screens | High | Minor | **Moderate** |
| VIS-03 | Headache from visual fatigue | Inadequate contrast, excessive artificial light | Medium | Minor | **Tolerable** |

### Preventive Measures

- Adjust screen brightness and contrast to ambient conditions.
- Enable night light mode (blue light reduction) during evening sessions.
- Ensure classroom lighting does not create direct reflections on the screen.
- Apply the **20-20-20 rule** mentioned in the previous section.
- If wearing glasses, ensure the prescription is correct for the screen working distance.

---

## 5. Electrical Risks

### Description

The project includes work with physical hardware: RAK WisBlock nodes, LoRaWAN gateway and power supplies. In addition, the VMs run on physical servers at IsardVDI which involves the centre's electrical infrastructure.

### Identified Risks

| ID | Risk | Cause | P | S | RL |
|---|---|---|---|---|---|
| ELE-01 | Direct electrical contact | Handling energised components without protection | Low | Very serious | **Moderate** |
| ELE-02 | Indirect electrical contact | Insulation failure in cables or power adapters | Low | Serious | **Tolerable** |
| ELE-03 | Short circuit on breadboard | Incorrect connections during IoT hardware assembly | Medium | Serious | **Moderate** |
| ELE-04 | Battery overheating | Improper use or short circuit of the 9V node battery | Low | Serious | **Tolerable** |
| ELE-05 | Component damage from electrostatic discharge (ESD) | Handling without antistatic protection | Medium | Minor | **Tolerable** |

### Preventive Measures

- Always disconnect the power supply before modifying connections on the breadboard.
- Never work with components energised above 5V without the teacher's supervision.
- Verify breadboard connections with a multimeter **before** powering the circuit.
- Use an ESD wrist strap when handling the RAK WisBlock and sensitive components.
- Do not leave batteries connected unattended.
- If a burning smell or overheating is detected, immediately disconnect the power supply.

---

## 6. Hardware Handling Risks

### Description

The physical assembly of IoT nodes, cable connections, circuit board handling and work with small components involve risks of cuts, impacts and damage from falling objects.

### Identified Risks

| ID | Risk | Cause | P | S | RL |
|---|---|---|---|---|---|
| MAN-01 | Minor cuts | Handling connectors, terminals or cabling with sharp ends | Medium | Minor | **Tolerable** |
| MAN-02 | Impacts and bruises | Falling hardware (switch, server, rack equipment) | Low | Minor | **Trivial** |
| MAN-03 | Loss or damage of small components | Dropping resistors, connectors, pins | High | Minor | **Moderate** |
| MAN-04 | Accidental ingestion or eye contact with components | Careless handling of small components | Low | Serious | **Tolerable** |

### Preventive Measures

- Keep the workspace tidy and free of unnecessary objects during assembly.
- Use antistatic trays or mats to prevent small components from falling.
- Do not put small components in the mouth or touch the eyes during work.
- Check the condition of cables and connectors before each hardware work session.

---

## 7. Environmental Risks (Noise and Temperature)

### Description

Server rooms and network laboratories at the centre generate constant noise from equipment fans. Additionally, spaces with a high density of active equipment can reach elevated temperatures.

### Identified Risks

| ID | Risk | Cause | P | S | RL |
|---|---|---|---|---|---|
| AMB-01 | Exposure to continuous noise | Fans from active servers and network equipment | Medium | Minor | **Tolerable** |
| AMB-02 | Mild heat stress | Elevated temperature in server room or laboratory with poor ventilation | Low | Minor | **Trivial** |
| AMB-03 | Dehydration during long sessions | Intensive sessions without fluid intake | Medium | Minor | **Tolerable** |

### Preventive Measures

- Limit time spent in the server room to strictly necessary moments (avoid prolonged work there when it can be done remotely via SSH).
- Keep a water bottle at the workstation during long sessions.
- Ensure adequate classroom ventilation.
- When working for extended periods in noisy environments, use hearing protection if the level exceeds 80 dB(A).

---

## 8. Psychosocial Risks

### Description

The project has a fixed delivery date (late May 2026), high technical complexity (K8s, CI/CD, LoRaWAN, security, AI) and requires constant coordination between three team members. These factors can generate stress, interpersonal conflicts and mental fatigue.

### Identified Risks

| ID | Risk | Cause | P | S | RL |
|---|---|---|---|---|---|
| PSI-01 | Stress from high workload | Large number of technologies to implement in a short time | High | Serious | **Important** |
| PSI-02 | Mental fatigue (burnout) | Intensive work sessions without adequate breaks | Medium | Serious | **Moderate** |
| PSI-03 | Interpersonal team conflicts | Differences of opinion, unequal task distribution, pressure | Medium | Minor | **Tolerable** |
| PSI-04 | Anxiety from technical blockages | Difficult errors that generate accumulated frustration | High | Minor | **Moderate** |
| PSI-05 | Sleep disruption | Night work to meet deadlines | Medium | Serious | **Moderate** |

### Preventive Measures

- Plan the project with clear sprints and evenly distributed tasks (as done with the project sprint CSV).
- Establish reasonable working hours and respect rest and sleep time.
- Communicate technical blockages to the team immediately, without accumulating frustration alone.
- Celebrate achieved milestones to maintain team motivation.
- In the event of internal conflict, turn to the project tutor as a mediator.
- Do not start critical system configuration sessions (K8s, CI/CD pipelines) in a state of high fatigue, as errors in these environments can have a significant impact.

---

## 9. Risks from Working with Electronic Components

### Description

IoT hardware prototyping (RAK WisBlock nodes, soil temperature and humidity sensor connections, voltage dividers) involves soldering and chemical compounds in certain phases of the project.

### Identified Risks

| ID | Risk | Cause | P | S | RL |
|---|---|---|---|---|---|
| ELC-01 | Inhalation of soldering fumes | Tin soldering without adequate ventilation | Medium | Serious | **Moderate** |
| ELC-02 | Burns from soldering iron | Accidental contact with the soldering iron at ~350°C | Medium | Minor | **Tolerable** |
| ELC-03 | Skin contact with soldering flux | Handling soldering paste without gloves | Medium | Minor | **Tolerable** |
| ELC-04 | Molten tin projection | Soldering in incorrect positions or with too much tin | Low | Serious | **Tolerable** |

### Preventive Measures

- Always solder in well-ventilated areas or with a fume extractor.
- Use protective goggles during soldering to prevent projections.
- Never leave the soldering iron unattended when hot; always use the corresponding stand.
- Wash hands after working with electronic components and tin.
- Use latex or nitrile gloves when handling soldering flux or paste.

---

## 10. Risks Associated with Working in Data Centre / Server Room Environments

### Description

Access to IsardVDI and the centre's physical servers involves occasional presence in data centre (DC) rooms or rack laboratories, which present specific risks.

### Identified Risks

| ID | Risk | Cause | P | S | RL |
|---|---|---|---|---|---|
| CPD-01 | Tripping over cables | Network and power cabling on the floor without cable management | Medium | Minor | **Tolerable** |
| CPD-02 | Impacts from rack doors | Abrupt opening of 19" rack doors | Low | Minor | **Trivial** |
| CPD-03 | Rack equipment falling | Incorrect removal of servers or switches from racks | Low | Serious | **Tolerable** |
| CPD-04 | Exposure to extinguishing agents (CO₂) | Accidental or necessary activation of the room fire suppression system | Low | Very serious | **Moderate** |

### Preventive Measures

- Do not access the server room without authorisation from the teacher or responsible technician.
- Channel or mark floor cables to prevent tripping.
- Handle rack equipment with two operators when weight or size requires it.
- Know the location of emergency stop buttons and evacuation routes in the room.
- In the event of CO₂ suppression system activation, evacuate immediately: CO₂ displaces oxygen and can cause asphyxiation in enclosed spaces.

---

## 11. Risk Summary Table

| ID | Risk Description | RL |
|---|---|---|
| ERG-01 | Cervical and lower back pain from incorrect posture | **Important** |
| ERG-02 | Musculoskeletal disorders in upper limbs | **Moderate** |
| ERG-03 | Poor circulation from prolonged seated position | **Tolerable** |
| ERG-04 | Headache from muscle tension | **Tolerable** |
| VIS-01 | Eye strain from screen exposure | **Moderate** |
| VIS-02 | Dry eyes from reduced blinking | **Moderate** |
| VIS-03 | Headache from visual fatigue | **Tolerable** |
| ELE-01 | Direct electrical contact | **Moderate** |
| ELE-02 | Indirect electrical contact | **Tolerable** |
| ELE-03 | Short circuit on breadboard | **Moderate** |
| ELE-04 | Battery overheating | **Tolerable** |
| ELE-05 | Component damage from electrostatic discharge (ESD) | **Tolerable** |
| MAN-01 | Minor cuts from connector handling | **Tolerable** |
| MAN-02 | Impacts from falling hardware | **Trivial** |
| MAN-03 | Loss or damage of small components | **Moderate** |
| MAN-04 | Accidental ingestion or eye contact with components | **Tolerable** |
| AMB-01 | Exposure to continuous fan noise | **Tolerable** |
| AMB-02 | Mild heat stress in server room | **Trivial** |
| AMB-03 | Dehydration during long sessions | **Tolerable** |
| PSI-01 | Stress from high workload | **Important** |
| PSI-02 | Mental fatigue (burnout) | **Moderate** |
| PSI-03 | Interpersonal team conflicts | **Tolerable** |
| PSI-04 | Anxiety from technical blockages | **Moderate** |
| PSI-05 | Sleep disruption from night work | **Moderate** |
| ELC-01 | Inhalation of soldering fumes | **Moderate** |
| ELC-02 | Burns from soldering iron | **Tolerable** |
| ELC-03 | Skin contact with soldering flux | **Tolerable** |
| ELC-04 | Molten tin projection | **Tolerable** |
| CPD-01 | Tripping over floor cables in DC | **Tolerable** |
| CPD-02 | Impacts from rack doors | **Trivial** |
| CPD-03 | Rack equipment falling | **Tolerable** |
| CPD-04 | Exposure to CO₂ extinguishing agents | **Moderate** |

---

## 12. Preventive Measures Plan

### Important-level Risks (Priority Action)

| ID | Risk | Action | Responsible | Deadline |
|---|---|---|---|---|
| ERG-01 | Cervical and lower back pain | Adjust furniture and take active breaks every hour | Entire team | Immediate |
| PSI-01 | Stress from workload | Review sprint planning and redistribute tasks | Entire team + tutor | Immediate |

### Moderate-level Risks (Action Within Short Timeframe)

| ID | Risk | Action | Responsible | Deadline |
|---|---|---|---|---|
| ERG-02 | Musculoskeletal disorders | Use wrist supports, breaks every hour | Entire team | 1 week |
| VIS-01 | Eye strain | Apply 20-20-20 rule, adjust brightness | Entire team | Immediate |
| VIS-02 | Dry eyes | Artificial tears if needed, adequate ventilation | Entire team | 1 week |
| ELE-01 | Direct electrical contact | Work protocol with hardware disconnected | Entire team | Immediate |
| ELE-03 | Short circuit on breadboard | Multimeter verification before powering | Entire team | Immediate |
| MAN-03 | Loss of small components | Use work trays and keep workspace tidy | Entire team | Immediate |
| PSI-02 | Mental fatigue | Set schedules and respect rest periods | Entire team | Immediate |
| PSI-04 | Anxiety from technical blockages | Open team communication, tutor support | Entire team | Ongoing |
| PSI-05 | Sleep disruption | Avoid night sessions for critical systems | Entire team | Immediate |
| ELC-01 | Inhalation of soldering fumes | Ventilation or fume extractor during soldering | Entire team | Before soldering |
| CPD-04 | Exposure to CO₂ extinguishers | Know the evacuation routes of the server room | Entire team | 1 week |

---

> **Legal note**: This document has been prepared for academic purposes as part of the ASIR cycle Final Project for the 2025–2026 academic year at ITB. It does not replace a professional occupational risk assessment carried out by a qualified prevention technician, as established by Royal Decree 39/1997.