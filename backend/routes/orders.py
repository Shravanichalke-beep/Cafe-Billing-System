from flask import Blueprint, request, jsonify
from models import db, Order, OrderItem, Table, MenuItem

orders_bp = Blueprint('orders', __name__)

@orders_bp.route('/', methods=['GET'])
def get_orders():
    orders = Order.query.all()
    result = []
    for order in orders:
        items = [{"id": i.id, "menu_item_id": i.menu_item_id, "menu_item_name": i.menu_item.name, "quantity": i.quantity, "price": i.menu_item.price} for i in order.items]
        result.append({
            "id": order.id,
            "table_id": order.table_id,
            "status": order.status,
            "created_at": order.created_at.isoformat(),
            "items": items
        })
    return jsonify(result)

@orders_bp.route('/table/<int:table_id>', methods=['GET'])
def get_order_by_table(table_id):
    order = Order.query.filter_by(table_id=table_id, status='Pending').first()
    if not order:
        return jsonify({"msg": "No pending order for this table"}), 404
    
    items = [{"id": i.id, "menu_item_id": i.menu_item_id, "menu_item_name": i.menu_item.name, "quantity": i.quantity, "price": i.menu_item.price} for i in order.items]
    return jsonify({
        "id": order.id,
        "table_id": order.table_id,
        "status": order.status,
        "items": items
    })

@orders_bp.route('/', methods=['POST'])
def create_or_update_order():
    data = request.get_json()
    table_id = data.get('table_id')
    items = data.get('items', []) # List of dicts: {"menu_item_id": 1, "quantity": 2, "special_instructions": ""}
    
    table = Table.query.get(table_id)
    if not table:
        return jsonify({"msg": "Table not found"}), 404

    # Check if there is already a pending order
    order = Order.query.filter_by(table_id=table_id, status='Pending').first()
    if not order:
        order = Order(table_id=table_id)
        db.session.add(order)
        db.session.flush() # To get order.id

    # Update table status
    table.status = 'Occupied'

    # Clear existing items and add new ones (simple approach) or update selectively.
    # For simplicity, we clear and re-add all items from the request.
    OrderItem.query.filter_by(order_id=order.id).delete()
    
    for item_data in items:
        new_item = OrderItem(
            order_id=order.id,
            menu_item_id=item_data['menu_item_id'],
            quantity=item_data.get('quantity', 1),
            special_instructions=item_data.get('special_instructions', '')
        )
        db.session.add(new_item)

    db.session.commit()
    return jsonify({"msg": "Order updated", "order_id": order.id}), 201
