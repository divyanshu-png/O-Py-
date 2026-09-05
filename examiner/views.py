from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import DatabaseError
from django.http import JsonResponse
from django.utils import timezone
from rest_framework.decorators import api_view

from examiner.ai_manager import generate_new_question, get_ai_feedback
from examiner.execution_manager import evaluate_submission
from examiner.models import UserProfile, UserQuestionRecord, Assessment
from examiner.ranking_logic import calculate_elo_change, get_rank_badge


@api_view(['POST'])
def register_user_view(request):
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '').strip()

    if not username:
        return JsonResponse({"status": "error", "message": "Username is required."}, status=400)
    if not password:
        return JsonResponse({"status": "error", "message": "Password is required."}, status=400)

    if User.objects.filter(username=username).exists():
        return JsonResponse({"status": "error", "message": "Username already exists."}, status=400)

    try:
        user = User.objects.create_user(username=username, password=password)
        profile = UserProfile.objects.create(
            user=user,
            username_alt=username,
            rank=1500,  # LeetCode initial rating
            questions_solved=0
        )
        return JsonResponse({
            "status": "success",
            "user_id": user.id,
            "username": user.username,
            "rank": profile.rank,
            "badge": profile.get_badge(),
            "questions_solved": profile.questions_solved,
            "message": "User registered successfully."
        })
    except Exception as exc:
        return JsonResponse({"status": "error", "message": str(exc)}, status=500)


@api_view(['POST'])
def login_user_view(request):
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '').strip()

    if not username or not password:
        return JsonResponse({"status": "error", "message": "Username and password are required."}, status=400)

    user = authenticate(username=username, password=password)
    if user is None:
        try:
            user = User.objects.get(username=username)
            if not user.check_password(password):
                return JsonResponse({"status": "error", "message": "Invalid credentials."}, status=400)
        except User.DoesNotExist:
            return JsonResponse({"status": "error", "message": "User does not exist. Please register first."}, status=400)

    try:
        profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults={"username_alt": user.username, "rank": 1500, "questions_solved": 0}
        )
        return JsonResponse({
            "status": "success",
            "user_id": user.id,
            "username": user.username,
            "rank": profile.rank,
            "badge": profile.get_badge(),
            "is_admin": user.is_staff or user.is_superuser,
            "questions_solved": profile.questions_solved,
            "message": "Logged in successfully."
        })
    except DatabaseError as exc:
        return JsonResponse({"status": "error", "message": str(exc)}, status=503)


# --- ADMIN ENDPOINTS ---

@api_view(['POST'])
def admin_login_view(request):
    username = request.data.get('username', '').strip()
    password = request.data.get('password', '').strip()

    if not username or not password:
        return JsonResponse({"status": "error", "message": "Admin credentials required."}, status=400)

    user = authenticate(username=username, password=password)
    
    # Auto-provision superuser for demo/testing if default admin logging in
    if user is None and username == 'admin' and password == 'admin123':
        user, _ = User.objects.get_or_create(username='admin', defaults={'is_staff': True, 'is_superuser': True})
        user.set_password('admin123')
        user.is_staff = True
        user.is_superuser = True
        user.save()
        UserProfile.objects.get_or_create(user=user, defaults={'username_alt': 'admin', 'rank': 1500})
        user = authenticate(username='admin', password='admin123')

    if user is None or not (user.is_staff or user.is_superuser):
        return JsonResponse({"status": "error", "message": "Invalid admin credentials or insufficient privileges."}, status=403)

    return JsonResponse({
        "status": "success",
        "is_admin": True,
        "user_id": user.id,
        "username": user.username,
        "message": "Admin authenticated successfully."
    })


@api_view(['GET'])
def admin_get_users_view(request):
    try:
        profiles = UserProfile.objects.select_related('user').all().order_by('-questions_solved', '-rank')
        users_data = []
        for profile in profiles:
            records = UserQuestionRecord.objects.filter(user_profile=profile).order_by('-timestamp')[:10]
            solved_questions = [
                {
                    "question_id": rec.question_id,
                    "ai_score": rec.ai_score,
                    "timestamp": rec.timestamp.strftime("%Y-%m-%d %H:%M:%S")
                }
                for rec in records
            ]
            assessments = Assessment.objects.filter(assigned_to=profile).order_by('-created_at')
            assessment_list = [
                {
                    "id": a.id,
                    "title": a.title,
                    "status": a.status,
                    "difficulty": a.difficulty,
                    "created_at": a.created_at.strftime("%Y-%m-%d %H:%M:%S")
                }
                for a in assessments
            ]
            users_data.append({
                "user_id": profile.user.id if profile.user else profile.id,
                "username": profile.user.username if profile.user else profile.username_alt,
                "rank": profile.rank,
                "badge": profile.get_badge(),
                "questions_solved": profile.questions_solved,
                "solved_questions": solved_questions,
                "assessments": assessment_list
            })
        return JsonResponse({"status": "success", "users": users_data})
    except DatabaseError as exc:
        return JsonResponse({"status": "error", "message": str(exc)}, status=503)


@api_view(['POST'])
def admin_assign_assessment_view(request):
    admin_id = request.data.get('admin_id')
    student_user_id = request.data.get('student_user_id')
    title = request.data.get('title', '').strip()
    problem_description = request.data.get('problem_description', '').strip()
    try:
        difficulty = int(request.data.get('difficulty', 1600))
    except (TypeError, ValueError):
        difficulty = 1600

    if not title or not problem_description:
        return JsonResponse({"status": "error", "message": "Title and Problem Description are required."}, status=400)

    try:
        admin_user = User.objects.get(id=admin_id)
        student_profile = UserProfile.objects.get(user_id=student_user_id)

        assessment = Assessment.objects.create(
            assigned_by=admin_user,
            assigned_to=student_profile,
            title=title,
            problem_description=problem_description,
            difficulty=difficulty,
            status='Pending'
        )

        return JsonResponse({
            "status": "success",
            "assessment_id": assessment.id,
            "message": f"Assessment '{title}' assigned to {student_profile.username_alt} successfully."
        })
    except UserProfile.DoesNotExist:
        return JsonResponse({"status": "error", "message": "Target student profile not found."}, status=404)
    except Exception as exc:
        return JsonResponse({"status": "error", "message": str(exc)}, status=500)


@api_view(['GET'])
def student_get_assessments_view(request):
    user_id = request.GET.get('user_id')
    if not user_id:
        return JsonResponse({"status": "error", "message": "user_id is required."}, status=400)

    try:
        profile = UserProfile.objects.get(user_id=user_id)
        assessments = Assessment.objects.filter(assigned_to=profile).order_by('-created_at')
        list_data = [
            {
                "id": a.id,
                "title": a.title,
                "problem_description": a.problem_description,
                "difficulty": a.difficulty,
                "status": a.status,
                "created_at": a.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                "completed_at": a.completed_at.strftime("%Y-%m-%d %H:%M:%S") if a.completed_at else None
            }
            for a in assessments
        ]
        return JsonResponse({"status": "success", "assessments": list_data})
    except UserProfile.DoesNotExist:
        return JsonResponse({"status": "error", "message": "User profile not found."}, status=404)


@api_view(['GET'])
def get_user_listing_view(request):
    try:
        profiles = UserProfile.objects.select_related('user').all().order_by('-questions_solved', '-rank')
        users_data = []
        for profile in profiles:
            records = UserQuestionRecord.objects.filter(user_profile=profile).order_by('-timestamp')[:10]
            solved_questions = [
                {
                    "question_id": rec.question_id,
                    "ai_score": rec.ai_score,
                    "timestamp": rec.timestamp.strftime("%Y-%m-%d %H:%M:%S")
                }
                for rec in records
            ]
            users_data.append({
                "user_id": profile.user.id if profile.user else profile.id,
                "username": profile.user.username if profile.user else profile.username_alt,
                "rank": profile.rank,
                "badge": profile.get_badge(),
                "questions_solved": profile.questions_solved,
                "solved_questions": solved_questions
            })
        return JsonResponse({"status": "success", "users": users_data})
    except DatabaseError as exc:
        return JsonResponse({"status": "error", "message": str(exc)}, status=503)


@api_view(['GET'])
def get_user_profile(request):
    user_id = request.GET.get('user_id', 1)

    try:
        profile = UserProfile.objects.select_related('user').get(user_id=user_id)
        return JsonResponse({
            "username": profile.user.username or profile.username_alt,
            "rank": profile.rank,
            "badge": profile.get_badge(),
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
            "difficulty": 1500,
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
    assessment_id = request.data.get('assessment_id')
    try:
        difficulty = int(request.data.get('difficulty', 1500))
    except (TypeError, ValueError):
        difficulty = 1500

    try:
        profile = UserProfile.objects.get(user_id=user_id)

        test_cases = [
            {'input': [3, 1, 4, 1, 5, 9, 2, 6], 'expected': 9},
            {'input': [-5, -1, -10], 'expected': -1},
        ]
        eval_res = evaluate_submission(user_code, test_cases)
        is_correct = eval_res.get("all_passed", False)
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

        # Mark assessment as completed if linked to an assessment ID
        if assessment_id and is_correct:
            try:
                asm = Assessment.objects.get(id=assessment_id, assigned_to=profile)
                asm.status = 'Completed'
                asm.completed_at = timezone.now()
                asm.user_solution = user_code
                asm.save()
            except Assessment.DoesNotExist:
                pass

        return JsonResponse({
            "status": "success",
            "passed": is_correct,
            "passed_count": eval_res.get("passed_count", 0),
            "total_count": eval_res.get("total_count", len(test_cases)),
            "test_results": eval_res.get("test_results", []),
            "new_rank": new_rank,
            "badge": profile.get_badge(),
            "ai_analysis": ai_results,
            "message": (
                "All test cases passed! Rank updated and feedback received."
                if is_correct
                else f"Passed {eval_res.get('passed_count', 0)}/{eval_res.get('total_count', len(test_cases))} test cases. Check your logic."
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
