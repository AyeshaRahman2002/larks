from app import db
from sqlalchemy.orm import validates, relationship

class Users(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(500), index=True, unique=True)
    password = db.Column(db.String(500))

    # Based on:
    # https://ed-a-nunes.medium.com/field-validation-for-backend-apis-with-python-flask-and-sqlalchemy-30e8cc0d260c
    @validates('email')
    def validate_email(self, key, email):
        # Check for empty email
        if not email:
            raise AssertionError('No email provided')
        # Check for already taken email
        if Users.query.filter(Users.email == email).first():
            raise AssertionError('Email is already in use')
        # Check for no '@' character
        if "@" not in email:
            raise AssertionError('Email address missing "@" symbol')
        # return email field and chain validate the password
        return email

    @validates('password')
    def validate_password(self, key, password):
        # Check for empty password
        if not password:
            raise AssertionError('No password provided')
        return password

class RootRadarMVPTest(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(500))

class personaldetails(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))  # This sets up the foreign key relationship
    user = relationship("Users")  # This creates a relationship with the Users model
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    date_of_birth = db.Column(db.Date)
    email = db.Column(db.String(500), unique=True)
    gender = db.Column(db.String(50))
    occupation = db.Column(db.String(100))
    education = db.Column(db.String(100))
    interests = db.Column(db.String(500))
    nationality = db.Column(db.String(100))
    ethnicity = db.Column(db.String(100))

    def __repr__(self):
        return '<personaldetails {}>'.format(self.email)

class AutismDetectorNotes(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Foreign key to users
    user = relationship("Users", backref="autism_detector_notes")  # Establishes the relationship
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.Time, nullable=False)
    notes = db.Column(db.String(1000), nullable=False)

    def __repr__(self):
        return f"<AutismDetectorNotes {self.date} {self.time} {self.notes}>"
