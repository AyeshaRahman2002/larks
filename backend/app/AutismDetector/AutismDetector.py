from flask import Flask, request, jsonify, current_app, make_response
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_cors import CORS
from app import models, db
from app.endpoints import auth_bp
from app.models import personaldetails, AutismDetectorFeedback
import joblib
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
nltk.download('punkt')  # Download the Punkt tokenizer models
nltk.download('vader_lexicon')
nltk.download('stopwords')
from nltk.sentiment import SentimentIntensityAnalyzer
from nltk.tokenize import sent_tokenize  # Import the sentence tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from datetime import datetime
from flask import Flask, request, jsonify
from transformers import pipeline

app = Flask(__name__)
CORS(app)

@auth_bp.route('/api/feedback', methods=['GET'])
@jwt_required()
def get_feedback():
    current_user_id = get_jwt_identity()  # Retrieve the current user's ID from the JWT token
    
    try:
        # Fetch feedback records for the current user
        user_feedback = AutismDetectorFeedback.query.filter_by(user_id=current_user_id).all()
        personal_details = personaldetails.query.filter_by(user_id=current_user_id).first()

        # Format the feedback records for JSON response
        feedback_list = [{
            "id": feedback.id,
            "aq10": feedback.aq10,
            "aq": feedback.aq,
            "catqtotalScore": feedback.catqtotalScore,
            "compensationScore": feedback.compensationScore,
            "maskingScore": feedback.maskingScore,
            "assimilationScore": feedback.assimilationScore,
            "raadsrScore": feedback.raadsrScore,
            "language": feedback.language,
            "socialRelatedness": feedback.socialRelatedness,
            "sensoryMotor": feedback.sensoryMotor,
            "circumscribedInterests": feedback.circumscribedInterests,
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
        } for feedback in user_feedback]
        
        return jsonify({"feedback": feedback_list}), 200
    
    except Exception as e:
        # Log the exception for debugging purposes
        print(f"Failed to fetch feedback: {e}")
        return jsonify({"error": "Failed to fetch feedback"}), 500

# Load the Keras model and tokenizer
model = joblib.load('/Users/ayesharahman1/Desktop/larks/backend/app/AutismDetector/autism_classifier.joblib')
tokenizer = joblib.load('/Users/ayesharahman1/Desktop/larks/backend/app/AutismDetector/tfidf_vectorizer.joblib')

@auth_bp.route('/api/notes', methods=['GET', 'POST'])
@jwt_required()
def handle_notes():
    current_user_id = get_jwt_identity()  # Retrieve the current user's ID from the JWT token
    if request.method == 'GET':
        # Fetch and return notes that belong to the current user
        user_notes = models.Note.query.filter_by(user_id=current_user_id).all()
        notes_list = [{"id": note.id, "note": note.note, "timestamp": note.timestamp.isoformat(), "prediction": note.prediction} for note in user_notes]
        return jsonify({"notes": notes_list}), 200
    
    elif request.method == 'POST':
        note_data = request.get_json()
        note_text = note_data.get('note')
        if not note_text:
            return jsonify({"msg": "Note content is required"}), 400
        
        # Example processing logic
        sentences = sent_tokenize(note_text)
        autistic_characteristics_count = 0
        
        for sentence in sentences:
            # Example prediction logic
            seq = tokenizer.texts_to_sequences([sentence])
            padded_seq = pad_sequences(seq, maxlen=100)  # Ensure this matches your model's expected input length
            sentence_prediction = model.predict(padded_seq)
            if sentence_prediction[0] > 0.5:  # Adjust the threshold as needed
                autistic_characteristics_count += 1
        
        note_label = 1 if autistic_characteristics_count >= 15 else 0  # Adjust the criteria as needed
        
        new_note = models.Note(
            user_id=current_user_id,  # Set the user_id to the current user's ID
            note=note_text,
            prediction=note_label
        )
        db.session.add(new_note)
        db.session.commit()

        return jsonify({"id": new_note.id, "prediction": note_label}), 200

@auth_bp.route('/save_result', methods=['POST'])
@jwt_required()
def save_result():
    current_user_id = get_jwt_identity()  # Get the user ID from the JWT token
    data = request.json
    try:
        feedback_record = AutismDetectorFeedback.query.filter_by(user_id=current_user_id).first()

        if feedback_record:
            # Update existing record with new values
            feedback_record.aq10 = data.get('aq10', feedback_record.aq10)
            feedback_record.aq = data.get('aq', feedback_record.aq)
            feedback_record.catqtotalScore = data.get('catqtotalScore', feedback_record.catqtotalScore)
            feedback_record.compensationScore = data.get('compensationScore', feedback_record.compensationScore)
            feedback_record.maskingScore = data.get('maskingScore', feedback_record.maskingScore)
            feedback_record.assimilationScore = data.get('assimilationScore', feedback_record.assimilationScore)
            feedback_record.raadsrScore = data.get('raadsrScore', feedback_record.raadsrScore)
            feedback_record.language = data.get('language', feedback_record.language)
            feedback_record.socialRelatedness = data.get('socialRelatedness', feedback_record.socialRelatedness)
            feedback_record.sensoryMotor = data.get('sensoryMotor', feedback_record.sensoryMotor)
            feedback_record.circumscribedInterests = data.get('circumscribedInterests', feedback_record.circumscribedInterests)
        else:
            # Create a new record with provided values
            new_record = AutismDetectorFeedback(
                user_id=current_user_id,
                aq10=data.get('aq10'),
                aq=data.get('aq'),
                catqtotalScore=data.get('catqtotalScore'),
                compensationScore=data.get('compensationScore'),
                maskingScore=data.get('maskingScore'),
                assimilationScore=data.get('assimilationScore'),
                raadsrScore = data.get('raadsrScore'),
                language = data.get('language'),
                socialRelatedness = data.get('socialRelatedness'),
                sensoryMotor = data.get('sensoryMotor'),
                circumscribedInterests = data.get('circumscribedInterests'),
            )
            db.session.add(new_record)

        db.session.commit()
        return jsonify({"message": "Details saved successfully"}), 201
    except Exception as e:
        current_app.logger.error(f'Unexpected error saving personal details: {e}')
        return jsonify({"error": "Unable to save details"}), 500



@auth_bp.route('/submit_personal_details', methods=['POST'])
@jwt_required()
def submit_personal_details():
    current_user_id = get_jwt_identity()  # Get the user ID from the JWT token
    data = request.json
    print("etst")
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


from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification

# Load a pre-trained model and tokenizer for sentiment analysis
model_name = "distilbert-base-uncased-finetuned-sst-2-english"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name)

# Create a sentiment analysis pipeline using the loaded model and tokenizer
# Initialize NLP model for sentiment analysis and intent recognition
nlp_sentiment = pipeline("sentiment-analysis")
nlp_intent = pipeline("text-classification", model=model, tokenizer=tokenizer)

@auth_bp.route('/analyze', methods=['POST'])
def analyze_text():
    data = request.json
    user_input = data.get('text', '').strip()

    # Check for empty input
    if not user_input:
        return jsonify({"feedback": "No response was provided.", "sentiment": "NONE", "score": 0.0})

    try:
        # Process the input with the NLP model
        results = nlp_sentiment(user_input)
        
        # Assuming the first result is the most relevant
        sentiment = results[0]['label']
        score = results[0]['score']

        # Generate detailed, contextual feedback
        if sentiment == 'POSITIVE':
            if score > 0.85:
                feedback_detail = "This is an exceptionally positive response, indicating strong enthusiasm or approval. Keep harnessing this positivity, perhaps by sharing your thoughts or insights with others who might benefit."
            else:
                feedback_detail = "This is a positive response, indicating satisfaction or a positive outlook. Consider exploring this topic further or using this positivity to motivate yourself and others."
        elif sentiment == 'NEGATIVE':
            if score > 0.85:
                feedback_detail = "This is a strongly negative response, indicating deep concerns or dissatisfaction. It may be beneficial to address these feelings directly, seek support, or consider constructive ways to express or alleviate these concerns."
            else:
                feedback_detail = "This is a negative response, suggesting some reservations or dissatisfaction. Reflecting on the reasons behind these feelings can be a first step towards understanding and addressing them."
        else:
            feedback_detail = "Your response is neutral, indicating a balanced or undecided viewpoint. While neutrality can be valuable, especially in objective analysis, consider if there are underlying feelings or opinions you haven't fully expressed."

        feedback = f"Sentiment: {sentiment} (Confidence: {score:.2f}). {feedback_detail}"

    except Exception as e:
        # Handle any errors during analysis
        feedback = f"An error occurred during sentiment analysis: {str(e)}"
        return jsonify({"error": feedback}), 500

    return jsonify({"feedback": feedback, "sentiment": sentiment, "score": score})
