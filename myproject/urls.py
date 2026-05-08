"""
URL configuration for myproject project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# myproject/urls.py


from django.contrib import admin
from django.urls import path
from examiner.views import get_user_profile
from examiner.views import submit_code_view
from examiner.views import fetch_ai_question

urlpatterns = [
    # FIX 1: Remove the parentheses from get_urls()
    path('admin/', admin.site.urls), 
    
    # FIX 2: Ensure your custom API doesn't have parentheses either
    path('api/submit-code/', submit_code_view), 

    #3. New endpoint that 
    path('api/get-question/', fetch_ai_question),

    path('api/profile/', get_user_profile),
]
