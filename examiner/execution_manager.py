import subprocess
import sys


def evaluate_submission(user_code, test_cases):
    """
    Runs the user's code against a list of test cases and returns
    detailed results for each test case.
    """
    test_results = []
    all_passed = True
    passed_count = 0

    for idx, test in enumerate(test_cases, start=1):
        test_input = test.get('input')
        expected = test.get('expected')
        
        # We append a call to the user's function at the end of their code
        execution_script = f"{user_code}\nprint(find_max({repr(test_input)}))"

        try:
            process = subprocess.run(
                [sys.executable, "-c", execution_script],
                capture_output=True,
                text=True,
                timeout=5
            )

            stdout = process.stdout.strip()
            stderr = process.stderr.strip()

            if process.returncode != 0:
                passed = False
                actual = "Error during execution"
                error_msg = stderr or "Non-zero exit code"
            else:
                actual = stdout
                error_msg = None
                passed = (stdout == str(expected))

        except subprocess.TimeoutExpired:
            passed = False
            actual = "Time Limit Exceeded"
            error_msg = "Execution timed out (5s limit)."
        except Exception as exc:
            passed = False
            actual = "Execution Exception"
            error_msg = str(exc)

        if passed:
            passed_count += 1
        else:
            all_passed = False

        test_results.append({
            "test_number": idx,
            "input": str(test_input),
            "expected": str(expected),
            "actual": str(actual),
            "passed": passed,
            "error": error_msg
        })

    return {
        "all_passed": all_passed,
        "passed_count": passed_count,
        "total_count": len(test_cases),
        "test_results": test_results
    }