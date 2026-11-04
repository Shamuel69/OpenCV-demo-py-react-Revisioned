from flask import Flask, jsonify, request, send_file
import io
from flask_cors import CORS
from CV2_testing import CV2attributes
import cv2 
import numpy as np
import json
app = Flask(__name__)

# Allow requests from any origin
CORS(app, resources={r"/api/*": {"origins": "*"}})

def sendimage(image, data):
    # Placeholder function to handle the image
    # You can implement your image processing logic here

    print("Received image shape: ", image.shape)
    print("Recieved config data: ", data)
    cv2_attributes = CV2attributes(image, data)

    return cv2_attributes.result


@app.route("/api/upload", methods=["POST"])
def upload_image():
    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    # if "config" not in request.files:
    #     return jsonify({"error": "No config data provided"}), 400

    file = request.files["image"]
    data = request.form.get("config")
    print("request: ", data)

    try:
        config = json.loads(data)
    except Exception as err:
        config = {"_raw": data}
        print("Failed to parse config dictionary/array: ", err)
    
    file_bytes = file.read()

    np_array = np.frombuffer(file_bytes, np.uint8)
    img = cv2.imdecode(np_array, cv2.IMREAD_COLOR)

    if img is None:
        return jsonify({"error":"Could not decode image"}), 400

    result = sendimage(img, config)
    print(f"{result} working?/n/n/n")
    success, buffer = cv2.imencode(".png", result)

    if not success:
        return jsonify({"error": "Could not encode your image"}), 500

    return send_file(io.BytesIO(buffer.tobytes()), mimetype='image/png')

@app.route("/api/fishcheck", methods=["POST"])
def check_fish():
    data = request.get_json()
    fish = data.get("fish", "")
    is_valid = fishcheck(fish)
    return jsonify({"valid": is_valid})

@app.route("/api/data", methods=["GET"])
def get_data():
    data = {
        "users": [
            {"id": 1, "name": "Alice"},
            {"id": 2, "name": "Bob"},
            {"id": 3, "name": "Charlie"}
        ]
    }
    return jsonify(data)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080, debug=True)