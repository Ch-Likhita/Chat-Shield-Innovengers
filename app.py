import torch
from flask import Flask, request, jsonify
from transformers import pipeline
import logging

# Configure basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Force the application to use the CPU
device = -1
logging.info("Explicitly using the CPU for model inference.")

# Initialize Flask app
app = Flask(__name__)

# Initialize the NLP model
# This model has been fine-tuned for toxicity classification.
# It will be downloaded automatically the first time you run this.
try:
    classifier = pipeline("text-classification", model="unitary/toxic-bert", device=device)
    logging.info("NLP model loaded successfully on the CPU.")
except Exception as e:
    logging.error(f"Failed to load NLP model: {e}")
    classifier = None

@app.route('/analyze_chat', methods=['POST'])
def analyze_chat():
    """
    Analyzes a given text message for toxicity and returns a score.
    """
    if not classifier:
        return jsonify({"error": "NLP model not loaded"}), 500

    data = request.json
    message_text = data.get('message')

    if not message_text:
        return jsonify({"error": "No 'message' field provided"}), 400

    try:
        # The classifier returns a list of results. We take the first one.
        result = classifier(message_text)
        
        # The result includes a label (e.g., 'toxic') and a score.
        # We'll return the score of the 'toxic' label.
        toxic_score = 0.0
        for item in result:
            if item['label'] == 'toxic':
                toxic_score = item['score']
                break
        
        logging.info(f"Analyzed message: '{message_text}' | Score: {toxic_score}")
        
        return jsonify({
            "success": True,
            "message": message_text,
            "score": toxic_score,
            "label": "toxic" if toxic_score > 0.5 else "non-toxic"
        })
    except Exception as e:
        logging.error(f"Error during analysis: {e}")
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    # You can change the port here if needed.
    app.run(host='0.0.0.0', port=5000, debug=False)
