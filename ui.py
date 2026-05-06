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

# 3. Coding Area
with st.container():
    st.markdown('<div class="rounded-box">', unsafe_allow_html=True)
    st.subheader("Coding Area")
    
    code = st.text_area(
        label="Script Editor",
        value="def find_max(numbers):\n    # Your code here\n    pass",
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
    st.subheader(" Test Results")
    
    if run_script:
        # Mock logic for display
        st.error("**Failed:** Expected `10`, Actual `None`")
        st.info("💡 Tip: Ensure you are using the `return` statement.")
    else:
        st.write("Execute your code to see the test output.")
    st.markdown('</div>', unsafe_allow_html=True)   