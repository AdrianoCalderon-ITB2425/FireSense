# Comparativa: Virtualización (Cloud Privada)

---

## IsardVDI vs AWS/ISARD

| Criterio | **IsardVDI** | AWS (EC2 / EKS) |
|---|---|---|
| Tipo | Plataforma de virtualización on-premises | Cloud pública de terceros |
| Licencia | AGPL 3.0 (open source) | Propietario (pago por uso) |
| Coste | Gratuito (self-hosted) | De pago (instancias, almacenamiento, tráfico) |
| Control de la infraestructura | Total | Limitado (abstracción del proveedor) |
| Dependencia de internet | No | Sí |
| Latencia de red interna | Mínima (red local) | Variable (depende de la región) |
| Escalabilidad | Limitada por hardware disponible | Prácticamente ilimitada |
| Privacidad de datos | Total (datos en local) | Sujeta a políticas de AWS |
| Disponibilidad en el centro educativo | Sí (ITB dispone de IsardVDI) | Requiere cuenta y tarjeta de crédito |
| Adecuación al proyecto académico | Alta | Media (coste y complejidad añadidos) |

### Justificación de elección: IsardVDI

- **Disponibilidad en el entorno educativo**: El Institut Tecnològic de Barcelona dispone de IsardVDI como plataforma de virtualización institucional. Esto elimina cualquier dependencia de cuentas externas, tarjetas de crédito o costes variables.
- **Coste cero**: AWS genera costes por uso de instancias, almacenamiento y transferencia de datos. Para un proyecto académico, esto añade una barrera innecesaria y un riesgo de costes no controlados.
- **Control total de la infraestructura**: IsardVDI permite controlar completamente la configuración de las VMs (CPU, RAM, red, almacenamiento), lo que es esencial para configurar correctamente el clúster K8s con los recursos necesarios.
- **Trabajo offline**: IsardVDI funciona en la red local del centro, sin dependencia de conectividad a internet. Esto garantiza que el proyecto se puede desarrollar y demostrar en cualquier condición.
- **Objetivo pedagógico**: Gestionar la virtualización on-premises forma parte del currículo de ASIR, aportando valor adicional al proyecto frente al uso de una plataforma cloud gestionada que abstrae la infraestructura.

---

# Comparativa: Inteligencia Artificial / Machine Learning

## scikit-learn vs PyTorch

| Criterio | **scikit-learn** | PyTorch |
|---|---|---|
| Licencia | BSD 3-Clause | BSD 3-Clause |
| Versión actual | 1.4.x | 2.x |
| Orientación | ML clásico (algoritmos estadísticos) | Deep Learning (redes neuronales) |
| Caso de uso en FireSense | Detección de anomalías (Isolation Forest) | Modelos de deep learning complejos |
| Consumo de recursos | Muy bajo (~50–100 MB) | Alto (~500 MB – varios GB con GPU) |
| Curva de aprendizaje | Baja-media | Alta |
| API | Simple y consistente | Flexible pero más compleja |
| Algoritmo Isolation Forest | Implementación oficial optimizada | No incluido nativamente |
| Ejecución en CPU | Eficiente | Posible, pero diseñado para GPU |
| Tiempo de entrenamiento | Muy rápido para datasets pequeños | Requiere más datos y tiempo |
| Despliegue como CronJob K8s | Imagen Docker muy ligera | Imagen Docker pesada |

### Justificación de elección: scikit-learn

- **Algoritmo correcto para el caso de uso**: La propuesta de FireSense especifica el uso de **Isolation Forest** para la detección de anomalías térmicas. Scikit-learn tiene una implementación oficial, optimizada y bien documentada de Isolation Forest. PyTorch no incluye este algoritmo nativamente y requeriría implementarlo desde cero.
- **Recursos adecuados para el entorno**: Scikit-learn ejecuta modelos de ML clásico eficientemente en CPU con consumo de memoria mínimo. PyTorch está diseñado principalmente para deep learning con GPU, lo que lo hace innecesariamente pesado para un modelo de detección de anomalías sobre series temporales de sensores.
- **Adecuación al volumen de datos**: Los datos de FireSense (temperatura y humedad de un número reducido de nodos RAK WisBlock) son un dataset pequeño. Los modelos de deep learning de PyTorch requieren grandes volúmenes de datos para ser efectivos; Isolation Forest de scikit-learn funciona correctamente con datasets pequeños.
- **Despliegue como CronJob**: El modelo se ejecuta como CronJob en K8s. Una imagen Docker con scikit-learn pesa ~200–300 MB frente a los múltiples GB que puede pesar una imagen con PyTorch. Esto reduce significativamente el impacto en el clúster.

---

# Comparativa: Servicios Auxiliares y del Sistema

## Postfix vs Exim

| Criterio | **Postfix** | Exim |
|---|---|---|
| Licencia | IPL / Eclipse (libre) | GPL 2.0 |
| Versión actual | 3.8.x | 4.97.x |
| Arquitectura | Modular (múltiples procesos pequeños) | Monolítica |
| Seguridad | Diseñado con seguridad como prioridad | Buena, pero más historial de CVEs críticos |
| Configuración | main.cf / master.cf, bien documentado | Fichero único acl, más complejo |
| Uso como relay SMTP | Sí, muy común | Sí |
| Integración con Grafana Alerting | Sí (SMTP relay) | Sí |
| Cuota de uso en servidores Linux | ~33% de los servidores de internet | ~57% (mayoritariamente en sistemas cPanel) |
| Curva de aprendizaje | Media | Alta |
| Documentación | Extensa | Extensa |

### Justificación de elección: Postfix

- **Caso de uso específico**: En FireSense, Postfix actúa como **relay SMTP** para enviar alertas desde Grafana Alerting y Node-RED. Para esta función, Postfix es la elección más documentada y directa en entornos Linux.
- **Seguridad**: Postfix fue diseñado desde sus orígenes con la seguridad como principio fundamental (principio de mínimo privilegio, separación de procesos). Históricamente ha tenido menos CVEs críticos que Exim.
- **Simplicidad para el caso de uso**: La configuración de Postfix como relay SMTP es muy directa y está ampliamente documentada para integraciones con Grafana y sistemas de alertas.

---

## Samba vs NFS

| Criterio | **Samba** | NFS |
|---|---|---|
| Licencia | GPL 3.0 | Integrado en el kernel Linux |
| Protocolo | SMB/CIFS (protocolo de Windows) | NFS (protocolo Unix/Linux) |
| Compatibilidad con Windows | Total | Limitada (cliente NFS en Windows es básico) |
| Compatibilidad con Linux | Sí | Nativa |
| Autenticación | Usuario/contraseña, integración LDAP/AD | Basada en IP/host, menos granular |
| Casos de uso | Interoperabilidad Windows-Linux | Compartir ficheros entre sistemas Linux |
| Rendimiento en red local | Bueno | Muy alto |
| Configuración | Media | Simple |

### Justificación de elección: Samba

- **Interoperabilidad con Windows**: La propuesta de FireSense especifica expresamente "Samba per a interoperabilitat amb Windows". En un entorno donde los agentes forestales pueden usar estaciones Windows para acceder a informes o datos, Samba es imprescindible. NFS tiene soporte muy limitado en Windows.
- **Integración con LDAP**: Samba puede integrarse con OpenLDAP para autenticación centralizada, lo que encaja con la estrategia de directorio único del proyecto.

---

## rsync vs Rclone

| Criterio | **rsync** | Rclone |
|---|---|---|
| Licencia | GPL 3.0 | MIT |
| Versión actual | 3.2.x | 1.6x.x |
| Protocolo propio | Sí (rsync protocol, delta sync) | No (usa APIs de cada proveedor) |
| Destinos soportados | Local, SSH/SFTP | +70 backends (S3, GCS, Azure, SFTP, local...) |
| Transferencia incremental (delta) | Sí, muy eficiente | Sí (pero sin delta real en almacenamiento en bloque) |
| Caso de uso principal | Backups locales y via SSH | Sincronización con cloud storage |
| Compresión en tránsito | Sí | Depende del backend |
| Integración con scripts | Muy simple | Simple |
| Uso en CronJobs K8s | Imagen Docker ligera | Imagen Docker disponible |

### Justificación de elección: rsync

- **Caso de uso local**: Los backups de FireSense (InfluxDB, MongoDB) se realizan entre nodos del clúster K8s via SSH, que es exactamente el escenario para el que rsync está optimizado. Su algoritmo de transferencia delta reduce al mínimo el tráfico de red al copiar solo los bloques que han cambiado.
- **Simplicidad y madurez**: rsync es una herramienta Unix de referencia, con décadas de uso en producción para backups. Su integración en scripts de CronJob K8s es trivial.
- **Sin dependencias de cloud**: Rclone destaca cuando el destino es almacenamiento en la nube (S3, GCS, Backblaze...). Como FireSense no usa cloud (todo es on-premises en IsardVDI), las capacidades adicionales de Rclone no aportan valor.

---

## SSH (OpenSSH) vs Dropbear SSH

| Criterio | **OpenSSH** | Dropbear SSH |
|---|---|---|
| Licencia | BSD / MIT | MIT |
| Versión actual | 9.x | 2022.x |
| Funcionalidades | Completas (SSH, SCP, SFTP, port forwarding, agent...) | Reducidas (SSH cliente/servidor básico) |
| Consumo de recursos | Bajo (~5–10 MB) | Muy bajo (~110 KB binario) |
| Caso de uso principal | Servidores de propósito general | Sistemas embebidos, routers, IoT con recursos mínimos |
| Soporte de claves | RSA, ECDSA, Ed25519 | RSA, ECDSA, Ed25519 |
| SFTP incluido | Sí | Opcional (sftp-server separado) |
| Port forwarding | Sí | Sí (limitado) |
| Estándar en distribuciones Linux | Sí, incluido por defecto | No |

### Justificación de elección: OpenSSH

- **Estándar en Linux**: OpenSSH viene instalado por defecto en todas las distribuciones Linux modernas (Ubuntu, Debian, Rocky...). No requiere instalación adicional en las VMs de IsardVDI.
- **Funcionalidades necesarias**: FireSense usa SSH no solo para acceso remoto sino también para backups cifrados via rsync/SSH y para la gestión remota del clúster. OpenSSH soporta todas estas funciones de forma nativa.
- **Dropbear para sistemas embebidos**: Dropbear está diseñado para sistemas con recursos extremadamente limitados como routers y dispositivos IoT con pocos KB de RAM. En las VMs de IsardVDI con 4 GB de RAM, el ahorro de recursos de Dropbear es irrelevante.
- **Seguridad y actualizaciones**: OpenSSH tiene un ciclo de actualizaciones activo y es el cliente/servidor SSH más auditado del mundo.
