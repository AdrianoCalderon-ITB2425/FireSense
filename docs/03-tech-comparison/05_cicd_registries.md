# Comparison: CI/CD and Registries

---

## Jenkins vs Gitea (as CI/CD)

| Criterion | **Jenkins** | Gitea Actions |
|---|---|---|
| License | MIT | MIT |
| Current version | 2.452.x LTS | Included in Gitea 1.21+ |
| Main role | Dedicated CI/CD server | CI/CD integrated into the Git repository |
| Maturity | Very high (>15 years) | Relatively recent |
| Plugin ecosystem | +1800 official plugins | Compatible with GitHub Actions syntax |
| GitHub integration | Official webhook, mature plugin | N/A (Gitea is the repo) |
| Harbor integration | Official plugin (docker-workflow) | Via scripts in the pipeline |
| K8s integration | Official kubernetes-plugin | Via kubectl on runners |
| Management UI | Own, very comprehensive | Integrated into Gitea UI |
| Scalability | High (distributed agents) | Limited (own runners) |
| Learning curve | Medium-high (Groovy/Jenkinsfile) | Low (YAML, similar to GitHub Actions) |
| Resources (RAM) | ~300–600 MB | Included in Gitea (~150 MB total) |

### Justification for the choice: Jenkins

- **Use of GitHub repository**: As decided in the project planning, the code is maintained on GitHub. Jenkins integrates with GitHub via webhooks natively and with a mature official plugin, without the need to migrate the code to another repository.
- **Maturity and ecosystem**: Jenkins has been the industry standard for CI/CD for over 15 years. Its plugins for Docker, Harbor, Kubernetes, and Helm are widely documented and actively supported.
- **Pipeline as code**: Groovy Jenkinsfiles allow defining complex pipelines with parallel stages, conditions, automatic rollbacks, and notifications, which fits with the complete FireSense pipeline (build → Trivy scan → push Harbor → helm deploy).
- **Curricular value**: Jenkins is one of the most highly demanded CI/CD tools in the job market. Its knowledge is directly transferable to professional environments, unlike Gitea Actions, which is a tool more specific to self-hosting.
- **Separation of duties**: Keeping CI/CD in Jenkins separate from the repository (GitHub) follows the principle of separation of duties and allows the pipeline to function independently of the repository's availability.

---

## Harbor vs Distribution (Docker Registry CNCF)

| Criterion | **Harbor** | Distribution (Docker Registry) |
|---|---|---|
| License | Apache 2.0 | Apache 2.0 |
| Current version | 2.10.x | 3.x |
| Type | Full enterprise registry | Minimalist basic registry |
| Web UI | Yes, comprehensive | No (API only) |
| Vulnerability scanner | Natively integrated Trivy | Not included |
| Access control (RBAC) | Yes, per project and user | Basic (htpasswd) |
| LDAP/OIDC Authentication | Yes | Not native |
| Replication between registries | Yes | No |
| Image signing (Notary) | Yes | Not native |
| Quotas per project | Yes | No |
| Auditing and logs | Yes | Basic |
| RAM consumption | ~500 MB – 1 GB | ~20–50 MB |

### Justification for the choice: Harbor

- **Integrated Trivy scanner**: The FireSense proposal expressly includes vulnerability scanning as part of the security pipeline. Harbor includes Trivy natively, allowing each image to be scanned automatically before deploying it to K8s, without configuring additional integrations.
- **Role-Based Access Control (RBAC)**: Harbor allows managing permissions by project (for example, separating MING stack images from infrastructure images), with differentiated users and roles. Docker Registry only offers basic authentication via htpasswd.
- **LDAP integration**: Harbor natively supports authentication against OpenLDAP, which fits with the project's centralized directory strategy. Docker Registry does not have this capability.
- **Management UI**: Harbor provides a complete web interface to manage images, tags, retention policies, and scanning results. Docker Registry is purely an API without an interface.
- **Project's technical value**: Harbor is an enterprise-grade tool, part of the CNCF, used in production by large organizations. Its inclusion in FireSense demonstrates a higher level of technical maturity than a basic registry.
- **Resource tradeoff**: Harbor's higher RAM consumption (~500 MB–1 GB vs ~50 MB for Distribution) is justified by all the additional features it brings to the project.