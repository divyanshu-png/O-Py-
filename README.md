# O(Py)

### **Project Description**
**O(Py) – DSA Examiner** is an adaptive, AI-powered Data Structures and Algorithms (DSA) examination, learning, and ranking platform tailored for Python programmers. Inspired by LeetCode contest systems, the platform features dynamic AI question generation, automated code execution & sandboxed test validation, Big-O time/space complexity analysis, and an ELO-based user ranking system with tier badges.

---

### **Key Features**
* **Adaptive ELO Rating System**: Dynamically computes ratings (starting at 1500 ELO) based on problem difficulty (Easy: 1200, Medium: 1600, Hard: 2000) and awards badges such as *Contestant*, *Knight*, and *Guardian* (see [ranking_logic.py](file:///d:/CODER_BODER/O%28Py%29-%20DSA%20Examiner%20Project/examiner/ranking_logic.py)).
* **AI Question Generation & Feedback**: Employs Hugging Face Transformers (`Qwen/Qwen2.5-0.5B-Instruct`) to generate personalized DSA challenges matching the student's rating and provide time/space complexity feedback on submissions (see [ai_manager.py](file:///d:/CODER_BODER/O%28Py%29-%20DSA%20Examiner%20Project/examiner/ai_manager.py)).
* **Sandboxed Code Execution Engine**: Subprocess-isolated test runner that executes user Python submissions against test suites, capturing return codes, stdout/stderr, and enforcing execution timeouts (see [execution_manager.py](file:///d:/CODER_BODER/O%28Py%29-%20DSA%20Examiner%20Project/examiner/execution_manager.py)).
* **Instructor & Admin Management**: Built-in administration workflow allowing instructors to track student progress, inspect solve histories, and assign targeted assessments with custom difficulty levels (see [views.py](file:///d:/CODER_BODER/O%28Py%29-%20DSA%20Examiner%20Project/examiner/views.py)).
* **Dual Frontend Interface Options**:
  * **React 19 + Vite**: High-performance single-page web app with Monaco code editor, dynamic UI animations, and glassmorphism design (see [package.json](file:///d:/CODER_BODER/O%28Py%29-%20DSA%20Examiner%20Project/frontend/package.json)).
  * **Streamlit GUI**: Alternative Python web UI (`ui_2.py`) for rapid interactive testing and visualization (see [ui_2.py](file:///d:/CODER_BODER/O%28Py%29-%20DSA%20Examiner%20Project/ui_2.py)).

---

### 🛠️ **Key Tools & Technologies Used**

#### 1. **Backend & API Architecture**
* **Python 3.13**: Primary runtime environment.
* **Django 6.0**: Core web framework managing routing, ORM models ([models.py](file:///d:/CODER_BODER/O%28Py%29-%20DSA%20Examiner%20Project/examiner/models.py)), and user authentication.
* **Django REST Framework (DRF)**: RESTful API for client-server communication (registration, login, question retrieval, assessment management, and code submission).
* **Django CORS Headers**: Enables secure cross-origin requests between the backend API and frontend apps.

#### 2. **AI & Machine Learning**
* **Hugging Face Transformers**: Neural network pipeline interface for text generation and code evaluation.
* **PyTorch (`torch` & `accelerate`)**: Deep learning tensor library supporting local transformer inference (`Qwen/Qwen2.5-0.5B-Instruct`).

#### 3. **Frontend Applications**
* **React 19 & Vite 8**: Modern UI library and fast bundler for the React frontend application.
* **Monaco Editor (`@monaco-editor/react` / `streamlit-monaco`)**: Browser-based VS Code code editor component supporting Python syntax highlighting.
* **Bootstrap 5 & React-Bootstrap**: Responsive design system and components.
* **Anime.js**: UI animation library for interactive transitions and visual effects.
* **Axios**: HTTP client for seamless API requests.
* **Streamlit**: Python web application framework used for alternative dashboard UI (`ui_2.py`).

#### 4. **Database & Persistence Layer**
* **SQLite (`db.sqlite3`)**: Lightweight relational database used in local development.
* **PostgreSQL (`psycopg3` & `dj-database-url`)**: Enterprise production database configuration.
* **SQL Server Support (`mssql-django` & `pyodbc`)**: Optional database driver for Microsoft SQL Server integration.

#### 5. **Deployment & DevOps**
* **Gunicorn**: Production WSGI HTTP server for Python applications.
* **WhiteNoise**: Static file serving for Django web applications.
* **Render (`render.yaml`)**: Cloud deployment configuration linking PostgreSQL databases, Django backend API services, and Streamlit frontend instances (see [render.yaml](file:///d:/CODER_BODER/O%28Py%29-%20DSA%20Examiner%20Project/render.yaml)).
