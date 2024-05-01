# added for SQLAlchemy
import os

from app.dependencies import get_settings

settings = get_settings()

basedir = os.path.abspath(os.path.dirname(__file__))

# this places the database in the home directory as app.db
SQLALCHEMY_DATABASE_URI = 'sqlite:///' + os.path.join(basedir, 'app.db')
SQLALCHEMY_BINDS = {
    "postgres": settings['DATABASE_URL'],
    
}


SQLALCHEMY_TRACK_MODIFICATIONS = True

WTF_CSRF_ENABLED = True
# TODO: Add a secrets file!!
SECRET_KEY = 'a-very-secret-secret'
JWT_SECRET_KEY = 'super-duper-secret'
