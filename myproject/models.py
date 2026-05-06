
from django.db import models  # type: ignore[import]
from django.contrib.auth.models import User  # type: ignore[import]

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    username_alt = models.CharField(max_length=150, unique=True)
    rank = models.IntegerField(default=1000)
    questions_solved = models.IntegerField(default=0)

    def __str__(self):
        return self.username_alt

class UserQuestionRecord(models.Model):
    user_profile = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    question_id = models.CharField(max_length=255)
    ai_score = models.FloatField()
    attempts = models.PositiveIntegerField(default=1)
    # MySQL handles DateTimeField efficiently for tracking solve times
    timestamp = models.DateTimeField(auto_now_add=True)
    user_solution = models.TextField() # The actual code they wrote
    optimized_code_snippet = models.TextField()

    def __str__(self):
        return f"{self.user_profile.username_alt} - Q: {self.question_id}"