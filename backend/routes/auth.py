from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from models import db, User

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'Staff')

    if User.query.filter_by(username=username).first():
        return jsonify({"msg": "Username already exists"}), 400

    hashed_password = generate_password_hash(password)
    new_user = User(username=username, password_hash=hashed_password, role=role)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({"msg": "User created successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = User.query.filter_by(username=username).first()

    if user and check_password_hash(user.password_hash, password):
        access_token = create_access_token(identity={'username': user.username, 'role': user.role})
        return jsonify({"access_token": access_token, "role": user.role, "username": user.username}), 200

    return jsonify({"msg": "Bad username or password"}), 401
