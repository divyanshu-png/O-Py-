import requests

# Replace with your actual Hugging Face API Token
from transformers import AutoModel
model = AutoModel.from_pretrained("solidrust/Qwen3.5-27B-Claude-4.6-Opus-Reasoning-Distilled-v2-GGUF", dtype="auto")


def _ai_is_configured():
    return bool(HF_TOKEN and HF_TOKEN != "your_huggingface_token_here")

def get_ai_feedback(user_code, problem_description):
    if not _ai_is_configured():
        return {
            "summary": "AI feedback is disabled because HF_TOKEN is still the placeholder value.",
            "optimized_code": "",
        }

    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    prompt = f"""
    As an expert interviewer, review this code for the problem: {problem_description}
    User's Code: {user_code}
    
    Provide:
    1. Time Complexity (Big O)
    2. Space Complexity
    3. One 'Optimized Code' snippet.
    """
    
    payload = {"inputs": prompt}
    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=15)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as exc:
        return {
            "summary": "AI feedback could not be loaded.",
            "error": str(exc),
            "optimized_code": "",
        }

def generate_new_question(current_rank):
    fallback_question = "Write a function `find_max(numbers)` that returns the largest number in a list."

    if not _ai_is_configured():
        return fallback_question

    headers = {"Authorization": f"Bearer {HF_TOKEN}"}
    prompt = f"Act as a DSA Interviewer. Based on an ELO rank of {current_rank}, generate one coding challenge. Provide only the problem description and the function signature."
    
    payload = {"inputs": prompt}
    try:
        response = requests.post(API_URL, headers=headers, json=payload, timeout=15)
        response.raise_for_status()
        # Claude typically returns a list of dictionaries; extract the text.
        result = response.json()
    except requests.RequestException:
        return fallback_question

    if isinstance(result, list) and result:
        return result[0].get('generated_text', fallback_question)
    if isinstance(result, dict):
        return result.get('generated_text', fallback_question)
    return fallback_question
