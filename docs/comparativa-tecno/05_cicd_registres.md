# Comparativa: CI/CD i Registres

---

## Jenkins vs Gitea (com a CI/CD)

| Criteri | **Jenkins** | Gitea Actions |
|---|---|---|
| Llicència | MIT | MIT |
| Versió actual | 2.452.x LTS | Inclòs a Gitea 1.21+ |
| Rol principal | Servidor CI/CD dedicat | CI/CD integrat al repositori Git |
| Maduresa | Molt alta (>15 anys) | Relativament recent |
| Ecosistema de plugins | +1800 plugins oficials | Compatible amb sintaxi GitHub Actions |
| Integració amb GitHub | Webhook oficial, plugin madur | No aplica (Gitea és el repo) |
| Integració amb Harbor | Plugin oficial (docker-workflow) | Via scripts al pipeline |
| Integració amb K8s | Plugin oficial kubernetes-plugin | Via kubectl als runners |
| UI de gestió | Pròpia, molt completa | Integrada a la UI de Gitea |
| Escalabilitat | Alta (agents distribuïts) | Limitada (runners propis) |
| Corba d'aprenentatge | Mitjana-alta (Groovy/Jenkinsfile) | Baixa (YAML, similar a GitHub Actions) |
| Recursos (RAM) | ~300–600 MB | Inclòs a Gitea (~150 MB total) |

### Justificació de l'elecció: Jenkins

- **Ús del repositori a GitHub**: Com s'ha decidit a la planificació del projecte, el codi es manté a GitHub. Jenkins s'integra amb GitHub via webhooks de forma nativa i amb un plugin oficial madur, sense necessitat de migrar el codi a un altre repositori.
- **Maduresa i ecosistema**: Jenkins porta més de 15 anys sent l'estàndard de CI/CD a la indústria. Els seus plugins per a Docker, Harbor, Kubernetes i Helm estan àmpliament documentats i tenen suport actiu.
- **Pipeline com a codi**: Els Jenkinsfiles en Groovy permeten definir pipelines complexos amb stages paral·leles, condicions, rollback automàtic i notificacions, cosa que encaixa amb el pipeline complet de FireSense (build → Trivy scan → push Harbor → helm deploy).
- **Valor curricular**: Jenkins és una de les eines CI/CD més demandades al mercat laboral. El seu coneixement és directament transferible a entorns professionals, a diferència de Gitea Actions que és una eina més específica del self-hosting.
- **Separació de responsabilitats**: Mantenir el CI/CD a Jenkins separat del repositori (GitHub) segueix el principi de separació de responsabilitats i permet que el pipeline funcioni independentment de la disponibilitat del repositori.

---

## Harbor vs Distribution (Docker Registry CNCF)

| Criteri | **Harbor** | Distribution (Docker Registry) |
|---|---|---|
| Llicència | Apache 2.0 | Apache 2.0 |
| Versió actual | 2.10.x | 3.x |
| Tipus | Registre empresarial complet | Registre bàsic minimalista |
| UI web | Sí, completa | No (només API) |
| Escàner de vulnerabilitats | Trivy integrat nativament | No inclòs |
| Control d'accés (RBAC) | Sí, per projecte i usuari | Bàsic (htpasswd) |
| Autenticació LDAP/OIDC | Sí | No natiu |
| Replicació entre registres | Sí | No |
| Signatura d'imatges (Notary) | Sí | No natiu |
| Quotes per projecte | Sí | No |
| Auditoria i logs | Sí | Bàsic |
| Consum RAM | ~500 MB – 1 GB | ~20–50 MB |

### Justificació de l'elecció: Harbor

- **Escàner Trivy integrat**: La proposta de FireSense inclou expressament l'escaneig de vulnerabilitats com a part del pipeline de seguretat. Harbor inclou Trivy de forma nativa, cosa que permet escanejar cada imatge automàticament abans de desplegar-la a K8s, sense configurar integracions addicionals.
- **Control d'accés per rols (RBAC)**: Harbor permet gestionar permisos per projecte (per exemple, separar les imatges del stack MING de les de la infraestructura), amb usuaris i rols diferenciats. Docker Registry només ofereix autenticació bàsica via htpasswd.
- **Integració LDAP**: Harbor suporta autenticació contra OpenLDAP de forma nativa, cosa que encaixa amb l'estratègia de directori centralitzat del projecte. Docker Registry no té aquesta capacitat.
- **UI de gestió**: Harbor proporciona una interfície web completa per gestionar imatges, etiquetes, polítiques de retenció i resultats d'escaneig. Docker Registry és purament una API sense interfície.
- **Valor tècnic del projecte**: Harbor és una eina de nivell empresarial, part de la CNCF, utilitzada en producció en organitzacions grans. La seva inclusió a FireSense demostra un nivell de maduresa tècnica superior al d'un registre bàsic.
- **Tradeoff de recursos**: El major consum de RAM de Harbor (~500 MB–1 GB vs ~50 MB de Distribution) queda justificat per totes les funcionalitats addicionals que aporta al projecte.
