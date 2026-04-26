# Comparativa: Xarxes i Enrutament

---

## Nginx Ingress Controller vs Traefik

| Criteri | **Nginx Ingress Controller** | Traefik |
|---|---|---|
| Llicència | Apache 2.0 | MIT |
| Versió actual | 1.10.x | v3.x |
| Base tecnològica | Nginx (C) | Go |
| Maduresa a K8s | Molt alta, Ingress de referència | Alta, especialment a K3s |
| Configuració | Annotations + ConfigMaps | CRDs propis (IngressRoute) + annotations |
| TLS automàtic (cert-manager) | Sí, molt documentat | Sí, també compatible |
| Rate limiting | Sí, natiu via annotations | Sí, via middlewares |
| Autenticació bàsica | Sí | Sí |
| Dashboard | No (requereix eines externes) | Sí, inclòs |
| Rendiment sota alta càrrega | Molt alt (motor Nginx en C) | Alt (Go) |
| Documentació K8s | Extensa, és l'Ingress per defecte a moltes guies | Bona |
| Per defecte a | kubeadm (no, cal instal·lar-lo) | K3s (inclòs per defecte) |

### Justificació de l'elecció: Nginx Ingress Controller

- **Estàndard de referència a K8s vanilla**: En usar K8s amb kubeadm (no K3s), no s'inclou cap Ingress Controller per defecte. Nginx Ingress Controller és el més documentat i utilitzat en aquesta configuració, amb guies oficials de Kubernetes apuntant-hi.
- **Maduresa i estabilitat**: Nginx Ingress Controller porta anys sent el controlador de referència a Kubernetes. El seu comportament amb TLS, rate limiting i autenticació està àmpliament provat i documentat.
- **Integració amb cert-manager**: La combinació Nginx Ingress + cert-manager per a TLS automàtic és la configuració més documentada de l'ecosistema K8s, cosa que facilita la implementació del TLS requerit per la proposta.
- **Traefik i K3s**: Traefik és l'opció natural quan s'utilitza K3s, perquè ve inclòs. Com que FireSense usa K8s vanilla, instal·lar Traefik requereix la mateixa quantitat de feina que Nginx, sense avantatge addicional.
- **Rendiment**: El motor de Nginx està escrit en C i té un rendiment sota alta càrrega superior al de Traefik (Go), tot i que per al volum de trànsit de FireSense tots dos serien més que suficients.

---

## CoreDNS vs PowerDNS

| Criteri | **CoreDNS** | PowerDNS |
|---|---|---|
| Llicència | Apache 2.0 | GPL 2.0 |
| Versió actual | 1.11.x | 4.x |
| Integració a K8s | Component natiu del Control Plane | Extern, requereix configuració addicional |
| Funció a K8s | Resolució DNS interna de serveis i pods | DNS de propòsit general |
| Configuració | Corefile (simple) | Múltiples backends (MySQL, PostgreSQL...) |
| Consum RAM | ~50–100 MB | ~100–200 MB |
| Plugins | Extensible via plugins en Go | Backends i mòduls |
| Ús típic | DNS intern de K8s | DNS autoritatiu de xarxa empresarial |

### Justificació de l'elecció: CoreDNS

- **Component natiu de K8s**: CoreDNS és el servidor DNS que kubeadm instal·la automàticament com a part del Control Plane de Kubernetes. No és una elecció opcional a K8s vanilla: és el component estàndard per a la resolució DNS interna del clúster (resolució de noms de serveis com `grafana.monitoring.svc.cluster.local`).
- **Sense necessitat de configuració addicional**: En ser un component del clúster, CoreDNS ja està funcionant després de la instal·lació amb kubeadm. PowerDNS és un servidor DNS de propòsit general que requeriria configuració addicional sense aportar avantatges en el context d'un clúster K8s.
- **Casos d'ús diferents**: CoreDNS gestiona el DNS intern del clúster. PowerDNS està dissenyat per ser un servidor DNS autoritatiu de xarxa amb múltiples zones i backends, cosa que va més enllà de les necessitats de FireSense.

---

## ISC DHCP vs Kea DHCP

| Criteri | **ISC DHCP** | Kea DHCP |
|---|---|---|
| Llicència | MPL 2.0 | Apache 2.0 |
| Versió actual | 4.4.x | 2.6.x |
| Estat | Manteniment (EoL previst 2026) | Successor actiu d'ISC DHCP |
| Arquitectura | Monolítica | Modular, amb API REST |
| Configuració | Fitxer dhcpd.conf (text pla) | JSON + base de dades opcional |
| Suport IPv6 | Sí | Sí (millor suport) |
| Alta disponibilitat | Failover bàsic | HA natiu més modern |
| Consum RAM | ~20–50 MB | ~30–70 MB |
| Documentació | Extensa (dècades) | Bona i creixent |
| Corba d'aprenentatge | Baixa (molt conegut) | Mitjana |

### Justificació de l'elecció: ISC DHCP

- **Familiaritat i documentació**: ISC DHCP és el servidor DHCP més conegut al món Linux/Unix, amb dècades de documentació i exemples. En un projecte de laboratori educatiu, la facilitat de configuració i l'abundància de documentació són factors clau.
- **Simplicitat per al cas d'ús**: ISC DHCP s'utilitza a FireSense únicament per al segment IoT (assignació d'IPs al gateway LoRaWAN i nodes). És una tasca simple que no requereix les capacitats avançades de Kea (API REST, base de dades, HA).
- **Nota**: ISC DHCP té previst el seu End of Life l'any 2026 i la ISF recomana migrar a Kea. Per a un projecte en producció a llarg termini, Kea seria l'elecció correcta. En el context d'aquest projecte acadèmic, ISC DHCP és perfectament vàlid i la seva configuració és més directa.
