from django.contrib.auth.models import User
from django.db import models


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    username_alt = models.CharField(max_length=150, unique=True)
    rank = models.IntegerField(default=1500)  # LeetCode default rating: 1500
    questions_solved = models.IntegerField(default=0)
    full_name = models.CharField(max_length=150, blank=True, default='')
    bio = models.TextField(blank=True, default='Passionate Python & DSA Practitioner.')
    avatar_url = models.CharField(max_length=500, blank=True, default='')
    favorite_topics = models.CharField(max_length=255, blank=True, default='Python, Algorithms, Dynamic Programming')

    def __str__(self):
        return self.username_alt

    def get_badge(self):
        if self.rank >= 2150:
            return "Guardian"
        elif self.rank >= 1850:
            return "Knight"
        else:
            return "Contestant"


class UserQuestionRecord(models.Model):
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    question_id = models.CharField(max_length=255)
    ai_score = models.FloatField()
    attempts = models.PositiveIntegerField(default=1)
    timestamp = models.DateTimeField(auto_now_add=True)
    user_solution = models.TextField()
    optimized_code_snippet = models.TextField()

    def __str__(self):
        return f"{self.user_profile.username_alt} - Q: {self.question_id}"


class Assessment(models.Model):
    assigned_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='assigned_assessments')
    assigned_to = models.ForeignKey(UserProfile, on_delete=models.CASCADE, related_name='assessments')
    title = models.CharField(max_length=255)
    problem_description = models.TextField()
    difficulty = models.IntegerField(default=1600)  # Easy=1200, Medium=1600, Hard=2000
    status = models.CharField(max_length=20, default='Pending')  # 'Pending' or 'Completed'
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    user_solution = models.TextField(blank=True, default='')

    def __str__(self):
        return f"Assessment '{self.title}' -> {self.assigned_to.username_alt} ({self.status})"
