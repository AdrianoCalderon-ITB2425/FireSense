"""Isolation Forest — Detecció d'anomalies en dades de sensors FireSense."""
import os
import numpy as np
from datetime import datetime, timezone
from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS
from sklearn.ensemble import IsolationForest

INFLUX_URL    = os.getenv("INFLUX_URL", "http://influxdb:8086")
INFLUX_TOKEN  = os.getenv("INFLUX_TOKEN", "INFLUXDB_TOKEN_HERE")
INFLUX_ORG    = os.getenv("INFLUX_ORG", "firesense")
INFLUX_BUCKET = os.getenv("INFLUX_BUCKET", "sensors")

def run():
    print(f"[{datetime.now()}] Iniciant deteccio d'anomalies...")
    with InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG) as client:
        # Llegir dades de les ultimes 24h
        query = f'''
from(bucket: "{INFLUX_BUCKET}")
  |> range(start: -24h)
  |> filter(fn: (r) => r._measurement == "sensor_data")
  |> filter(fn: (r) => r._field == "temperature" or r._field == "soil_moisture")
  |> pivot(rowKey: ["_time", "dev_eui"], columnKey: ["_field"], valueColumn: "_value")
'''
        tables = client.query_api().query(query)
        rows = []
        for table in tables:
            for record in table.records:
                temp = record.values.get("temperature")
                moisture = record.values.get("soil_moisture")
                if temp is not None and moisture is not None:
                    rows.append({
                        "time": record.get_time(),
                        "temperature": temp,
                        "soil_moisture": moisture,
                        "dev_eui": record.values.get("dev_eui", "unknown")
                    })

        if len(rows) < 10:
            print(f"Poques dades ({len(rows)} punts). Minim 10 per executar el model.")
            return

        X = np.array([[r["temperature"], r["soil_moisture"]] for r in rows])

        # Isolation Forest
        model = IsolationForest(
            n_estimators=100,
            contamination=0.05,
            random_state=42
        )
        predictions = model.fit_predict(X)
        scores = model.score_samples(X)

        # Escriure anomalies a InfluxDB
        write_api = client.write_api(write_options=SYNCHRONOUS)
        anomaly_count = 0
        for i, (row, pred, score) in enumerate(zip(rows, predictions, scores)):
            is_anomaly = pred == -1
            point = (
                Point("anomalies")
                .tag("dev_eui", row["dev_eui"])
                .tag("is_anomaly", str(is_anomaly))
                .field("anomaly_score", float(score))
                .field("temperature", row["temperature"])
                .field("soil_moisture", row["soil_moisture"])
                .field("is_anomaly", int(is_anomaly))
                .time(row["time"], WritePrecision.NANOSECONDS)
            )
            write_api.write(bucket=INFLUX_BUCKET, org=INFLUX_ORG, record=point)
            if is_anomaly:
                anomaly_count += 1
                print(f"  ANOMALIA: t={row['time']} temp={row['temperature']:.1f} moisture={row['soil_moisture']:.1f} score={score:.3f}")

        print(f"[{datetime.now()}] Analitzats {len(rows)} punts. Anomalies: {anomaly_count}")

if __name__ == "__main__":
    run()
