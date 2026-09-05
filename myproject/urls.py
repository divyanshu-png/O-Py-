"""
URL configuration for myproject project.
"""
from django.contrib import admin
from django.urls import path
from examiner.views import (
    admin_assign_assessment_view,
    admin_get_users_view,
    admin_login_view,
    fetch_ai_question,
    get_user_listing_view,
    get_user_profile,
    login_user_view,
    register_user_view,
    student_get_assessments_view,
    submit_code_view,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/register/', register_user_view),
    path('api/login/', login_user_view),
    path('api/admin/login/', admin_login_view),
    path('api/admin/users/', admin_get_users_view),
    path('api/admin/assign-assessment/', admin_assign_assessment_view),
    path('api/student/assessments/', student_get_assessments_view),
    path('api/users/', get_user_listing_view),
    path('api/submit-code/', submit_code_view),
    path('api/get-question/', fetch_ai_question),
    path('api/profile/', get_user_profile),
]
