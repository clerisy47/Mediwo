from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/')
def home():
    return "Hello from the backend!"

@app.route('/api/data')
def get_data():
    return jsonify({"message": "This is some dummy data from the backend."})

if __name__ == '__main__':
    app.run(debug=True)
