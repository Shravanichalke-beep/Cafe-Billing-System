import uuid
from flask import Blueprint, request, jsonify
from models import db, Bill, Order, Table, OrderItem

bills_bp = Blueprint('bills', __name__)

@bills_bp.route('/', methods=['GET'])
def get_bills():
    bills = Bill.query.all()
    result = []
    for bill in bills:
        result.append({
            "id": bill.id,
            "bill_number": bill.bill_number,
            "order_id": bill.order_id,
            "subtotal": bill.subtotal,
            "tax_amount": bill.tax_amount,
            "grand_total": bill.grand_total,
            "created_at": bill.created_at.isoformat(),
            "table_number": bill.order.table.table_number
        })
    return jsonify(result)

@bills_bp.route('/generate', methods=['POST'])
def generate_bill():
    data = request.get_json()
    order_id = data.get('order_id')
    
    order = Order.query.get(order_id)
    if not order or order.status != 'Pending':
        return jsonify({"msg": "Order not found or already billed"}), 404

    # Calculate totals
    subtotal = 0.0
    for item in order.items:
        subtotal += item.quantity * item.menu_item.price
        
    tax_rate = 0.05 # 5% GST
    tax_amount = subtotal * tax_rate
    grand_total = subtotal + tax_amount

    # Create bill
    bill_number = f"BILL-{uuid.uuid4().hex[:6].upper()}"
    new_bill = Bill(
        order_id=order.id,
        bill_number=bill_number,
        subtotal=subtotal,
        tax_amount=tax_amount,
        grand_total=grand_total
    )
    db.session.add(new_bill)

    # Update order status
    order.status = 'Completed'

    # Update table status
    table = order.table
    table.status = 'Bill Pending' # Could be 'Available' if paid immediately, but let's say 'Bill Pending' initially

    db.session.commit()

    # Detailed items for receipt preview
    items_detail = [{"name": i.menu_item.name, "quantity": i.quantity, "price": i.menu_item.price, "total": i.quantity * i.menu_item.price} for i in order.items]

    return jsonify({
        "msg": "Bill generated",
        "bill": {
            "bill_number": bill_number,
            "subtotal": subtotal,
            "tax_amount": tax_amount,
            "grand_total": grand_total,
            "table_number": table.table_number,
            "items": items_detail,
            "date": new_bill.created_at.strftime('%d/%m/%Y %H:%M')
        }
    }), 201

@bills_bp.route('/reports/daily', methods=['GET'])
def get_daily_report():
    # Simple summary of all bills (in a real app, filter by today's date)
    bills = Bill.query.all()
    total_sales = sum([b.grand_total for b in bills])
    total_bills = len(bills)
    
    return jsonify({
        "total_sales": total_sales,
        "total_bills": total_bills
    })
