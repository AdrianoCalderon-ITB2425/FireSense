from flask import Flask, request, jsonify
from flask_cors import CORS
from ldap3 import Server, Connection, ALL, NTLM, MODIFY_REPLACE
from ldap3.core.exceptions import LDAPBindError, LDAPException
import psycopg2
import jwt
import os
import datetime
import hashlib

app = Flask(__name__)
CORS(app)

LDAP_HOST = os.getenv('LDAP_HOST', 'openldap')
LDAP_PORT = int(os.getenv('LDAP_PORT', 389))
LDAP_BASE = os.getenv('LDAP_BASE', 'dc=firesense,dc=io')
LDAP_ADMIN_DN = os.getenv('LDAP_ADMIN_DN', 'cn=admin,dc=firesense,dc=io')
LDAP_ADMIN_PASS = os.getenv('LDAP_ADMIN_PASSWORD', 'FireSense2026!')
JWT_SECRET = os.getenv('JWT_SECRET', 'firesense-secret-2026')
PG_HOST = os.getenv('POSTGRES_HOST', 'postgres')
PG_DB = os.getenv('POSTGRES_DB', 'firesense')
PG_USER = os.getenv('POSTGRES_USER', 'firesense')
PG_PASS = os.getenv('POSTGRES_PASSWORD', 'FireSenseDB2026!')

def get_pg():
    return psycopg2.connect(host=PG_HOST, dbname=PG_DB, user=PG_USER, password=PG_PASS)

def init_db():
    try:
        conn = get_pg()
        cur = conn.cursor()
        cur.execute('''CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(100) UNIQUE NOT NULL,
            email VARCHAR(200) UNIQUE NOT NULL,
            full_name VARCHAR(200),
            org VARCHAR(200),
            created_at TIMESTAMP DEFAULT NOW()
        )''')
        cur.execute('''CREATE TABLE IF NOT EXISTS nodes (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id),
            node_eui VARCHAR(16) UNIQUE NOT NULL,
            name VARCHAR(200),
            lat FLOAT,
            lon FLOAT,
            created_at TIMESTAMP DEFAULT NOW()
        )''')
        conn.commit()
        cur.close()
        conn.close()
        print('DB inicialitzada correctament')
    except Exception as e:
        print(f'Error DB: {e}')

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')
    if not username or not password:
        return jsonify({'error': 'Camps obligatoris'}), 400
    try:
        server = Server(LDAP_HOST, port=LDAP_PORT, get_info=ALL)
        user_dn = f'uid={username},ou=users,{LDAP_BASE}'
        conn = Connection(server, user=user_dn, password=password, auto_bind=True)
        conn.unbind()
        token = jwt.encode({
            'username': username,
            'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
        }, JWT_SECRET, algorithm='HS256')
        return jsonify({'token': token, 'username': username})
    except LDAPBindError:
        return jsonify({'error': 'Credencials incorrectes'}), 401
    except Exception as e:
        return jsonify({'error': f'Error servidor: {str(e)}'}), 500

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username', '').strip()
    password = data.get('password', '')
    email = data.get('email', '').strip()
    name = data.get('name', '').strip()
    org = data.get('org', '').strip()
    if not username or not password or not email or not name:
        return jsonify({'error': 'Camps obligatoris'}), 400
    if len(password) < 8:
        return jsonify({'error': 'Contrasenya massa curta'}), 400
    try:
        server = Server(LDAP_HOST, port=LDAP_PORT, get_info=ALL)
        conn = Connection(server, user=LDAP_ADMIN_DN, password=LDAP_ADMIN_PASS, auto_bind=True)
        user_dn = f'uid={username},ou=users,{LDAP_BASE}'
        conn.add(user_dn, ['inetOrgPerson', 'top'], {
            'uid': username,
            'cn': name,
            'sn': name.split()[-1] if ' ' in name else name,
            'mail': email,
            'userPassword': password
        })
        if conn.result['result'] != 0:
            conn.unbind()
            return jsonify({'error': 'Usuari ja existeix o error LDAP'}), 409
        conn.unbind()
        pg = get_pg()
        cur = pg.cursor()
        cur.execute('INSERT INTO users (username, email, full_name, org) VALUES (%s, %s, %s, %s)',
                    (username, email, name, org))
        pg.commit()
        cur.close()
        pg.close()
        return jsonify({'message': 'Compte creat correctament'}), 201
    except Exception as e:
        return jsonify({'error': f'Error: {str(e)}'}), 500

@app.route('/api/auth/verify', methods=['GET'])
def verify():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        return jsonify({'valid': True, 'username': payload['username']})
    except:
        return jsonify({'valid': False}), 401

@app.route('/api/nodes', methods=['GET'])
def get_nodes():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        username = payload['username']
        pg = get_pg()
        cur = pg.cursor()
        cur.execute('SELECT n.node_eui, n.name, n.lat, n.lon FROM nodes n JOIN users u ON n.user_id=u.id WHERE u.username=%s', (username,))
        nodes = [{'eui': r[0], 'name': r[1], 'lat': r[2], 'lon': r[3]} for r in cur.fetchall()]
        cur.close()
        pg.close()
        return jsonify({'nodes': nodes})
    except:
        return jsonify({'error': 'No autoritzat'}), 401

@app.route('/api/nodes', methods=['POST'])
def add_node():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        username = payload['username']
        data = request.get_json()
        node_eui = data.get('nodeId', '').upper()
        if not node_eui or len(node_eui) != 16:
            return jsonify({'error': 'Node EUI invàlid'}), 400
        pg = get_pg()
        cur = pg.cursor()
        cur.execute('SELECT id FROM users WHERE username=%s', (username,))
        user = cur.fetchone()
        if not user:
            return jsonify({'error': 'Usuari no trobat'}), 404
        cur.execute('INSERT INTO nodes (user_id, node_eui) VALUES (%s, %s)', (user[0], node_eui))
        pg.commit()
        cur.close()
        pg.close()
        return jsonify({'message': 'Node afegit correctament'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health')
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    init_db()
    app.run(host='0.0.0.0', port=5000, debug=False)
