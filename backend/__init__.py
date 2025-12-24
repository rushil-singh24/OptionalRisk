# backend/__init__.py
from flask import Flask
from flask_cors import CORS
from . import portfolio
from . import monte_carlo

def create_app():
    app = Flask(__name__)
    CORS(app)

    # Import routes here
    from . import routes
    routes.init_app(app)

    return app
