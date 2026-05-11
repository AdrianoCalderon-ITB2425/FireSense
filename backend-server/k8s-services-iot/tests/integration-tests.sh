#!/bin/bash
BASE_URL="https://93d92c4a-e3bf-4ea6-93c6.afab44153cac.isard.nuvulet.itb.cat"
PASS=0
FAIL=0

check() {
    local name=$1
    local expected=$2
    local actual=$3
    if [ "$actual" = "$expected" ]; then
        echo "OK $name"
        PASS=$((PASS+1))
    else
        echo "FAIL $name (esperado: $expected, obtenido: $actual)"
        FAIL=$((FAIL+1))
    fi
}

echo "======================================"
echo "FireSense - Tests d'integracio"
echo "======================================"

echo ""
echo "--- Serveis Web ---"
check "Web publica" "200" $(curl -sk -o /dev/null -w "%{http_code}" $BASE_URL/FireSense/)
check "Login page" "200" $(curl -sk -o /dev/null -w "%{http_code}" $BASE_URL/FireSense/login.html)
check "Dashboard" "200" $(curl -sk -o /dev/null -w "%{http_code}" $BASE_URL/FireSense/index.html)

echo ""
echo "--- API Auth Service ---"
check "Auth login admin" "200" $(curl -sk -o /dev/null -w "%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"ADMIN_PASSWORD_HERE"}' \
    $BASE_URL/fsapi/api/auth/login)
check "Auth verify sense token" "401" $(curl -sk -o /dev/null -w "%{http_code}" \
    $BASE_URL/fsapi/api/auth/verify)

echo ""
echo "--- Serveis IoT ---"
check "ChirpStack UI" "200" $(curl -sk -o /dev/null -w "%{http_code}" $BASE_URL/chirpstack)
check "Grafana UI" "302" $(curl -sk -o /dev/null -w "%{http_code}" $BASE_URL/grafana)
check "Node-RED UI" "200" $(curl -sk -o /dev/null -w "%{http_code}" $BASE_URL/nodered/)

echo ""
echo "--- Infraestructura ---"
check "Harbor Registry" "200" $(curl -sk -o /dev/null -w "%{http_code}" $BASE_URL/harbor)
check "Jenkins CI/CD" "403" $(curl -sk -o /dev/null -w "%{http_code}" $BASE_URL/jenkins/)

echo ""
echo "--- K8s Cluster ---"
echo "Pods en error:"
kubectl get pods -A | grep -v "Running\|Completed\|NAME" || echo "Cap pod en error"

echo ""
echo "--- HPA Status ---"
kubectl get hpa -n iot

echo ""
echo "--- TLS ---"
CERT=$(echo | openssl s_client -connect 93d92c4a-e3bf-4ea6-93c6.afab44153cac.isard.nuvulet.itb.cat:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null | grep notAfter | cut -d= -f2)
echo "Certificat TLS expira: $CERT"

echo ""
echo "======================================"
echo "RESULTAT: $PASS passed, $FAIL failed"
echo "======================================"
