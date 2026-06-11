from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='Staff') # Admin, Staff

class Table(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    table_number = db.Column(db.Integer, unique=True, nullable=False)
    status = db.Column(db.String(20), nullable=False, default='Available') # Available, Occupied, Bill Pending

class MenuItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(50), nullable=False)
    price = db.Column(db.Float, nullable=False)
    is_available = db.Column(db.Boolean, default=True)
    image_url = db.Column(db.String(255), nullable=True)

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    table_id = db.Column(db.Integer, db.ForeignKey('table.id'), nullable=False)
    status = db.Column(db.String(20), nullable=False, default='Pending') # Pending, Completed, Cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    table = db.relationship('Table', backref=db.backref('orders', lazy=True))

class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    menu_item_id = db.Column(db.Integer, db.ForeignKey('menu_item.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    special_instructions = db.Column(db.String(255), nullable=True)
    
    order = db.relationship('Order', backref=db.backref('items', lazy=True))
    menu_item = db.relationship('MenuItem')

class Bill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    bill_number = db.Column(db.String(50), unique=True, nullable=False)
    subtotal = db.Column(db.Float, nullable=False)
    tax_amount = db.Column(db.Float, nullable=False)
    grand_total = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    order = db.relationship('Order', backref=db.backref('bill', uselist=False))
