# Comparativa: Virtualització (Cloud Privada)

---

## IsardVDI vs AWS/ISARD

| Criteri | **IsardVDI** | AWS (EC2 / EKS) |
|---|---|---|
| Tipus | Plataforma de virtualització on-premises | Cloud pública de tercers |
| Llicència | AGPL 3.0 (open source) | Propietari (pagament per ús) |
| Cost | Gratuït (self-hosted) | De pagament (instàncies, emmagatzematge, trànsit) |
| Control de la infraestructura | Total | Limitat (abstracció del proveïdor) |
| Dependència d'internet | No | Sí |
| Latència de xarxa interna | Mínima (xarxa local) | Variable (depèn de la regió) |
| Escalabilitat | Limitada per maquinari disponible | Pràcticament il·limitada |
| Privacitat de dades | Total (dades en local) | Subjecta a polítiques d'AWS |
| Disponibilitat al centre educatiu | Sí (ITB disposa d'IsardVDI) | Requereix compte i targeta de crèdit |
| Adequació al projecte acadèmic | Alta | Mitjana (cost i complexitat afegits) |

### Justificació de l'elecció: IsardVDI

- **Disponibilitat a l'entorn educatiu**: L'Institut Tecnològic de Barcelona disposa d'IsardVDI com a plataforma de virtualització institucional. Això elimina qualsevol dependència de comptes externs, targetes de crèdit o costos variables.
- **Cost zero**: AWS genera costos per ús d'instàncies, emmagatzematge i transferència de dades. Per a un projecte acadèmic, això afegeix una barrera innecessària i un risc de costos no controlats.
- **Control total de la infraestructura**: IsardVDI permet controlar completament la configuració de les VMs (CPU, RAM, xarxa, emmagatzematge), cosa que és essencial per configurar correctament el clúster K8s amb els recursos necessaris.
- **Treball offline**: IsardVDI funciona a la xarxa local del centre, sense dependència de connectivitat a internet. Això garanteix que el projecte es pot desenvolupar i demostrar en qualsevol condició.
- **Objectiu pedagògic**: Gestionar la virtualització on-premises forma part del currículum d'ASIR, aportant valor addicional al projecte enfront de l'ús d'una plataforma cloud gestionada que abstreu la infraestructura.

---

# Comparativa: Intel·ligència Artificial / Machine Learning

## scikit-learn vs PyTorch

| Criteri | **scikit-learn** | PyTorch |
|---|---|---|
| Llicència | BSD 3-Clause | BSD 3-Clause |
| Versió actual | 1.4.x | 2.x |
| Orientació | ML clàssic (algorismes estadístics) | Deep Learning (xarxes neuronals) |
| Cas d'ús a FireSense | Detecció d'anomalies (Isolation Forest) | Models de deep learning complexos |
| Consum de recursos | Molt baix (~50–100 MB) | Alt (~500 MB – diversos GB amb GPU) |
| Corba d'aprenentatge | Baixa-mitjana | Alta |
| API | Simple i consistent | Flexible però més complexa |
| Algorisme Isolation Forest | Implementació oficial optimitzada | No inclòs nativament |
| Execució en CPU | Eficient | Possible, però dissenyat per a GPU |
| Temps d'entrenament | Molt ràpid per a datasets petits | Requereix més dades i temps |
| Desplegament com a CronJob K8s | Imatge Docker molt lleugera | Imatge Docker pesada |

### Justificació de l'elecció: scikit-learn

- **Algorisme correcte per al cas d'ús**: La proposta de FireSense especifica l'ús d'**Isolation Forest** per a la detecció d'anomalies tèrmiques. Scikit-learn té una implementació oficial, optimitzada i ben documentada d'Isolation Forest. PyTorch no inclou aquest algorisme nativament i requeriria implementar-lo des de zero.
- **Recursos adequats per a l'entorn**: Scikit-learn executa models de ML clàssic eficientment en CPU amb un consum de memòria mínim. PyTorch està dissenyat principalment per a deep learning amb GPU, cosa que el fa innecessàriament pesat per a un model de detecció d'anomalies sobre sèries temporals de sensors.
- **Adequació al volum de dades**: Les dades de FireSense (temperatura i humitat d'un nombre reduït de nodes RAK WisBlock) són un dataset petit. Els models de deep learning de PyTorch requereixen grans volums de dades per ser efectius; Isolation Forest de scikit-learn funciona correctament amb datasets petits.
- **Desplegament com a CronJob**: El model s'executa com a CronJob a K8s. Una imatge Docker amb scikit-learn pesa ~200–300 MB enfront dels múltiples GB que pot pesar una imatge amb PyTorch. Això redueix significativament l'impacte al clúster.

---

# Comparativa: Serveis Auxiliars i del Sistema

## Postfix vs Exim

| Criteri | **Postfix** | Exim |
|---|---|---|
| Llicència | IPL / Eclipse (lliure) | GPL 2.0 |
| Versió actual | 3.8.x | 4.97.x |
| Arquitectura | Modular (múltiples processos petits) | Monolítica |
| Seguretat | Dissenyat amb seguretat com a prioritat | Bona, però més historial de CVEs crítics |
| Configuració | main.cf / master.cf, ben documentat | Fitxer únic acl, més complex |
| Ús com a relay SMTP | Sí, molt comú | Sí |
| Integració amb Grafana Alerting | Sí (SMTP relay) | Sí |
| Quota d'ús a servidors Linux | ~33% dels servidors d'internet | ~57% (majoritàriament en sistemes cPanel) |
| Corba d'aprenentatge | Mitjana | Alta |
| Documentació | Extensa | Extensa |

### Justificació de l'elecció: Postfix

- **Cas d'ús específic**: A FireSense, Postfix actua com a **relay SMTP** per enviar alertes des de Grafana Alerting i Node-RED. Per a aquesta funció, Postfix és l'elecció més documentada i directa en entorns Linux.
- **Seguretat**: Postfix va ser dissenyat des dels seus orígens amb la seguretat com a principi fonamental (principi de mínim privilegi, separació de processos). Històricament ha tingut menys CVEs crítics que Exim.
- **Simplicitat per al cas d'ús**: La configuració de Postfix com a relay SMTP és molt directa i està àmpliament documentada per a integracions amb Grafana i sistemes d'alertes.

---

## Samba vs NFS

| Criteri | **Samba** | NFS |
|---|---|---|
| Llicència | GPL 3.0 | Integrat al kernel Linux |
| Protocol | SMB/CIFS (protocol de Windows) | NFS (protocol Unix/Linux) |
| Compatibilitat amb Windows | Total | Limitada (client NFS a Windows és bàsic) |
| Compatibilitat amb Linux | Sí | Nativa |
| Autenticació | Usuari/contrasenya, integració LDAP/AD | Basada en IP/host, menys granular |
| Casos d'ús | Interoperabilitat Windows-Linux | Compartir fitxers entre sistemes Linux |
| Rendiment en xarxa local | Bo | Molt alt |
| Configuració | Mitjana | Simple |

### Justificació de l'elecció: Samba

- **Interoperabilitat amb Windows**: La proposta de FireSense especifica expressament "Samba per a interoperabilitat amb Windows". En un entorn on els agents forestals poden usar estacions Windows per accedir a informes o dades, Samba és imprescindible. NFS té suport molt limitat a Windows.
- **Integració amb LDAP**: Samba pot integrar-se amb OpenLDAP per a autenticació centralitzada, cosa que encaixa amb l'estratègia de directori únic del projecte.

---

## rsync vs Rclone

| Criteri | **rsync** | Rclone |
|---|---|---|
| Llicència | GPL 3.0 | MIT |
| Versió actual | 3.2.x | 1.6x.x |
| Protocol propi | Sí (rsync protocol, delta sync) | No (usa APIs de cada proveïdor) |
| Destinacions suportades | Local, SSH/SFTP | +70 backends (S3, GCS, Azure, SFTP, local...) |
| Transferència incremental (delta) | Sí, molt eficient | Sí (però sense delta real en emmagatzematge en bloc) |
| Cas d'ús principal | Backups locals i via SSH | Sincronització amb cloud storage |
| Compressió en trànsit | Sí | Depèn del backend |
| Integració amb scripts | Molt simple | Simple |
| Ús en CronJobs K8s | Imatge Docker lleugera | Imatge Docker disponible |

### Justificació de l'elecció: rsync

- **Cas d'ús local**: Els backups de FireSense (InfluxDB, MongoDB) es realitzen entre nodes del clúster K8s via SSH, que és exactament l'escenari per al qual rsync està optimitzat. El seu algorisme de transferència delta redueix al mínim el trànsit de xarxa en copiar només els blocs que han canviat.
- **Simplicitat i maduresa**: rsync és una eina Unix de referència, amb dècades d'ús en producció per a backups. La seva integració en scripts de CronJob K8s és trivial.
- **Sense dependències de cloud**: Rclone destaca quan la destinació és emmagatzematge al núvol (S3, GCS, Backblaze...). Com que FireSense no usa cloud (tot és on-premises a IsardVDI), les capacitats addicionals de Rclone no aporten valor.

---

## SSH (OpenSSH) vs Dropbear SSH

| Criteri | **OpenSSH** | Dropbear SSH |
|---|---|---|
| Llicència | BSD / MIT | MIT |
| Versió actual | 9.x | 2022.x |
| Funcionalitats | Completes (SSH, SCP, SFTP, port forwarding, agent...) | Reduïdes (SSH client/servidor bàsic) |
| Consum de recursos | Baix (~5–10 MB) | Molt baix (~110 KB binari) |
| Cas d'ús principal | Servidors de propòsit general | Sistemes encastats, routers, IoT amb recursos mínims |
| Suport de claus | RSA, ECDSA, Ed25519 | RSA, ECDSA, Ed25519 |
| SFTP inclòs | Sí | Opcional (sftp-server separat) |
| Port forwarding | Sí | Sí (limitat) |
| Estàndard a distribucions Linux | Sí, inclòs per defecte | No |

### Justificació de l'elecció: OpenSSH

- **Estàndard a Linux**: OpenSSH ve instal·lat per defecte a totes les distribucions Linux modernes (Ubuntu, Debian, Rocky...). No requereix instal·lació addicional a les VMs d'IsardVDI.
- **Funcionalitats necessàries**: FireSense usa SSH no només per a accés remot sinó també per a backups xifrats via rsync/SSH i per a la gestió remota del clúster. OpenSSH suporta totes aquestes funcions de forma nativa.
- **Dropbear per a sistemes encastats**: Dropbear està dissenyat per a sistemes amb recursos extremadament limitats com routers i dispositius IoT amb pocs KB de RAM. A les VMs d'IsardVDI amb 4 GB de RAM, l'estalvi de recursos de Dropbear és irrellevant.
- **Seguretat i actualitzacions**: OpenSSH té un cicle d'actualitzacions actiu i és el client/servidor SSH més auditat del món.
