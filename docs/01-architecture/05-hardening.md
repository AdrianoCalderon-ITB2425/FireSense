# FireSense — Security Hardening Guide

## 1. Sealed Secrets
```bash
# Seal a secret
kubectl create secret generic my-secret -n iot \
  --from-literal=password=mypass --dry-run=client -o yaml | \
  kubeseal --controller-name=sealed-secrets \
  --controller-namespace=kube-system --format yaml > sealed-secret.yaml
```

## 2. kube-bench CIS Audit
```bash
kubectl apply -f https://raw.githubusercontent.com/aquasecurity/kube-bench/main/job.yaml
kubectl logs -l app=kube-bench -n default
```
Results: 17 PASS, 2 FAIL (fixed), 40 WARN. Report: `backend-server/k8s-services-iot/kube-bench-report.txt`

## 3. Trivy Image Scanning
Harbor automatically scans all images with Trivy on push.
Results: 0 CRITICAL, 0 HIGH in all production images.

## 4. TLS + HSTS
- cert-manager + Let's Encrypt auto-renews certificates
- HSTS configured via Traefik middleware
- Cipher: TLS_AES_128_GCM_SHA256

## 5. RBAC
```bash
kubectl get clusterrolebindings | grep jenkins
kubectl get rolebindings -A
```

## 6. Network Policies (Calico)
```bash
kubectl get networkpolicies -A
```

## 7. Pod Security
- SecurityContext with capabilities only where needed (Samba: NET_ADMIN, SYS_ADMIN)
- Non-root containers where possible
- ReadOnlyRootFilesystem where applicable

## 8. Prometheus Auth
Basic authentication configured via Traefik middleware for Prometheus endpoint.

## 9. Pentest Results
- **nmap**: TLS valid, Let's Encrypt, port 443 only exposed
- **nikto**: nginx/1.29.4, X-Content-Type-Options nosniff configured
- Reports: `backend-server/k8s-services-iot/tests/nmap-report.txt` + `nikto-report.txt`
