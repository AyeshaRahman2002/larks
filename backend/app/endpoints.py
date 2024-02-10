import os, time, json, base64
from datetime import timedelta
from app import bcrypt, db
from flask import request, jsonify, Blueprint, current_app
from .models import Users
from flask_jwt_extended import JWTManager, get_jwt_identity
from flask_jwt_extended import create_access_token, jwt_required
from flask_cors import cross_origin
from datetime import datetime
# from transformers import pipeline

auth_bp = Blueprint('auth', __name__)

# import individual project python files
from app.kevin.kevin import *  # noqa: F403, F401
from app.lanre.lanre import *  # noqa: F403, F401
from app.ramat.ramat import *  # noqa: F403, F401
#from app.shreyas.shreyas import *  # noqa: F403, F401
from app.rootsRadar.rootsRadar import *  # noqa: F403, F401
from app.AutismDetector.AutismDetector import *  # noqa: F403, F401

# ---------------------------------------------------------------------------- #

@auth_bp.route('/login', methods=['POST'])
def login():
    data = json.loads(request.data.decode('utf-8'))

    email = data['credentials']['email'];
    if email == '': return {"msg": "No email was provided."}, 400

    password = data['credentials']['password'];
    if password == '': return {"msg": "No password was provided."}, 400

    user = Users.query.filter_by(email=email).first()

    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"msg": "Incorrect username or password."}), 401

    token = create_access_token(user.id, expires_delta=timedelta(hours=1))

    return jsonify({"token": token, "email": user.email}), 200

# ---------------------------------------------------------------------------- #

@auth_bp.route('/register', methods=['POST'])
def register():
    data = json.loads(request.data.decode('utf-8'))

    email = data['email'];
    if email == '': return {"msg": "No email was provided."}, 400

    password = data['password'];
    if password == '': return {"msg": "No password was provided."}, 400

    username_is_taken = Users.query.filter_by(email=email).first()
    if username_is_taken: return {"msg": "Username taken."}, 409

    hashed_password = bcrypt.generate_password_hash(
        data['password']).decode('utf-8')

    new_user = Users(email=email, password=hashed_password)

    db.session.add(new_user)
    db.session.commit()

    access_token = create_access_token(identity=new_user.id)
    return {"msg": "New user added.", "token": access_token}, 200

# ---------------------------------------------------------------------------- #

# PROOF OF CONCEPT OF UPLOADING IMAGES TO SERVER
# CURRENTLY SAVES IMAGE TO SHOTS FOLDER, BUT COULD BE EXTENDED TO PROCESS IMAGES
@auth_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload():
    image = request.form['image']

    if image == "null":
        return {"msg": "No image was provided."}, 400

    # removes header of base 64 encoded string i.e. first 22 chars and decodes
    # the rest
    image = image[22:]
    image_decoded = base64.b64decode(image)

    timestamp = str(int(time.time()))
    filename = timestamp+".png"

    # saves decoded base 64 string to that image
    with open(os.path.join("shots", filename), "wb") as f:
        f.write(image_decoded)

    return {"msg": "Image saved successfully."}, 200

# ---------------------------------------------------------------------------- #

# ROUTE USED TO VERIFY A JWT SO MALICIOUS ACTORS CAN'T MANUALLY ADD A RANDOM
# SESSION STORAGE VARIABLE IN THE BROWSER ALLOWING THEM TO LOGIN
@auth_bp.route('/verification', methods=['POST'])
@jwt_required()
def verification():
    return {'user': get_jwt_identity()}




# @auth_bp.route('/save_personal_details', methods=['POST'])
# @cross_origin(origin='http://localhost:5000', headers=['Content-Type'])
# @jwt_required()
# def save_personal_details():
#     data = request.json

#     # Get the user's identity (id) from the JWT token
#     user_id = get_jwt_identity()

#     # Check if a record with the same email exists in the personaldetails table
#     existing_details = personaldetails.query.filter_by(email=data['email']).first()

#     if existing_details:
#         # Update the existing record with the new data
#         existing_details.first_name = data['firstName']
#         existing_details.last_name = data['lastName']
#         existing_details.date_of_birth = datetime.strptime(data['dateOfBirth'], '%Y-%m-%d').date()
#         existing_details.gender = data['gender']
#         existing_details.occupation = data['occupation']
#         existing_details.education = data['education']
#         existing_details.interests = data['interests']
#         existing_details.nationality = data['nationality']
#         existing_details.ethnicity = data['ethnicity']
#     else:
#         # Create a new personal details record
#         new_details = personaldetails(
#             user_id=user_id,
#             first_name=data['firstName'],
#             last_name=data['lastName'],
#             date_of_birth=datetime.strptime(data['dateOfBirth'], '%Y-%m-%d').date(),
#             email=data['email'],
#             gender=data['gender'],
#             occupation=data['occupation'],
#             education=data['education'],
#             interests=data['interests'],
#             nationality=data['nationality'],
#             ethnicity=data['ethnicity']
#         )

#         db.session.add(new_details)
    
#     db.session.commit()
#     return jsonify({"msg": "Details saved/updated successfully."}), 200



# @auth_bp.route('/get_personal_details', methods=['GET'])
# @cross_origin(origin='http://localhost:5000', headers=['Content-Type'])
# def get_personal_details():
#     # Assuming you have a user's identity, you can fetch their details
#     user_id = get_jwt_identity()
#     details = personaldetails.query.filter_by(user_id=user_id).first()

#     if details:
#         return jsonify({
#             'firstName': details.first_name,
#             'lastName': details.last_name,
#         }), 200
#     else:
#         return jsonify({"msg": "Details not found."}), 404

# # Load the pre-trained model (consider doing this lazily or in a way that minimizes impact on app startup time)
# nlp_model = pipeline('sentiment-analysis')

# @auth_bp.route('/analyze', methods=['POST'])
# def analyze_text():
#     data = request.json
#     text = data.get('text')
#     try:
#         result = nlp_model(text)
#         return jsonify(result)
#     except Exception as e:
#         return jsonify({"error": str(e)}), 500


# @auth_bp.route('/api/notes', methods=['POST'])
# @jwt_required()
# def create_note():
#     user_id = get_jwt_identity()
#     data = request.json
#     content = data.get('content')

#     if not content:
#         return jsonify({"msg": "Content is required."}), 400
    
#     try:
#         note = Note(user_id=user_id, content=content)
#         db.session.add(note)
#         db.session.commit()
#         return jsonify({"msg": "Note added successfully.", "note_id": note.id}), 201
#     except Exception as e:
#         # Log the exception to server logs
#         print(f"Failed to add note: {e}")
#         return jsonify({"msg": "Failed to add note due to an internal error."}), 500

# @auth_bp.route('/api/notes', methods=['GET'])
# @jwt_required()
# def get_notes():
#     user_id = get_jwt_identity()
#     note = Note.query.filter_by(user_id=user_id).all()

#     return jsonify([{'id': note.id, 'content': note.content, 'created_at': note.created_at} for note in note]), 200
