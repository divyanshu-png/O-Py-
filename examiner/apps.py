import os
import sys

from django.apps import AppConfig


class ExaminerConfig(AppConfig):
    name = 'examiner'

    def ready(self):
        # Load the AI model on the main thread at startup rather than on the
        # first request. Django's dev server handles requests on worker
        # threads, and loading transformers/torch there has been observed to
        # crash the process on Windows. It also avoids a slow/timed-out first
        # request in production, where gunicorn doesn't go through manage.py
        # at all (so there's no 'runserver' argv to key off of).
        argv0 = os.path.basename(sys.argv[0]) if sys.argv else ''
        if argv0 == 'manage.py':
            is_server_process = os.environ.get('RUN_MAIN') == 'true' or '--noreload' in sys.argv
            should_warm_up = 'runserver' in sys.argv and is_server_process
        else:
            # Not a management command (e.g. running under gunicorn) - always a serving process.
            should_warm_up = True

        if should_warm_up:
            from examiner.ai_manager import warm_up
            warm_up()
