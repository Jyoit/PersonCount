from flask import Flask, jsonify
from flask_cors import CORS
import subprocess

app = Flask(__name__)
CORS(app)  # This allows requests from React

@app.route('/run-python-script', methods=['GET'])
def run_script():
    try:
        # Make sure countobjwithvoice.py is in the same folder
        subprocess.Popen(['python', 'countobjwithvoice.py'])
        return jsonify({'success': True})
    except Exception as e:
        print("Error running script:", e)
        return jsonify({'success': False, 'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
