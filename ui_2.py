#using the Monaco code editor in #3. coding area to enhance the UI 

try:
    import streamlit as st  # pyright: ignore[reportMissingImports]
except ImportError:
    streamlit = None

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
    st.markdown("User Profile")
    st.write("Logged in as: **Dev_User**")
    st.progress(65, text="Course Progress")
    st.divider()
    st.button("Logout")

# Main UI Layout
st.title("Python Exercise Workspace")

# 2. Python Question Area
with st.container():
    st.markdown('<div class="rounded-box">', unsafe_allow_html=True)
    st.subheader("DSA Question")
    #question = extract question from the Pre-Trained LLM for the level of the student/user
    #then feed the question in the write funtion
    st.write("Write a function `find_max(numbers)` that returns the largest number in a list.")
    st.markdown('</div>', unsafe_allow_html=True)


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
            theme= 'vs-dark'
        )
    else:
        code = st.text_area(
            label="Script Editor",
        value="# Your code here -- Without Monaco",
        height=250,
        label_visibility="collapsed"
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
        # --- INSERTED REAL BACKEND LOGIC START ---
        import requests
        
        # Prepare the data to send to Django
        payload = {
            "user_id": 1,           # Static for now, link to your DB user later
            "code": code,           # This variable 'code' comes from your st.text_area
            "problem_id": "max_val_01", 
            "difficulty": 1100
        }

        try:
            with st.spinner("Evaluating against hidden tests..."):
                # Call the Django API endpoint
                response = requests.post("http://127.0.0.1:8000/api/submit-code/", json=payload, timeout=5)
                
                if response.status_code == 200:
                    result = response.json()
                    
                    if result['passed']:
                        st.success(f"🎉 Correct! New Rank: {result['new_rank']}")
                        st.balloons()
                    else:
                        st.error(f"❌ Failed: {result.get('message', 'Check your logic.')}")
                        st.info(f"Current Rank: {result['new_rank']}")
                else:
                    st.error("Could not connect to the Django Backend.")
        except Exception as e:
            st.error(f"Connection Error: {e}")
        # --- INSERTED REAL BACKEND LOGIC END ---
        
    else:
        st.write("Execute your code to see the test output.")
    st.markdown('</div>', unsafe_allow_html=True)