#!/bin/bash
# scripts/generate-mqtt-passwd.sh

cd mqtt

# Crear archivo passwd vacío
touch passwd
chmod 600 passwd

# Generar usuarios MQTT
echo "Generando credenciales MQTT..."

# Usuario para Meshtastic
mosquitto_passwd -b passwd meshtastic_user pirineus

# Usuario para Node-RED
mosquitto_passwd -b passwd node_red_user pirineus

# Usuario para monitoreo
mosquitto_passwd -b passwd monitor_user pirineus

echo "Archivo mqtt/passwd generado"
cat passwd