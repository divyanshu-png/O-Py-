import os
import sys

from django.apps import AppConfig


class ExaminerConfig(AppConfig):
    name = 'examiner'

    def ready(self):
        # Load the AI model on the main thread at startup rather than on the
        # first request. Django's dev server handles requests on worker
        # threads, and loading transformers/torch there has been observed to
        # crash the process on Windows.
        is_server_process = os.environ.get('RUN_MAIN') == 'true' or '--noreload' in sys.argv
        if 'runserver' in sys.argv and is_server_process:
            from examiner.ai_manager import warm_up
            warm_up()
