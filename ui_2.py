#using the Monaco code editor in #3. coding area to enhance the UI
import os

import requests

try:
    import streamlit as st  # pyright: ignore[reportMissingImports]
except ImportError:
    raise SystemExit("Streamlit is not installed. Run: pip install streamlit")


API_BASE_URL = os.getenv("OPY_API_BASE_URL", "http://127.0.0.1:8000")
if not API_BASE_URL.startswith(("http://", "https://")):
    # Render's private-network fromService value is a bare "host:port"
    API_BASE_URL = f"http://{API_BASE_URL}"
DEFAULT_USER_ID = 1

# Set page to wide to utilize the full horizontal space
st.set_page_config(layout="wide", page_title="Python Lab")

# Custom CSS to mimic the rounded "bubble" look from your sketch
st.markdown("""
    <style>
    .rounded-box {
        border: 2px solid #333;
        border-radius: 25px;
        padding: 20px;
        margin-bottom: 20px;
        background-color: #f9f9f9;
    }
    .stTextArea textarea {
        border-radius: 15px;
    }
    </style>
    """, unsafe_allow_html=True)

# 1. Sidebar: User Profile Collapsible Area
with st.sidebar:
    st.markdown("## User Profile")

    # 1. Fetch live data from Django (AI & Data Tier connection)
    try:
        # Assuming you use a fixed user_id for now or get it from session state
        response = requests.get(
            f"{API_BASE_URL}/api/profile/",
            params={"user_id": DEFAULT_USER_ID},
            timeout=5,
        )

        if response.status_code == 200:
            user_data = response.json()
            st.write(f"Logged in as: **{user_data.get('username', 'Student')}**")

            # 2. Display the ELO Rank prominently
            rank = int(user_data.get('rank', 1200))
            st.metric(label="Current ELO Rank", value=rank)
            st.progress(min(max(rank / 2000, 0), 1), text="Rank Percentile")
        else:
            message = response.json().get("message", "Failed to load profile.")
            st.warning(message)
            st.metric(label="ELO Rank", value="1200")
    except requests.RequestException:
        st.write("Offline Mode: Using cached stats.")
        st.metric(label="ELO Rank", value="1200") # Fallback

    st.divider()
    st.button("Logout")

# Main UI Layout
st.title("Python Exercise Workspace")

# 2. Python Question Area

#2.a. for this we need to first fetch the question by the get new challange that inturn calls the views
def get_new_challenge():
    try:
        resp = requests.get(
            f"{API_BASE_URL}/api/get-question/",
            params={"user_id": DEFAULT_USER_ID},
            timeout=60,  # AI question generation can take ~20-30s on CPU
        )
        if resp.status_code == 200:
            return resp.json()
    except requests.RequestException:
        pass

    return {"question": "Could not load question.", "difficulty": 1200}

# 2.b.  Check if a question exists in session state so it doesn't change on every click
if 'current_question' not in st.session_state:
    with st.spinner("Generating your question..."):
        st.session_state.current_question = get_new_challenge()

# 2.c.  Display it in the Container (referencing line 39-41 of image_6b8fb0.png)
with st.container():
    st.markdown('<div class="rounded-box">', unsafe_allow_html=True)
    st.subheader("DSA Question")
    # Display the AI-generated text here
    st.write(st.session_state.current_question.get('question', 'Could not load question.'))
    st.info(f"Difficulty Level: {st.session_state.current_question.get('difficulty', 1200)}")
    st.markdown('</div>', unsafe_allow_html=True)


# with st.container():
#     st.markdown('<div class="rounded-box">', unsafe_allow_html=True)
#     st.subheader("DSA Question")
#     #question = extract question from the Pre-Trained LLM for the level of the student/user
#     #then feed the question in the write funtion
#     st.write("Write a function `find_max(numbers)` that returns the largest number in a list.")
#     st.markdown('</div>', unsafe_allow_html=True)


try:
    from streamlit_monaco import st_monaco
except ImportError:
    st_monaco = None
# 3. Coding Area
with st.container():
    st.markdown('<div class="rounded-box">', unsafe_allow_html=True)
    st.subheader("Coding Area")

    if st_monaco is not None:
        code = st_monaco(
            value=" # Your code here -- With Monaco",
            height=250,
            language="python",
            theme='vs-dark',
        )
    else:
        code = st.text_area(
            label="Script Editor",
            value="# Your code here -- Without Monaco",
            height=250,
            label_visibility="collapsed",
        )

    # 4. Run Button (Aligned to the right)
    col_space, col_btn = st.columns([0.9, 0.1])
    with col_btn:
        run_script = st.button("Run ")
    st.markdown('</div>', unsafe_allow_html=True)

# 5. Test Results Area
with st.container():
    st.markdown('<div class="rounded-box">', unsafe_allow_html=True)
    st.subheader("Test Results")

    if run_script:
        payload = {
            "user_id": DEFAULT_USER_ID,
            "code": code,
            "problem_id": "max_val_01",
            "difficulty": 1100,
        }

        try:
            with st.spinner("Evaluating against hidden tests..."):
                # AI feedback generation can take ~20-30s on CPU
                response = requests.post(f"{API_BASE_URL}/api/submit-code/", json=payload, timeout=60)

                if response.status_code == 200:
                    result = response.json()

                    if result.get('passed'):
                        st.success(f"Correct! New Rank: {result.get('new_rank', 'unknown')}")
                        st.balloons()
                    else:
                        st.error(f"Failed: {result.get('message', 'Check your logic.')}")
                        st.info(f"Current Rank: {result.get('new_rank', 'unknown')}")
                else:
                    try:
                        message = response.json().get("message", "Could not connect to the Django Backend.")
                    except ValueError:
                        message = "Could not connect to the Django Backend."
                    st.error(message)
        except requests.RequestException as e:
            st.error(f"Connection Error: {e}")

    else:
        st.write("Execute your code to see the test output.")
    st.markdown('</div>', unsafe_allow_html=True)
