from flask import Blueprint, request, jsonify
from models import db, MenuItem

menu_bp = Blueprint('menu', __name__)


# Get all menu items
@menu_bp.route('/', methods=['GET'])
def get_menu():
    items = MenuItem.query.all()

    return jsonify([
        {
            "id": item.id,
            "name": item.name,
            "category": item.category,
            "quantity": item.quantity,  # NEW
            "price": item.price,
            "is_available": item.is_available,
            "image_url": item.image_url
        }
        for item in items
    ])


# Add new menu item
@menu_bp.route('/', methods=['POST'])
def add_menu_item():
    data = request.get_json()

    new_item = MenuItem(
        name = data['name'],
        category = data['category'],
        quantity = data['quantity'],  # NEW
        price = data['price'],
        is_available = data.get('is_available', True),
        image_url = data.get('image_url', '')
    )

    db.session.add(new_item)
    db.session.commit()

    return jsonify({
        "msg": "Menu item added successfully"
    }), 201


# Update menu item
@menu_bp.route('/<int:id>', methods=['PUT'])
def update_menu_item(id):
    item = MenuItem.query.get_or_404(id)
    data = request.get_json()

    item.name = data.get('name', item.name)
    item.category = data.get('category', item.category)
    item.quantity = data.get('quantity', item.quantity)  # NEW
    item.price = data.get('price', item.price)
    item.is_available = data.get('is_available', item.is_available)
    item.image_url = data.get('image_url', item.image_url)

    db.session.commit()

    return jsonify({
        "msg": "Menu item updated successfully"
    })


# Delete menu item
@menu_bp.route('/<int:id>', methods=['DELETE'])
def delete_menu_item(id):
    item = MenuItem.query.get_or_404(id)

    db.session.delete(item)
    db.session.commit()

    return jsonify({
        "msg": "Menu item deleted successfully"
    })