from flask import Flask, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import CORS
from app import models, db
from app.endpoints import auth_bp
from app.models import personaldetails, AutismDetectorFeedback
import joblib
import nltk
nltk.download('punkt')  # Download the Punkt tokenizer models
from nltk.tokenize import sent_tokenize  # Import the sentence tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from datetime import datetime

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

@auth_bp.route('/save_result', methods=['POST'])
@jwt_required()
def submit_aq10_result():
    try:
        current_user_id = get_jwt_identity()
        current_app.logger.info(f"Received request from user with ID: {current_user_id}")

        data = request.json
        current_app.logger.info(f"Request data: {data}")

        totalScore = data.get('totalScore')
        if totalScore is None:
            return jsonify({"msg": "Total score is required"}), 400

        feedback = AutismDetectorFeedback(user_id=current_user_id, totalScore=totalScore)
        db.session.add(feedback)
        db.session.commit()

        return jsonify({"msg": "Feedback submitted successfully", "id": feedback.id}), 200
    except Exception as e:
        current_app.logger.error(f"Error submitting AQ10 result: {str(e)}")
        return jsonify({"msg": "An error occurred while processing the request"}), 500

@auth_bp.route('/submit_personal_details', methods=['POST'])
@jwt_required()
def submit_personal_details():
    current_user_id = get_jwt_identity()  # Get the user ID from the JWT token
    data = request.json

    dob_input = data.get('DOB')
    if not dob_input:
        return jsonify({"error": "DOB is required."}), 400
    
    try:
        dob = datetime.strptime(dob_input, '%Y-%m-%d').date()
        personal_details = personaldetails.query.filter_by(user_id=current_user_id).first()

        if personal_details:
            # Update existing record
            personal_details.firstName = data['firstName']
            personal_details.lastName = data['lastName']
            personal_details.DOB = dob
            personal_details.gender = data.get('gender', '')
            personal_details.postCode = data['postCode']
            personal_details.city = data['city']
            personal_details.countryOfResidence = data['countryOfResidence']
            personal_details.highestEducation = data.get('highestEducation', '')
            personal_details.ethnicity = data.get('ethnicity', '')  # New
            personal_details.nationality = data.get('nationality', '')  # New
            personal_details.sexuality = data.get('sexuality', '')  # New
        else:
            # Create a new record
            personal_details = personaldetails(
                user_id=current_user_id,
                firstName=data['firstName'],
                lastName=data['lastName'],
                DOB=dob,
                gender=data.get('gender', ''),
                postCode=data['postCode'],
                city=data['city'],
                countryOfResidence=data['countryOfResidence'],  # Updated
                highestEducation=data.get('highestEducation', ''),
                ethnicity=data.get('ethnicity', ''),  # New
                nationality=data.get('nationality', ''),  # New
                sexuality=data.get('sexuality', '')  # New
            )
            db.session.add(personal_details)
        
        db.session.commit()
        return jsonify({"message": "Details saved successfully"}), 201
    except ValueError as ve:
        return jsonify({"error": str(ve)}), 400
    except Exception as e:
        current_app.logger.error(f'Unexpected error saving personal details: {e}')
        return jsonify({"error": "Unable to save details"}), 500

@auth_bp.route('/get_personal_details', methods=['GET'])
@jwt_required()
def get_personal_details():
    current_user_id = get_jwt_identity()
    personal_details = personaldetails.query.filter_by(user_id=current_user_id).first()
    
    if personal_details:
        details = {
            "firstName": personal_details.firstName,
            "lastName": personal_details.lastName,
            "DOB": personal_details.DOB.strftime('%Y-%m-%d'),
            "gender": personal_details.gender,
            "postCode": personal_details.postCode,
            "city": personal_details.city,
            "countryOfResidence": personal_details.countryOfResidence,  # Updated
            "highestEducation": personal_details.highestEducation,
            "ethnicity": personal_details.ethnicity,  # New
            "nationality": personal_details.nationality,  # New
            "sexuality": personal_details.sexuality,  # New
        }
        return jsonify(details), 200
    else:
        return jsonify({"message": "No details found for the user"}), 404

import nltk
nltk.download('vader_lexicon')

from nltk.sentiment import SentimentIntensityAnalyzer
from flask import request, jsonify

# Initialize the SentimentIntensityAnalyzer
sia = SentimentIntensityAnalyzer()

@auth_bp.route('/analyze', methods=['POST'])
def analyze_sentiment():
    data = request.get_json()
    text = data.get('text', '')
    
    scores = sia.polarity_scores(text)
    compound_score = scores['compound']
    sentiment = 'positive' if compound_score > 0.05 else 'negative' if compound_score < -0.05 else 'neutral'
    
    return jsonify({
        'compound': compound_score,
        'sentiment': sentiment
    })