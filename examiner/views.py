from django.db import DatabaseError
from django.http import JsonResponse
from rest_framework.decorators import api_view

from examiner.ai_manager import generate_new_question, get_ai_feedback
from examiner.execution_manager import evaluate_submission
from examiner.models import UserProfile, UserQuestionRecord
from examiner.ranking_logic import calculate_elo_change


@api_view(['GET'])
def get_user_profile(request):
    user_id = request.GET.get('user_id', 1)

    try:
        profile = UserProfile.objects.select_related('user').get(user_id=user_id)
        return JsonResponse({
            "username": profile.user.username or profile.username_alt,
            "rank": profile.rank,
            "questions_solved": profile.questions_solved,
        })
    except UserProfile.DoesNotExist:
        return JsonResponse({
            "status": "error",
            "message": f"No profile found for user_id={user_id}. Create a Django user/profile first.",
        }, status=404)
    except DatabaseError as exc:
        return JsonResponse({
            "status": "error",
            "message": "Database connection failed. Check SQL Server/SQLEXPRESS and ODBC settings.",
            "detail": str(exc),
        }, status=503)


@api_view(['GET'])
def fetch_ai_question(request):
    user_id = request.GET.get('user_id', 1)

    try:
        profile = UserProfile.objects.get(user_id=user_id)
        difficulty = profile.rank
    except UserProfile.DoesNotExist:
        return JsonResponse({
            "status": "error",
            "message": f"No profile found for user_id={user_id}.",
        }, status=404)
    except DatabaseError as exc:
        return JsonResponse({
            "question": "Write a function `find_max(numbers)` that returns the largest number in a list.",
            "difficulty": 1000,
            "offline": True,
            "message": "Database connection failed, so a fallback challenge was loaded.",
            "detail": str(exc),
        })

    question_text = generate_new_question(difficulty)
    return JsonResponse({
        "question": question_text,
        "difficulty": difficulty,
    })


@api_view(['POST'])
def submit_code_view(request):
    user_id = request.data.get('user_id')
    user_code = request.data.get('code') or ""
    problem_id = request.data.get('problem_id') or "unknown_problem"
    try:
        difficulty = int(request.data.get('difficulty', 1200))
    except (TypeError, ValueError):
        difficulty = 1200

    try:
        profile = UserProfile.objects.get(user_id=user_id)

        # In a real app, fetch these from a Problem model, keyed by problem_id.
        # These match the demo `find_max(numbers)` problem shown by the frontend.
        test_cases = [
            {'input': [3, 1, 4, 1, 5, 9, 2, 6], 'expected': 9},
            {'input': [-5, -1, -10], 'expected': -1},
        ]
        is_correct = evaluate_submission(user_code, test_cases)
        ai_results = get_ai_feedback(user_code, problem_description=problem_id)

        new_rank = calculate_elo_change(profile.rank, difficulty, is_correct)

        profile.rank = new_rank
        if is_correct:
            profile.questions_solved += 1
        profile.save()

        UserQuestionRecord.objects.create(
            user_profile=profile,
            question_id=problem_id,
            ai_score=10.0 if is_correct else 0.0,
            user_solution=user_code,
            optimized_code_snippet=str(ai_results),
        )

        return JsonResponse({
            "status": "success",
            "passed": is_correct,
            "new_rank": new_rank,
            "ai_analysis": ai_results,
            "message": (
                "Rank updated and feedback received."
                if is_correct and ai_results
                else "Check your logic or AI connection."
            ),
        })
    except UserProfile.DoesNotExist:
        return JsonResponse({"status": "error", "message": "User not found"}, status=404)
    except DatabaseError as exc:
        return JsonResponse({
            "status": "error",
            "message": "Database connection failed. Check SQL Server/SQLEXPRESS and ODBC settings.",
            "detail": str(exc),
        }, status=503)
