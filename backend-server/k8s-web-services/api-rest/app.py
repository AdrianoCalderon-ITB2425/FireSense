"""FireSense API REST — Endpoints per a dades IoT i detecció d'anomalies."""
from flask import Flask, jsonify, request
from influxdb_client import InfluxDBClient
import os

app = Flask(__name__)

INFLUX_URL   = os.getenv("INFLUX_URL", "http://influxdb:8086")
INFLUX_TOKEN = os.getenv("INFLUX_TOKEN", "firesense-influx-token-2026")
INFLUX_ORG   = os.getenv("INFLUX_ORG", "firesense")
INFLUX_BUCKET = os.getenv("INFLUX_BUCKET", "sensors")

def get_client():
    return InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG)

@app.route("/api/health")
def health():
    return jsonify({"status": "ok", "service": "FireSense API REST"})

@app.route("/api/sensors")
def sensors():
    hours = request.args.get("hours", 24, type=int)
    limit = request.args.get("limit", 100, type=int)
    with get_client() as client:
        query = f'''
from(bucket: "{INFLUX_BUCKET}")
  |> range(start: -{hours}h)
  |> filter(fn: (r) => r._measurement == "sensor_data")
  |> sort(columns: ["_time"], desc: true)
  |> limit(n: {limit})
'''
        tables = client.query_api().query(query)
        results = []
        for table in tables:
            for record in table.records:
                results.append({
                    "time": record.get_time().isoformat(),
                    "field": record.get_field(),
                    "value": record.get_value(),
                    "device": record.values.get("dev_eui", "unknown")
                })
    return jsonify({"data": results, "count": len(results)})

@app.route("/api/sensors/latest")
def sensors_latest():
    with get_client() as client:
        query = f'''
from(bucket: "{INFLUX_BUCKET}")
  |> range(start: -3h)
  |> filter(fn: (r) => r._measurement == "sensor_data")
  |> last()
'''
        tables = client.query_api().query(query)
        results = []
        for table in tables:
            for record in table.records:
                results.append({
                    "time": record.get_time().isoformat(),
                    "field": record.get_field(),
                    "value": record.get_value(),
                    "device": record.values.get("dev_eui", "unknown")
                })
    return jsonify({"data": results, "count": len(results)})

@app.route("/api/anomalies")
def anomalies():
    hours = request.args.get("hours", 24, type=int)
    with get_client() as client:
        query = f'''
from(bucket: "{INFLUX_BUCKET}")
  |> range(start: -{hours}h)
  |> filter(fn: (r) => r._measurement == "anomalies")
  |> sort(columns: ["_time"], desc: true)
'''
        tables = client.query_api().query(query)
        results = []
        for table in tables:
            for record in table.records:
                results.append({
                    "time": record.get_time().isoformat(),
                    "field": record.get_field(),
                    "value": record.get_value(),
                    "device": record.values.get("dev_eui", "unknown")
                })
    return jsonify({"data": results, "count": len(results)})

@app.route("/api/risk")
def risk():
    with get_client() as client:
        query = f'''
from(bucket: "{INFLUX_BUCKET}")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "sensor_data")
  |> filter(fn: (r) => r._field == "soil_moisture" or r._field == "temperature")
  |> mean()
'''
        tables = client.query_api().query(query)
        metrics = {}
        for table in tables:
            for record in table.records:
                metrics[record.get_field()] = record.get_value()

        moisture = metrics.get("soil_moisture")
        temp = metrics.get("temperature")

        if moisture is None or temp is None:
            return jsonify({
                "risk_level": "SENSE_DADES",
                "color": "grey",
                "metrics": {"avg_soil_moisture": None, "avg_temperature": None}
            })

        if moisture < 15:
            level, color = "CRITIC", "red"
        elif moisture < 30:
            level, color = "ALT", "orange"
        elif moisture < 50:
            level, color = "MODERAT", "yellow"
        else:
            level, color = "BAIX", "green"

    return jsonify({
        "risk_level": level,
        "color": color,
        "metrics": {
            "avg_soil_moisture": round(moisture, 2),
            "avg_temperature": round(temp, 2)
        }
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
