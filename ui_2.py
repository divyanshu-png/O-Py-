# using the Monaco code editor in coding area to enhance the UI
import os
import requests

try:
    import streamlit as st  # pyright: ignore[reportMissingImports]
except ImportError:
    raise SystemExit("Streamlit is not installed. Run: pip install streamlit")

try:
    from streamlit_monaco import st_monaco
except ImportError:
    st_monaco = None


API_BASE_URL = os.getenv("OPY_API_BASE_URL", "http://127.0.0.1:8000")
if not API_BASE_URL.startswith(("http://", "https://")):
    API_BASE_URL = f"http://{API_BASE_URL}"

# Set page layout
st.set_page_config(layout="wide", page_title="O(Py) DSA Examiner", page_icon="🐍")

# Custom CSS for styling
st.markdown("""
    <style>
    .main-header {
        background: linear-gradient(135deg, #1e1e2f 0%, #2d2b55 100%);
        padding: 25px;
        border-radius: 20px;
        color: white;
        text-align: center;
        margin-bottom: 25px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }
    .rounded-box {
        border: 2px solid #3d3b66;
        border-radius: 20px;
        padding: 22px;
        margin-bottom: 25px;
        background-color: #ffffff;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    .stat-card {
        background: #f4f6f9;
        border-radius: 15px;
        padding: 15px;
        text-align: center;
        border: 1px solid #e0e0e0;
    }
    .stTextArea textarea {
        border-radius: 15px;
    }
    </style>
    """, unsafe_allow_html=True)

# Initialize Session State
if "authenticated" not in st.session_state:
    st.session_state.authenticated = False
if "user_id" not in st.session_state:
    st.session_state.user_id = None
if "username" not in st.session_state:
    st.session_state.username = ""
if "rank" not in st.session_state:
    st.session_state.rank = 1000
if "questions_solved" not in st.session_state:
    st.session_state.questions_solved = 0
if "screen" not in st.session_state:
    st.session_state.screen = "login"


def refresh_profile_data():
    if st.session_state.user_id:
        try:
            resp = requests.get(
                f"{API_BASE_URL}/api/profile/",
                params={"user_id": st.session_state.user_id},
                timeout=5,
            )
            if resp.status_code == 200:
                data = resp.json()
                st.session_state.username = data.get("username", st.session_state.username)
                st.session_state.rank = data.get("rank", st.session_state.rank)
                st.session_state.questions_solved = data.get("questions_solved", st.session_state.questions_solved)
        except requests.RequestException:
            pass


# Sidebar Configuration
with st.sidebar:
    st.markdown("## 🐍 O(Py) DSA System")
    st.divider()

    if st.session_state.authenticated:
        st.markdown(f"👤 Logged in as: **{st.session_state.username}**")
        st.metric(label="Current ELO Rank", value=st.session_state.rank)
        st.metric(label="Questions Solved", value=st.session_state.questions_solved)
        rank_percentile = min(max(st.session_state.rank / 2000, 0.0), 1.0)
        st.progress(rank_percentile, text="Rank Progress")

        st.divider()

        if st.button("🏠 Dashboard / Start Test", use_container_width=True):
            st.session_state.screen = "start_test"
            st.rerun()

        if st.button("💻 Coding Workspace", use_container_width=True):
            st.session_state.screen = "workspace"
            st.rerun()

        st.divider()
        if st.button("🚪 Logout", use_container_width=True):
            st.session_state.authenticated = False
            st.session_state.user_id = None
            st.session_state.username = ""
            st.session_state.screen = "login"
            st.session_state.pop("current_question", None)
            st.rerun()
    else:
        st.info("Please login or register to access your DSA tests.")


# Helper to fetch user listing from database
def get_database_users():
    try:
        resp = requests.get(f"{API_BASE_URL}/api/users/", timeout=5)
        if resp.status_code == 200:
            return resp.json().get("users", [])
    except requests.RequestException:
        pass
    return []


# SCREEN 1: LOGIN / REGISTER LANDING PAGE
if not st.session_state.authenticated or st.session_state.screen == "login":
    st.markdown("""
        <div class="main-header">
            <h1>🐍 O(Py) - DSA Examiner Landing</h1>
            <p>Master Python Data Structures & Algorithms with AI-driven Adaptive Challenges</p>
        </div>
    """, unsafe_allow_html=True)

    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        st.markdown('<div class="rounded-box">', unsafe_allow_html=True)
        tab_login, tab_register = st.tabs(["🔐 Login", "📝 Register New User"])

        with tab_login:
            st.subheader("Login to Your Account")
            login_username = st.text_input("Username", key="login_user")
            login_password = st.text_input("Password", type="password", key="login_pass")

            if st.button("Log In", type="primary", use_container_width=True):
                if not login_username or not login_password:
                    st.error("Please provide both username and password.")
                else:
                    try:
                        resp = requests.post(
                            f"{API_BASE_URL}/api/login/",
                            json={"username": login_username, "password": login_password},
                            timeout=10,
                        )
                        if resp.status_code == 200:
                            data = resp.json()
                            st.session_state.authenticated = True
                            st.session_state.user_id = data.get("user_id")
                            st.session_state.username = data.get("username")
                            st.session_state.rank = data.get("rank", 1000)
                            st.session_state.questions_solved = data.get("questions_solved", 0)
                            st.session_state.screen = "start_test"
                            st.success(f"Welcome back, {st.session_state.username}!")
                            st.rerun()
                        else:
                            msg = resp.json().get("message", "Login failed.")
                            st.error(msg)
                    except requests.RequestException as e:
                        st.error(f"Connection Error to Backend: {e}")

        with tab_register:
            st.subheader("Create a New Account")
            reg_username = st.text_input("Choose Username", key="reg_user")
            reg_password = st.text_input("Choose Password", type="password", key="reg_pass")

            if st.button("Register & Get Started", type="primary", use_container_width=True):
                if not reg_username or not reg_password:
                    st.error("Please enter both username and password.")
                else:
                    try:
                        resp = requests.post(
                            f"{API_BASE_URL}/api/register/",
                            json={"username": reg_username, "password": reg_password},
                            timeout=10,
                        )
                        if resp.status_code in (200, 201):
                            data = resp.json()
                            st.session_state.authenticated = True
                            st.session_state.user_id = data.get("user_id")
                            st.session_state.username = data.get("username")
                            st.session_state.rank = data.get("rank", 1000)
                            st.session_state.questions_solved = data.get("questions_solved", 0)
                            st.session_state.screen = "start_test"
                            st.success("Account created successfully!")
                            st.rerun()
                        else:
                            msg = resp.json().get("message", "Registration failed.")
                            st.error(msg)
                    except requests.RequestException as e:
                        st.error(f"Connection Error: {e}")

        st.markdown('</div>', unsafe_allow_html=True)


# SCREEN 2: START TEST LANDING PAGE (DASHBOARD)
elif st.session_state.screen == "start_test":
    refresh_profile_data()

    st.markdown(f"""
        <div class="main-header">
            <h1>🚀 Start Test Landing Page</h1>
            <p>Welcome back, <strong>{st.session_state.username}</strong>! Ready to test your DSA skills?</p>
        </div>
    """, unsafe_allow_html=True)

    col1, col2 = st.columns([1, 1])

    with col1:
        st.markdown('<div class="rounded-box">', unsafe_allow_html=True)
        st.subheader("🎯 Start Your Test Session")
        st.write("Click below to generate an AI-adapted question matching your ELO level and start coding.")

        st.markdown("<br>", unsafe_allow_html=True)
        if st.button("🚀 Start DSA Test Now", type="primary", use_container_width=True):
            st.session_state.screen = "workspace"
            st.rerun()
        st.markdown('</div>', unsafe_allow_html=True)

    with col2:
        st.markdown('<div class="rounded-box">', unsafe_allow_html=True)
        st.subheader("📊 Your Performance Overview")
        st.metric(label="Current ELO Rank", value=st.session_state.rank)
        st.metric(label="Total Questions Solved", value=st.session_state.questions_solved)
        st.markdown('</div>', unsafe_allow_html=True)

    st.markdown("---")

    # DATABASE USER LISTING AND QUESTION TRACKING SECTION
    st.subheader("🗄️ Database User Listing & Question History")
    st.write("Live listing of registered users in the database and questions solved by each user:")

    users_list = get_database_users()

    if users_list:
        table_data = []
        for user_entry in users_list:
            solved_qs = user_entry.get("solved_questions", [])
            recent_q_summary = (
                ", ".join([q["question_id"] for q in solved_qs[:3]])
                if solved_qs
                else "None yet"
            )
            table_data.append({
                "User ID": user_entry.get("user_id"),
                "Username": user_entry.get("username"),
                "ELO Rank": user_entry.get("rank"),
                "Questions Solved": user_entry.get("questions_solved"),
                "Recent Solved Questions": recent_q_summary,
            })

        st.dataframe(table_data, use_container_width=True)

        with st.expander("🔍 View Detailed User Solved Question History"):
            for user_entry in users_list:
                st.markdown(f"### 👤 User: `{user_entry.get('username')}` (Rank: {user_entry.get('rank')}, Solved: {user_entry.get('questions_solved')})")
                solved_qs = user_entry.get("solved_questions", [])
                if solved_qs:
                    for q in solved_qs:
                        st.markdown(f"- **Question**: `{q['question_id']}` | **Score**: {q['ai_score']} | **Time**: {q['timestamp']}")
                else:
                    st.write("No solved questions recorded yet.")
                st.divider()
    else:
        st.info("No database users found or unable to fetch user listing.")


# SCREEN 3: DSA CODING EXERCISE WORKSPACE
elif st.session_state.screen == "workspace":
    refresh_profile_data()

    col_title, col_nav = st.columns([0.8, 0.2])
    with col_title:
        st.title("💻 Python Exercise Workspace")
    with col_nav:
        if st.button("← Back to Dashboard"):
            st.session_state.screen = "start_test"
            st.rerun()

    def get_new_challenge():
        try:
            resp = requests.get(
                f"{API_BASE_URL}/api/get-question/",
                params={"user_id": st.session_state.user_id},
                timeout=60,
            )
            if resp.status_code == 200:
                return resp.json()
        except requests.RequestException:
            pass
        return {"question": "Write a function `find_max(numbers)` that returns the largest number in a list.", "difficulty": st.session_state.rank}

    if "current_question" not in st.session_state:
        with st.spinner("Generating adaptive question..."):
            st.session_state.current_question = get_new_challenge()

    # Question Container
    with st.container():
        st.markdown('<div class="rounded-box">', unsafe_allow_html=True)
        st.subheader("DSA Question")
        st.write(st.session_state.current_question.get("question", "Could not load question."))
        st.info(f"Difficulty Level: {st.session_state.current_question.get('difficulty', st.session_state.rank)}")

        if st.button("🔄 Get New Challenge"):
            st.session_state.pop("current_question", None)
            st.rerun()

        st.markdown('</div>', unsafe_allow_html=True)

    # Coding Area
    with st.container():
        st.markdown('<div class="rounded-box">', unsafe_allow_html=True)
        st.subheader("Coding Area")

        default_code = "def find_max(numbers):\n    # Write your solution here\n    return max(numbers)\n"

        if st_monaco is not None:
            code = st_monaco(
                value=default_code,
                height=250,
                language="python",
                theme="vs-dark",
            )
        else:
            code = st.text_area(
                label="Script Editor",
                value=default_code,
                height=250,
                label_visibility="collapsed",
            )

        col_space, col_btn = st.columns([0.85, 0.15])
        with col_btn:
            run_script = st.button("Run & Submit Code", type="primary", use_container_width=True)
        st.markdown('</div>', unsafe_allow_html=True)

    # Test Results Area
    with st.container():
        st.markdown('<div class="rounded-box">', unsafe_allow_html=True)
        st.subheader("🧪 Test Execution Results & Database Record")

        if run_script:
            payload = {
                "user_id": st.session_state.user_id,
                "code": code,
                "problem_id": "find_max_numbers",
                "difficulty": st.session_state.current_question.get("difficulty", st.session_state.rank),
            }

            try:
                with st.spinner("Evaluating against test cases & registering database record..."):
                    response = requests.post(f"{API_BASE_URL}/api/submit-code/", json=payload, timeout=60)

                    if response.status_code == 200:
                        result = response.json()
                        passed = result.get("passed", False)
                        passed_cnt = result.get("passed_count", 0)
                        total_cnt = result.get("total_count", 0)
                        test_cases_res = result.get("test_results", [])

                        if passed:
                            st.success(f"🎉 All {total_cnt} Test Cases Passed! New ELO Rank: {result.get('new_rank', 'unknown')}")
                            st.balloons()
                            st.info("Question solve recorded in SQLite Database for your account!")
                            refresh_profile_data()
                        else:
                            st.error(f"❌ Submission Failed: Passed {passed_cnt}/{total_cnt} Test Cases. New Rank: {result.get('new_rank', st.session_state.rank)}")

                        # Display Per-Test Case Results breakdown
                        if test_cases_res:
                            st.markdown("#### 📋 Test Case Details")
                            for tc in test_cases_res:
                                is_tc_passed = tc.get("passed", False)
                                status_label = "✅ PASSED" if is_tc_passed else "❌ FAILED"
                                
                                with st.expander(f"Test #{tc.get('test_number')} — {status_label}", expanded=True):
                                    col_a, col_b, col_c = st.columns(3)
                                    with col_a:
                                        st.markdown("**Input:**")
                                        st.code(tc.get("input", ""))
                                    with col_b:
                                        st.markdown("**Expected Output:**")
                                        st.code(tc.get("expected", ""))
                                    with col_c:
                                        st.markdown("**Actual Output:**")
                                        st.code(tc.get("actual", ""))

                                    if tc.get("error"):
                                        st.error(f"Execution Error: {tc.get('error')}")

                        if result.get("ai_analysis"):
                            with st.expander("🤖 View AI Code Analysis"):
                                st.write(result["ai_analysis"].get("summary", ""))
                    else:
                        msg = response.json().get("message", "Backend error.")
                        st.error(msg)
            except requests.RequestException as e:
                st.error(f"Connection Error: {e}")
        else:
            st.write("Execute your code to submit and see the test output.")
        st.markdown('</div>', unsafe_allow_html=True)

