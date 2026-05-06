import subprocess
import sys

def evaluate_submission(user_code, test_cases):
    """
    Runs the user's code against a list of test cases.
    """
    for test in test_cases:
        # We append a call to the user's function at the end of their code
        execution_script = f"{user_code}\nprint(find_max({test['input']}))"
        
        try:
            # Running in a subprocess for basic isolation
            process = subprocess.run(
                [sys.executable, "-c", execution_script],
                capture_output=True, 
                text=True, 
                timeout=2
            )
            
            output = process.stdout.strip()
            if output != str(test['expected']):
                return False
        except Exception:
            return False
            
    return True