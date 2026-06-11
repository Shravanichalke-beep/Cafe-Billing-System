from flask import Blueprint, request, jsonify
from models import db, Table

tables_bp = Blueprint('tables', __name__)

@tables_bp.route('/', methods=['GET'])
def get_tables():
    tables = Table.query.all()
    return jsonify([{"id": t.id, "table_number": t.table_number, "status": t.status} for t in tables])

@tables_bp.route('/', methods=['POST'])
def add_table():
    data = request.get_json()
    new_table = Table(table_number=data['table_number'], status=data.get('status', 'Available'))
    db.session.add(new_table)
    db.session.commit()
    return jsonify({"msg": "Table added successfully"}), 201

@tables_bp.route('/<int:id>', methods=['PUT'])
def update_table(id):
    table = Table.query.get_or_404(id)
    data = request.get_json()
    if 'table_number' in data:
        table.table_number = data['table_number']
    if 'status' in data:
        table.status = data['status']
    db.session.commit()
    return jsonify({"msg": "Table updated"})

@tables_bp.route('/<int:id>', methods=['DELETE'])
def delete_table(id):
    table = Table.query.get_or_404(id)
    db.session.delete(table)
    db.session.commit()
    return jsonify({"msg": "Table deleted"})
