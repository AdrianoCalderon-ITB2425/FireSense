# Avaluació de Riscos Laborals — Projecte FireSense

> Document elaborat d'acord amb la **Llei 31/1995 de Prevenció de Riscos Laborals** i el **Reial Decret 39/1997** pel qual s'aprova el Reglament dels Serveis de Prevenció.

---

## Índex

- [Avaluació de Riscos Laborals — Projecte FireSense](#avaluació-de-riscos-laborals--projecte-firesense)
  - [Índex](#índex)
  - [1. Identificació del projecte](#1-identificació-del-projecte)
  - [2. Metodologia d'avaluació](#2-metodologia-davaluació)
  - [3. Riscos ergonòmics i posturals](#3-riscos-ergonòmics-i-posturals)
    - [Descripció](#descripció)
    - [Riscos identificats](#riscos-identificats)
    - [Mesures preventives](#mesures-preventives)
  - [4. Riscos per fatiga visual](#4-riscos-per-fatiga-visual)
    - [Descripció](#descripció-1)
    - [Riscos identificats](#riscos-identificats-1)
    - [Mesures preventives](#mesures-preventives-1)
  - [5. Riscos elèctrics](#5-riscos-elèctrics)
    - [Descripció](#descripció-2)
    - [Riscos identificats](#riscos-identificats-2)
    - [Mesures preventives](#mesures-preventives-2)
  - [6. Riscos per manipulació de maquinari](#6-riscos-per-manipulació-de-maquinari)
    - [Descripció](#descripció-3)
    - [Riscos identificats](#riscos-identificats-3)
    - [Mesures preventives](#mesures-preventives-3)
  - [7. Riscos ambientals (soroll i temperatura)](#7-riscos-ambientals-soroll-i-temperatura)
    - [Descripció](#descripció-4)
    - [Riscos identificats](#riscos-identificats-4)
    - [Mesures preventives](#mesures-preventives-4)
  - [8. Riscos psicosocials](#8-riscos-psicosocials)
    - [Descripció](#descripció-5)
    - [Riscos identificats](#riscos-identificats-5)
    - [Mesures preventives](#mesures-preventives-5)
  - [9. Riscos per treball amb components electrònics](#9-riscos-per-treball-amb-components-electrònics)
    - [Descripció](#descripció-6)
    - [Riscos identificats](#riscos-identificats-6)
    - [Mesures preventives](#mesures-preventives-6)
  - [10. Riscos associats al treball en entorns de CPD / sala de servidors](#10-riscos-associats-al-treball-en-entorns-de-cpd--sala-de-servidors)
    - [Descripció](#descripció-7)
    - [Riscos identificats](#riscos-identificats-7)
    - [Mesures preventives](#mesures-preventives-7)
  - [11. Taula resum de riscos](#11-taula-resum-de-riscos)
  - [12. Pla de mesures preventives](#12-pla-de-mesures-preventives)
    - [Riscos de nivell Important (acció prioritària)](#riscos-de-nivell-important-acció-prioritària)
    - [Riscos de nivell Moderat (acció en termini breu)](#riscos-de-nivell-moderat-acció-en-termini-breu)

---

## 1. Identificació del projecte

| Camp | Detall |
|---|---|
| **Nom del projecte** | FireSense — Sistema IoT de Monitorització Forestal per a la Prevenció d'Incendis |
| **Centre** | Institut Tecnològic de Barcelona (ITB) |
| **Equip** | Hamza Tayibi, Adriano Calderón, Alejandro Díaz |
| **Durada** | Final de març – final de maig 2026 |
| **Entorn de treball** | Aules informàtiques ITB i treball remot |
| **Activitats principals** | Configuració de VMs (IsardVDI), desplegament de clúster K8s, programació de pipelines CI/CD, muntatge i prova de maquinari IoT (RAK WisBlock, gateway LoRaWAN), documentació tècnica |

---

## 2. Metodologia d'avaluació

Cada risc s'avalua segons dos paràmetres:

- **Probabilitat (P)**: Baixa / Mitjana / Alta
- **Gravetat (G)**: Lleu / Greu / Molt greu

La combinació d'ambdós dona el **Nivell de risc (NR)**:

| | Lleu | Greu | Molt greu |
|---|---|---|---|
| **Baixa** | Trivial | Tolerable | Moderat |
| **Mitjana** | Tolerable | Moderat | Important |
| **Alta** | Moderat | Important | Intolerable |

---

## 3. Riscos ergonòmics i posturals

### Descripció

El projecte implica sessions prolongades davant d'ordinadors per configurar servidors, escriure codi, redactar documentació i gestionar el clúster K8s via terminal. Aquestes sessions poden durar diverses hores consecutives sense descansos adequats.

### Riscos identificats

| ID | Risc | Causa | P | G | NR |
|---|---|---|---|---|---|
| ERG-01 | Dolor cervical i lumbar | Postura incorrecta davant del PC durant hores | Alta | Greu | **Important** |
| ERG-02 | Trastorns musculoesquelètics en extremitats superiors | Ús intensiu de teclat i ratolí (síndrome del túnel carpià) | Mitjana | Greu | **Moderat** |
| ERG-03 | Mala circulació en extremitats inferiors | Posició asseguda prolongada sense moviment | Mitjana | Lleu | **Tolerable** |
| ERG-04 | Dolor de cap per tensió muscular | Tensió acumulada al coll i espatlles | Mitjana | Lleu | **Tolerable** |

### Mesures preventives

- Ajustar la cadira de manera que les cuixes quedin paral·leles al terra i els peus reposin completament.
- Mantenir la pantalla a una distància de 50–70 cm i al nivell dels ulls o lleugerament per sota.
- Aplicar la regla **20-20-20**: cada 20 minuts, mirar un punt a 20 peus (~6 metres) durant 20 segons.
- Fer pauses actives de 5 minuts cada hora: aixecar-se, caminar i estirar coll, espatlles i canells.
- Utilitzar suports per al canell en sessions d'escriptura prolongada.

---

## 4. Riscos per fatiga visual

### Descripció

El treball amb múltiples pantalles simultànies (terminals, dashboards de Grafana, IDE, documentació) exposa l'equip a una càrrega visual elevada i sostinguda.

### Riscos identificats

| ID | Risc | Causa | P | G | NR |
|---|---|---|---|---|---|
| VIS-01 | Fatiga ocular (asthenopia) | Exposició prolongada a pantalles sense descansos | Alta | Lleu | **Moderat** |
| VIS-02 | Sequedat ocular | Reducció del parpelleig davant de pantalles | Alta | Lleu | **Moderat** |
| VIS-03 | Mal de cap per fatiga visual | Contrast inadequat, llum artificial excessiva | Mitjana | Lleu | **Tolerable** |

### Mesures preventives

- Ajustar la lluminositat i el contrast de la pantalla a les condicions ambientals.
- Activar el mode de llum nocturna (reducció de llum blava) durant sessions nocturnes.
- Garantir que la il·luminació de l'aula no generi reflexos directes a la pantalla.
- Aplicar la regla **20-20-20** esmentada a la secció anterior.
- En cas de portar ulleres, assegurar-se que la graduació és correcta per a la distància de treball amb pantalla.

---

## 5. Riscos elèctrics

### Descripció

El projecte inclou treball amb maquinari físic: nodes RAK WisBlock, gateway LoRaWAN i fonts d'alimentació. A més, les VMs corren sobre servidors físics a IsardVDI que impliquen infraestructura elèctrica del centre.

### Riscos identificats

| ID | Risc | Causa | P | G | NR |
|---|---|---|---|---|---|
| ELE-01 | Contacte elèctric directe | Manipulació de components energitzats sense protecció | Baixa | Molt greu | **Moderat** |
| ELE-02 | Contacte elèctric indirecte | Fallada d'aïllament en cables o adaptadors de corrent | Baixa | Greu | **Tolerable** |
| ELE-03 | Curtcircuit en protoboard | Connexions incorrectes en el muntatge del maquinari IoT | Mitjana | Greu | **Moderat** |
| ELE-04 | Sobreescalfament de bateria | Ús inadequat o curtcircuit de la bateria de 9V del node | Baixa | Greu | **Tolerable** |
| ELE-05 | Danys als components per descàrrega electrostàtica (ESD) | Manipulació sense protecció antiestàtica | Mittana | Lleu | **Tolerable** |

### Mesures preventives

- Desconnectar sempre l'alimentació abans de modificar connexions en la protoboard.
- No treballar mai amb components energitzats a més de 5V sense supervisió del professor.
- Verificar les connexions en la protoboard amb el multímetre **abans** d'alimentar el circuit.
- Utilitzar polsera antiestàtica (ESD wrist strap) en manipular el RAK WisBlock i components sensibles.
- No deixar bateries connectades sense supervisió.
- En cas de detecció d'olor a cremat o sobreescalfament, desconnectar immediatament l'alimentació.

---

## 6. Riscos per manipulació de maquinari

### Descripció

El muntatge físic dels nodes IoT, la connexió de cables, la manipulació de plaques de circuit i el treball amb components petits impliquen riscos de tall, cop i dany per caiguda d'objectes.

### Riscos identificats

| ID | Risc | Causa | P | G | NR |
|---|---|---|---|---|---|
| MAN-01 | Talls lleus | Manipulació de connectors, borns o cablejat amb extrems afilats | Mitjana | Lleu | **Tolerable** |
| MAN-02 | Cops i contusions | Caiguda de maquinari (switch, servidor, equipament de rack) | Baixa | Lleu | **Trivial** |
| MAN-03 | Pèrdua o dany de components petits | Caiguda de resistències, connectors, pins | Alta | Lleu | **Moderat** |
| MAN-04 | Ingestió o contacte ocular accidental de components | Manipulació descurada de components petits | Baixa | Greu | **Tolerable** |

### Mesures preventives

- Mantenir l'espai de treball ordenat i lliure d'objectes innecessaris durant el muntatge.
- Usar safates o catifes antiestàtiques per evitar la caiguda de components petits.
- No portar components petits a la boca ni tocar-se els ulls durant el treball.
- Revisar l'estat dels cables i connectors abans de cada sessió de treball amb maquinari.

---

## 7. Riscos ambientals (soroll i temperatura)

### Descripció

Les aules de servidors i els laboratoris de xarxes del centre generen soroll constant pels ventiladors dels equips. A més, els espais amb alta densitat d'equipament actiu poden assolir temperatures elevades.

### Riscos identificats

| ID | Risc | Causa | P | G | NR |
|---|---|---|---|---|---|
| AMB-01 | Exposició a soroll continu | Ventiladors de servidors i equips de xarxa actius | Mittana | Lleu | **Tolerable** |
| AMB-02 | Estrès tèrmic lleu | Temperatura elevada en sala de servidors o laboratori amb poca ventilació | Baixa | Lleu | **Trivial** |
| AMB-03 | Deshidratació en sessions llargues | Sessions intenses sense ingesta d'aigua | Mittana | Lleu | **Tolerable** |

### Mesures preventives

- Limitar el temps de permanència a la sala de servidors als moments estrictament necessaris (no treballar-hi de forma prolongada quan es pot fer remotament via SSH).
- Mantenir una botella d'aigua a l'espai de treball durant sessions llargues.
- Assegurar que la ventilació de l'aula és adequada.
- En cas de treball prolongat en entorns sorollosos, usar proteccions auditives si el nivell supera els 80 dB(A).

---

## 8. Riscos psicosocials

### Descripció

El projecte té una data d'entrega fixa (final de maig 2026), una alta complexitat tècnica (K8s, CI/CD, LoRaWAN, seguretat, IA) i requereix coordinació constant entre tres membres de l'equip. Aquests factors poden generar estrès, conflictes interpersonals i fatiga mental.

### Riscos identificats

| ID | Risc | Causa | P | G | NR |
|---|---|---|---|---|---|
| PSI-01 | Estrès per càrrega de treball elevada | Alt nombre de tecnologies a implementar en poc temps | Alta | Greu | **Important** |
| PSI-02 | Fatiga mental (burnout) | Sessions de treball intenses sense descansos adequats | Mittana | Greu | **Moderat** |
| PSI-03 | Conflictes interpersonals a l'equip | Diferències de criteri, repartiment de tasques desigual, pressions | Mittana | Lleu | **Tolerable** |
| PSI-04 | Ansietat per bloqueig tècnic | Errors difícils de resoldre que generen frustració acumulada | Alta | Lleu | **Moderat** |
| PSI-05 | Alteració del son | Treball nocturn per complir terminis | Mittana | Greu | **Moderat** |

### Mesures preventives

- Planificar el projecte amb sprints clars i tasques distribuïdes equitativament (tal com es fa amb el CSV de sprints del projecte).
- Establir horaris de treball raonables i respectar les hores de descans i son.
- Comunicar els bloqueigs tècnics a l'equip de manera immediata, sense acumular frustració en solitari.
- Celebrar les fites assolides per mantenir la motivació de l'equip.
- En cas de conflicte intern, recórrer al tutor del projecte com a mediador.
- No iniciar sessions de configuració de sistemes crítics (K8s, pipelines CI/CD) en estat de cansament elevat, ja que els errors en aquests entorns poden tenir un impacte important.

---

## 9. Riscos per treball amb components electrònics

### Descripció

El prototipatge del maquinari IoT (nodes RAK WisBlock, connexions de sensors de temperatura i humitat del sòl, divisors de tensió) implica treball amb soldadura i compostos químics en determinades fases del projecte.

### Riscos identificats

| ID | Risc | Causa | P | G | NR |
|---|---|---|---|---|---|
| ELC-01 | Inhalació de fums de soldadura | Soldadura d'estany sense ventilació adequada | Mittana | Greu | **Moderat** |
| ELC-02 | Cremades per ferro de soldar | Contacte accidental amb el ferro de soldar a ~350°C | Mittana | Lleu | **Tolerable** |
| ELC-03 | Contacte cutani amb flux de soldadura | Manipulació de pasta de soldadura sense guants | Mittana | Lleu | **Tolerable** |
| ELC-04 | Projecció d'estany fos | Soldadura en posicions incorrectes o amb massa estany | Baixa | Greu | **Tolerable** |

### Mesures preventives

- Soldar sempre en zones ben ventilades o amb extractor de fums de soldadura.
- Usar ulleres de protecció durant la soldadura per evitar projeccions.
- No deixar el ferro de soldar desatès quan està calent; usar sempre el suport corresponent.
- Rentar-se les mans després de treballar amb components electrònics i estany.
- Usar guants de làtex o nitril quan es manipuli flux de soldadura o pasta.

---

## 10. Riscos associats al treball en entorns de CPD / sala de servidors

### Descripció

L'accés a IsardVDI i als servidors físics del centre implica presència ocasional en sales de CPD (Centre de Processament de Dades) o laboratoris de racks, que presenten riscos específics.

### Riscos identificats

| ID | Risc | Causa | P | G | NR |
|---|---|---|---|---|---|
| CPD-01 | Trepitjada de cables | Cablejat de xarxa i alimentació al terra sense canalitzar | Mittana | Lleu | **Tolerable** |
| CPD-02 | Cops amb portes de rack | Obertura brusca de portes de rack de 19" | Baixa | Lleu | **Trivial** |
| CPD-03 | Caiguda d'equipament de rack | Extracció incorrecta de servidors o switches en ràcks | Baixa | Greu | **Tolerable** |
| CPD-04 | Exposició a agents extintors (CO₂) | Activació accidental o necessària del sistema d'extinció d'incendis de la sala | Baixa | Molt greu | **Moderat** |

### Mesures preventives

- No accedir a la sala de servidors sense autorització del professor o tècnic responsable.
- Canalitzar o senyalitzar els cables al terra per evitar ensopegades.
- Manipular l'equipament de rack amb dos operaris quan el pes o la mida ho requereixin.
- Conèixer la ubicació dels polsadors d'emergència i les vies d'evacuació de la sala.
- En cas d'activació del sistema d'extinció per CO₂, evacuar immediatament: el CO₂ desplaça l'oxigen i pot causar asfíxia en espais tancats.

---

## 11. Taula resum de riscos

| ID | Descripció del risc | NR |
|---|---|---|
| ERG-01 | Dolor cervical i lumbar per postura incorrecta | **Important** |
| ERG-02 | Trastorns musculoesquelètics en extremitats superiors | **Moderat** |
| ERG-03 | Mala circulació per posició asseguda prolongada | **Tolerable** |
| ERG-04 | Dolor de cap per tensió muscular | **Tolerable** |
| VIS-01 | Fatiga ocular per exposició a pantalles | **Moderat** |
| VIS-02 | Sequedat ocular per reducció del parpelleig | **Moderat** |
| VIS-03 | Mal de cap per fatiga visual | **Tolerable** |
| ELE-01 | Contacte elèctric directe | **Moderat** |
| ELE-02 | Contacte elèctric indirecte | **Tolerable** |
| ELE-03 | Curtcircuit en protoboard | **Moderat** |
| ELE-04 | Sobreescalfament de bateria | **Tolerable** |
| ELE-05 | Danys per descàrrega electrostàtica (ESD) | **Tolerable** |
| MAN-01 | Talls lleus per manipulació de connectors | **Tolerable** |
| MAN-02 | Cops per caiguda de maquinari | **Trivial** |
| MAN-03 | Pèrdua o dany de components petits | **Moderat** |
| MAN-04 | Ingestió o contacte ocular de components | **Tolerable** |
| AMB-01 | Exposició a soroll continu de ventiladors | **Tolerable** |
| AMB-02 | Estrès tèrmic lleu en sala de servidors | **Trivial** |
| AMB-03 | Deshidratació en sessions llargues | **Tolerable** |
| PSI-01 | Estrès per càrrega de treball elevada | **Important** |
| PSI-02 | Fatiga mental (burnout) | **Moderat** |
| PSI-03 | Conflictes interpersonals a l'equip | **Tolerable** |
| PSI-04 | Ansietat per bloqueig tècnic | **Moderat** |
| PSI-05 | Alteració del son per treball nocturn | **Moderat** |
| ELC-01 | Inhalació de fums de soldadura | **Moderat** |
| ELC-02 | Cremades per ferro de soldar | **Tolerable** |
| ELC-03 | Contacte cutani amb flux de soldadura | **Tolerable** |
| ELC-04 | Projecció d'estany fos | **Tolerable** |
| CPD-01 | Trepitjada de cables al terra del CPD | **Tolerable** |
| CPD-02 | Cops amb portes de rack | **Trivial** |
| CPD-03 | Caiguda d'equipament de rack | **Tolerable** |
| CPD-04 | Exposició a agents extintors (CO₂) | **Moderat** |

---

## 12. Pla de mesures preventives

### Riscos de nivell Important (acció prioritària)

| ID | Risc | Acció | Responsable | Termini |
|---|---|---|---|---|
| ERG-01 | Dolor cervical i lumbar | Ajustar mobiliari i fer pauses actives cada hora | Tot l'equip | Immediat |
| PSI-01 | Estrès per càrrega de treball | Revisar planificació de sprints i redistribuir tasques | Tot l'equip + tutor | Immediat |

### Riscos de nivell Moderat (acció en termini breu)

| ID | Risc | Acció | Responsable | Termini |
|---|---|---|---|---|
| ERG-02 | Trastorns musculoesquelètics | Ús de suports per al canell, pauses cada hora | Tot l'equip | 1 setmana |
| VIS-01 | Fatiga ocular | Aplicar regla 20-20-20, ajustar lluminositat | Tot l'equip | Immediat |
| VIS-02 | Sequedat ocular | Llàgrimes artificials si cal, ventilació adequada | Tot l'equip | 1 setmana |
| ELE-01 | Contacte elèctric directe | Protocol de treball amb maquinari desconnectat | Tot l'equip | Immediat |
| ELE-03 | Curtcircuit en protoboard | Verificació amb multímetre abans d'alimentar | Tot l'equip | Immediat |
| MAN-03 | Pèrdua de components petits | Usar safates de treball i espai ordenat | Tot l'equip | Immediat |
| PSI-02 | Fatiga mental | Establir horaris i respectar descansos | Tot l'equip | Immediat |
| PSI-04 | Ansietat per bloqueig tècnic | Comunicació oberta a l'equip, suport del tutor | Tot l'equip | Continu |
| PSI-05 | Alteració del son | Evitar sessions nocturnes de sistemes crítics | Tot l'equip | Immediat |
| ELC-01 | Inhalació de fums de soldadura | Ventilació o extractor de fums en soldadura | Tot l'equip | Abans de soldar |
| CPD-04 | Exposició a CO₂ extintors | Conèixer vies d'evacuació de la sala de servidors | Tot l'equip | 1 setmana |

---

> **Nota legal**: Aquest document s'ha elaborat amb finalitats acadèmiques en el marc del Projecte Final de cicle ASIR del curs 2025–2026 a l'ITB. No substitueix una avaluació de riscos laborals professional realitzada per un tècnic de prevenció habilitat, tal com estableix el Reial Decret 39/1997.