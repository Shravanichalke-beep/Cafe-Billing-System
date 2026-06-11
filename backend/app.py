import os
from flask import Flask, jsonify
from flask_cors import CORS
from models import db
from routes.auth import auth_bp
from routes.tables import tables_bp
from routes.menu import menu_bp
from routes.orders import orders_bp
from routes.bills import bills_bp

app = Flask(__name__)
CORS(app)

# Database config
basedir = os.path.abspath(os.path.dirname(__file__))

# Use PostgreSQL from DATABASE_URL if available, otherwise fallback to SQLite
database_url = os.environ.get('DATABASE_URL')
if database_url and database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config['SQLALCHEMY_DATABASE_URI'] = database_url or ('sqlite:///' + os.path.join(basedir, 'database.db'))
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# JWT config
app.config['JWT_SECRET_KEY'] = os.environ.get(
    'JWT_SECRET_KEY',
    'cafe_super_secret_key'
)

db.init_app(app)

# Create database tables (works on Render and locally)
with app.app_context():
    db.create_all()

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(tables_bp, url_prefix='/api/tables')
app.register_blueprint(menu_bp, url_prefix='/api/menu')
app.register_blueprint(orders_bp, url_prefix='/api/orders')
app.register_blueprint(bills_bp, url_prefix='/api/bills')

@app.route('/')
def index():
    return jsonify({"message": "Welcome to Cafe Billing API"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)