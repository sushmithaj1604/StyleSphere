
from flask import Flask, send_from_directory, jsonify, request, session
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import os

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "style_atelier.db")

# Development secret key
app.secret_key = os.environ.get(
    "FLASK_SECRET_KEY",
    "style-atelier-development-key-change-before-deployment"
)


# =====================================
# DATABASE CONNECTION
# =====================================

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


# =====================================
# CREATE DATABASE TABLES
# =====================================

def init_db():
    conn = get_db()

    # Contact messages table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS contacts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL
        )
    """)

    # Newsletter subscribers table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS subscribers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL
        )
    """)

    # User registration table
    conn.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    conn.commit()
    conn.close()


# =====================================
# HOME PAGE
# =====================================

@app.route("/")
def home():
    return send_from_directory(BASE_DIR, "index.html")


# =====================================
# CONTACT FORM
# =====================================

@app.route("/api/contact", methods=["POST"])
def save_contact():

    data = request.get_json(silent=True) or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip()
    message = data.get("message", "").strip()

    if not name or not email or not message:
        return jsonify({
            "error": "All fields are required"
        }), 400

    conn = get_db()

    conn.execute(
        "INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)",
        (name, email, message)
    )

    conn.commit()
    conn.close()

    return jsonify({
        "message": "Contact message saved successfully!"
    })


# =====================================
# NEWSLETTER SUBSCRIPTION
# =====================================

@app.route("/api/subscribe", methods=["POST"])
def subscribe():

    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()

    if not email:
        return jsonify({
            "error": "Email is required"
        }), 400

    if "@" not in email:
        return jsonify({
            "error": "Enter a valid email"
        }), 400

    conn = get_db()

    try:
        conn.execute(
            "INSERT INTO subscribers (email) VALUES (?)",
            (email,)
        )

        conn.commit()

        return jsonify({
            "message": "Subscription successful!"
        })

    except sqlite3.IntegrityError:

        return jsonify({
            "error": "Email already subscribed"
        }), 409

    finally:
        conn.close()


# =====================================
# USER REGISTRATION
# =====================================

@app.route("/api/register", methods=["POST"])
def register():

    data = request.get_json(silent=True) or {}

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({
            "error": "All fields are required"
        }), 400

    if "@" not in email:
        return jsonify({
            "error": "Enter a valid email address"
        }), 400

    if len(password) < 8:
        return jsonify({
            "error": "Password must contain at least 8 characters"
        }), 400

    hashed_password = generate_password_hash(password)

    conn = get_db()

    try:

        conn.execute(
            """
            INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)
            """,
            (name, email, hashed_password)
        )

        conn.commit()

        return jsonify({
            "message": "Account created successfully!"
        }), 201

    except sqlite3.IntegrityError:

        return jsonify({
            "error": "Email already registered"
        }), 409

    finally:
        conn.close()


# =====================================
# USER LOGIN
# =====================================

@app.route("/api/login", methods=["POST"])
def login():

    data = request.get_json(silent=True) or {}

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    conn = get_db()

    user = conn.execute(
        "SELECT * FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    conn.close()

    if user is None or not check_password_hash(
        user["password"], password
    ):

        return jsonify({
            "error": "Invalid email or password"
        }), 401

    session.clear()

    session["user_id"] = user["id"]
    session["user_name"] = user["name"]

    return jsonify({
        "message": "Login successful!",
        "name": user["name"]
    })


# =====================================
# CHECK LOGGED-IN USER
# =====================================

@app.route("/api/me")
def current_user():

    if "user_id" not in session:

        return jsonify({
            "logged_in": False
        })

    return jsonify({
        "logged_in": True,
        "name": session["user_name"]
    })


# =====================================
# USER LOGOUT
# =====================================

@app.route("/api/logout", methods=["POST"])
def logout():

    session.clear()

    return jsonify({
        "message": "Logged out successfully!"
    })


# =====================================
# TEST BACKEND CONNECTION
# =====================================

@app.route("/api/health")
def health():

    return jsonify({
        "status": "success",
        "message": "Style Atelier backend is running!"
    })


# =====================================
# OPEN WEBSITE PAGES AND ASSETS
# =====================================

@app.route("/<path:page>")
def pages(page):

    return send_from_directory(BASE_DIR, page)


# =====================================
# RUN APPLICATION
# =====================================

if __name__ == "__main__":

    init_db()

    print("Style Atelier database initialized!")
    print("Users, contacts and subscribers tables ready!")

    app.run(debug=True, port=5000)
