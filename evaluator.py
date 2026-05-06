import subprocess
import sys
from io import StringIO

def run_unit_test(user_code, test_input, expected_output):
    """
    Simulates the 'Execution & Evaluation' block from the pipeline.
    Runs user code in a sub-environment.
    """
    # Wrapping user code to capture output
    full_code = f"""
{user_code}
print(solution({test_input}))
    """
    
    try:
        # Step 5 Logic: Executing the code safely
        result = subprocess.run(
            [sys.executable, "-c", full_code],
            capture_output=True,
            text=True,
            timeout=2  # Prevents infinite loops
        )
        
        actual_output = result.stdout.strip()
        
        if actual_output == str(expected_output):
            return True, "Passed"
        else:
            return False, f"Expected {expected_output}, but got {actual_output}"
            
    except subprocess.TimeoutExpired:
        return False, "Error: Time Limit Exceeded"
    except Exception as e:
        return False, f"Runtime Error: {str(e)}"

# Example Usage for your testing
if __name__ == "__main__":
    code_from_monaco = "def solution(x): return x * 2"
    passed, message = run_unit_test(code_from_monaco, 5, 10)
    print(f"Result: {message}")