from django.shortcuts import render
from django.http import JsonResponse

try:
    from rest_framework.decorators import api_view
except ImportError:
    from functools import wraps
    def api_view(methods):
        def decorator(func):
            @wraps(func)
            def wrapper(*args, **kwargs):
                return func(*args, **kwargs)
            return wrapper
        return decorator

from examiner.models import UserProfile, UserQuestionRecord
from examiner.execution_manager import evaluate_submission # The Evaluator we built
from examiner.ranking_logic import calculate_elo_change   # The ELO logic we built

@api_view(['POST'])
def submit_code_view(request):
    # 1. Extract data from Streamlit request
    user_id = request.data.get('user_id')
    user_code = request.data.get('code')
    problem_id = request.data.get('problem_id')
    difficulty = request.data.get('difficulty', 1200) # Default difficulty

    try:
        # 2. Get User Profile from MySQL
        profile = UserProfile.objects.get(user_id=user_id)
        
        # 3. Define Test Cases (In a real app, fetch these from a Problem model)
        test_cases = [{'input': 2, 'expected': 4}, {'input': 5, 'expected': 25}]
        
        # 4. EXECUTION & EVALUATION
        is_correct = evaluate_submission(user_code, test_cases)
        
        # 5. ELO RANKING ENGINE
        new_rank = calculate_elo_change(profile.rank, difficulty, is_correct)
        
        # 6. Update MySQL Database
        profile.rank = new_rank
        if is_correct:
            profile.questions_solved += 1
        profile.save()
        
        # Save the attempt record
        UserQuestionRecord.objects.create(
            user_profile=profile,
            question_id=problem_id,
            ai_score=10.0 if is_correct else 0.0,
            user_solution=user_code
        )

        return JsonResponse({
            "status": "success",
            "passed": is_correct,
            "new_rank": new_rank,
            "message": "Rank Updated!" if is_correct else "Tests Failed"
        })

    except UserProfile.DoesNotExist:
        return JsonResponse({"status": "error", "message": "User not found"}, status=404)
