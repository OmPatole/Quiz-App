# Qizzer - Secure Quiz & Coding Assessment Platform

<div align="center">
  <img src="https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge&logo=react" alt="MERN Stack" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</div>

<br />

**Qizzer** is a robust, full-stack assessment platform designed for conducting secure, weekly coding quizzes and technical assessments. It features a distraction-free student interface, real-time code compilation for multiple languages, and a powerful admin panel for managing quizzes.

## 🚀 Features

### 🎓 For Students
* **Secure Environment:** Full-screen enforcement and tab-switch detection to prevent cheating.
* **Multi-Language Compiler:** Support for **Python, JavaScript, C, C++, and Java**.
* **LeetCode-Style Interface:** Clean coding workspace with input/output test cases and "Run Code" functionality.
* **Instant Results:** Real-time scoring and leaderboards.
* **Resume Capability:** "Remember Me" session handling (SessionStorage/LocalStorage).

### 🛡️ For Admins
* **Dashboard:** manage quizzes, view schedules, and monitor status (Live, Upcoming, Ended).
* **Rich Text Editor:** Create questions with Markdown support and image uploads.
* **Test Case Management:** Add multiple hidden test cases for coding problems.
* **Security:** Password-protected admin login with secure session handling.

## 🛠️ Tech Stack

* **Frontend:** React (Vite), Tailwind CSS, Lucide React (Icons), Monaco Editor (Code Editor), React Hot Toast (Notifications).
* **Backend:** Node.js, Express.js.
* **Database (Current):** JSON-based local file storage (can be migrated to MongoDB).
* **Compiler API:** Piston API (External execution engine).

## 📦 Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone [https://github.com/yourusername/qizzer.git](https://github.com/yourusername/qizzer.git)
    cd qizzer
    ```

2.  **Setup Server (Backend)**
    ```bash
    cd server
    npm install
    
    # Create a .env file for admin credentials
    echo "ADMIN_USER=admin" > .env
    echo "ADMIN_PASS=password123" >> .env
    
    # Start the server (Runs on port 3001)
    node index.js
    ```

3.  **Setup Client (Frontend)**
    Open a new terminal window:
    ```bash
    cd client
    npm install
    
    # Start the React app (Runs on port 5173)
    npm run dev
    ```

4.  **Access the App**
    * **Student View:** `http://localhost:5173`
    * **Admin Panel:** `http://localhost:5173/login`

## 🔒 Security Features

* **Fullscreen Lock:** Students must enter fullscreen mode to start. Exiting fullscreen auto-submits the quiz.
* **Tab Switching:** Detects visibility changes (switching tabs) and terminates the session.
* **Admin Auth:** Secure login using environment variables on the backend.

## 🤝 Contributing

Contributions are welcome! Please fork this repository and submit a pull request.

## 📄 License

This project is licensed under the MIT License.

---

<p align="center">
  Built with ❤️ by <b>Om Patole</b> for School of Engineering & Technology, Shivaji University.
</p>
