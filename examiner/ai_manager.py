import os
from importlib.util import find_spec


try:
    from transformers import pipeline
except ImportError:
    pipeline = None


TORCH_AVAILABLE = find_spec("torch") is not None
MODEL_ID = os.getenv("OPY_AI_MODEL", "Qwen/Qwen2.5-0.5B-Instruct")
MAX_NEW_TOKENS = int(os.getenv("OPY_AI_MAX_NEW_TOKENS", "256"))
LOCAL_FILES_ONLY = os.getenv("OPY_AI_LOCAL_FILES_ONLY", "0") == "1"

_generator = None
_generator_error = None


def _fallback_question():
    return "Write a function `find_max(numbers)` that returns the largest number in a list."


def _ai_is_configured():
    return pipeline is not None and TORCH_AVAILABLE


def warm_up():
    """Load the model now (main thread) instead of on the first request."""
    _get_generator()


def _get_generator():
    global _generator, _generator_error

    if _generator is not None:
        return _generator
    if _generator_error is not None:
        return None
    if pipeline is None:
        _generator_error = "The transformers package is not installed."
        return None
    if not TORCH_AVAILABLE:
        _generator_error = "PyTorch is not installed, so transformers cannot run text generation."
        return None

    if LOCAL_FILES_ONLY:
        os.environ["HF_HUB_OFFLINE"] = "1"

    try:
        _generator = pipeline(
            "text-generation",
            model=MODEL_ID,
            tokenizer=MODEL_ID,
            model_kwargs={"dtype": "auto"},
            device_map="auto",
        )
    except Exception as exc:
        _generator_error = str(exc)
        return None

    return _generator


def _generate_text(prompt, fallback):
    generator = _get_generator()
    if generator is None:
        return fallback

    try:
        result = generator(
            prompt,
            max_new_tokens=MAX_NEW_TOKENS,
            do_sample=True,
            temperature=0.4,
            return_full_text=False,
        )
    except Exception as exc:
        global _generator_error
        _generator_error = str(exc)
        return fallback

    if isinstance(result, list) and result:
        generated = result[0].get("generated_text")
        if generated:
            return generated.strip()
    if isinstance(result, dict):
        generated = result.get("generated_text")
        if generated:
            return generated.strip()
    return fallback


def get_ai_feedback(user_code, problem_description):
    fallback = {
        "summary": "AI feedback is unavailable. Check transformers model/dependencies.",
        "error": _generator_error,
        "optimized_code": "",
    }

    if not _ai_is_configured():
        return fallback

    prompt = f"""
As an expert interviewer, review this code for the problem: {problem_description}

User's Code:
{user_code}

Provide:
1. Time Complexity (Big O)
2. Space Complexity
3. One optimized Python code snippet.
"""

    feedback = _generate_text(prompt, fallback="")
    if not feedback:
        fallback["error"] = _generator_error
        return fallback

    return {
        "summary": feedback,
        "optimized_code": "",
    }


def generate_new_question(current_rank):
    prompt = (
        "Act as a DSA interviewer. "
        f"Based on an ELO rank of {current_rank}, generate one Python coding challenge. "
        "Provide only the problem description and the function signature."
    )
    return _generate_text(prompt, fallback=_fallback_question())
