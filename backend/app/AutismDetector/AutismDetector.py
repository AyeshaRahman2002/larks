from flask import Flask, request, jsonify
from flask_jwt_extended import jwt_required
from flask_cors import CORS
from app import models, db
from app.endpoints import auth_bp
import joblib
import nltk
nltk.download('punkt')  # Download the Punkt tokenizer models
from nltk.tokenize import sent_tokenize  # Import the sentence tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences

app = Flask(__name__)
CORS(app)

# Load the Keras model and tokenizer
model = joblib.load('/Users/ayesharahman1/Desktop/larks/backend/app/AutismDetector/autism_classifier.joblib')
tokenizer = joblib.load('/Users/ayesharahman1/Desktop/larks/backend/app/AutismDetector/tfidf_vectorizer.joblib')

@auth_bp.route('/api/notes', methods=['GET', 'POST'])
@jwt_required()
def handle_notes():
    if request.method == 'GET':
        # Fetch and return notes logic
        notes = models.Note.query.all()
        notes_list = [{"id": note.id, "note": note.note, "timestamp": note.timestamp.isoformat(), "prediction": note.prediction} for note in notes]
        return jsonify({"notes": notes_list}), 200
    
    elif request.method == 'POST':
        note_data = request.get_json()
        note_text = note_data.get('note')
        if not note_text:
            return jsonify({"msg": "Note content is required"}), 400
        
        sentences = sent_tokenize(note_text)
        autistic_characteristics_count = 0
        
        for sentence in sentences:
            # Tokenize and pad the sentence to be compatible with the model
            seq = tokenizer.texts_to_sequences([sentence])
            padded_seq = pad_sequences(seq, maxlen=100)  # Ensure this matches the training input length
            sentence_prediction = model.predict(padded_seq)
            if sentence_prediction[0] > 0.5:  # Adjust the threshold as needed
                autistic_characteristics_count += 1
        
        note_label = 1 if autistic_characteristics_count >= 20 else 0  # Adjust the criteria as needed
        
        new_note = models.Note(note=note_text, prediction=note_label)
        db.session.add(new_note)
        db.session.commit()

        return jsonify({"id": new_note.id, "prediction": note_label}), 200

if __name__ == '__main__':
    app.run(debug=True)



@auth_bp.route('/save_personal_details', methods=['POST'])
@jwt_required()
def save_personal_details():
    data = request.get_json()
    
    # Convert date_of_birth from string to date object
    try:
        date_of_birth = datetime.strptime(data.get('dateOfBirth'), '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"msg": "Invalid date format. Please use YYYY-MM-DD."}), 400

    # Attempt to find existing record by email or user_id
    existing_details = personaldetails.query.filter_by(email=data.get('email')).first()

    if existing_details:
        # Update existing record
        existing_details.first_name = data.get('firstName')
        existing_details.last_name = data.get('lastName')
        existing_details.date_of_birth = date_of_birth
        existing_details.gender = data.get('gender')
        existing_details.occupation = data.get('occupation')
        existing_details.education = data.get('education')
        existing_details.interests = data.get('interests')
        existing_details.nationality = data.get('nationality')
        existing_details.ethnicity = data.get('ethnicity')
    else:
        # Create new record
        new_details = personaldetails(
            user_id=data.get('user_id'), 
            first_name=data.get('firstName'),
            last_name=data.get('lastName'),
            date_of_birth=date_of_birth,
            email=data.get('email'),
            gender=data.get('gender'),
            occupation=data.get('occupation'),
            education=data.get('education'),
            interests=data.get('interests'),
            nationality=data.get('nationality'),
            ethnicity=data.get('ethnicity'),
        )
        db.session.add(new_details)
    
    try:
        db.session.commit()
        return jsonify({"msg": "Details saved successfully"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "An error occurred while saving details."}), 500

@auth_bp.route('/get_personal_details', methods=['GET'])
@jwt_required()
def get_personal_details():
    current_user_email = get_jwt_identity()
    personal_details = personaldetails.query.filter_by(email=current_user_email).first()
    if personal_details:
        personal_details_data = {
            "firstName": personal_details.first_name,
            "lastName": personal_details.last_name,
            "dateOfBirth": personal_details.date_of_birth.isoformat(),
            "email": personal_details.email,
            "gender": personal_details.gender,
            "occupation": personal_details.occupation,
            "education": personal_details.education,
            "interests": personal_details.interests,
            "nationality": personal_details.nationality,
            "ethnicity": personal_details.ethnicity
        }
        return jsonify({"personalDetails": personal_details_data}), 200
    else:
        return jsonify({"msg": "Personal details not found"}), 404
