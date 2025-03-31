# 🌳 Streets of Trees - Tree Cutting Permit System

## Overview

**Streets of Trees** is a **centralized platform** that allows citizens to **easily view tree cutting permits published across Israel**, all in one place.  
Instead of visiting multiple municipality websites, users can now **search, filter, and review** all permits conveniently.  

In addition, users can **sign up for email notifications** to be alerted when a new permit is published in cities they care about.  

This system was developed by students as a contribution to **"Rehovot Shel Etzim" Association**, an organization dedicated to protecting urban trees.

---

## ✳️ Main Features

- ✅ **View Tree Cutting Permits** from across the country, in one convenient dashboard.
- ✅ **Filter permits** by city, reason, and license type.
- ✅ **Search** for specific licenses or locations.
- ✅ **Automatic calculation** of deadlines for objections.
- ✅ **Email notifications** when new permits are published in your chosen cities.
- ✅ User registration and authentication via Firebase.

---
## 📡 Collaborations & Data Source

This project uses a dedicated API endpoint to fetch up-to-date tree cutting permits from across Israel.
The API was developed and maintained by another team of students as part of a collaborative effort to centralize and simplify access to tree cutting licenses, which were previously scattered across multiple municipal websites.

We thank them for their contribution, which allows our system to present and notify users about relevant permits in a unified and accessible way.

---

## 🔑 Setup & Configuration

### 1. **Clone the Repository**

```bash
git clone https://github.com/your-username/tree-cutting-permits.git
cd tree-cutting-permits
```

---

### 2. **Frontend Setup (React)**

#### Install Dependencies

```bash
cd streets-of-trees
npm install
```

#### Create `.env` File for Frontend

In the `streets-of-trees` folder, create a `.env` file:

```
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
REACT_APP_FIREBASE_MEASUREMENT_ID=your_measurement_id

REACT_APP_SMOOVE_API_KEY=your_smoove_api_key
REACT_APP_SMOOVE_API_URL=https://rest.smoove.io/v1/Campaigns?sendnow=true
```

> **Note**: Replace all values with your actual Firebase / Smoove project's configuration. 

#### Run Frontend

```bash
npm start
```

---

### 3. **Backend Setup (Node.js)**

#### Install Dependencies

```bash
cd backend
npm install
```

#### Create `.env` File for Backend

In the `backend` folder, create a `.env` file:

```
FIREBASE_SERVICE_ACCOUNT='{
  "type": "service_account",
  "project_id": "your_project_id",
  "private_key_id": "your_private_key_id",
  "private_key": "-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY\\n-----END PRIVATE KEY-----\\n",
  "client_email": "firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com",
  "client_id": "your_client_id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40your_project_id.iam.gserviceaccount.com"
}'
SMOOVE_API_KEY=your_smoove_api_key
SMOOVE_API_URL=https://rest.smoove.io/v1/Campaigns?sendnow=true
```

> **Important**: Escape line breaks and quotes properly!

#### Run Backend (for development or testing)

```bash
node tree-permit-checker.js --single-run
```

Or **Run and keep checking on a schedule (runs automatically twice a day):**

```bash
node tree-permit-checker.js
```

> ⚙️ The backend also runs on a **cron job**, set to automatically check for new permits twice daily (configurable).

Scheduled times (using cron):

09:00 AM every day
17:00 PM every day

---

> **Note**: **This system is intended to run on a cloud server as a public web application.
At this stage, it runs locally for development and testing.**

## 🔒 Security Notes
> All sensitive information (Firebase keys, Smoove keys, private keys) are stored securely in .env files and should never be committed to source control.

---
## ✅ Usage

- **Browse** and **filter** all available permits via the web interface.
- **Sign up for email notifications** about new permits in cities you care about.
- **Track deadlines** for submitting objections to permits.

---

## ⚙️ Technologies Used

- **React.js** for the frontend.
- **Firebase Firestore & Authentication** for user management and real-time database.
- **Node.js** for backend processing and scheduled tasks.
- **Smoove** for email notifications.

---

## 🤝 Contribution & Credits

> **© 2025 All rights reserved.** Developed by students for "Rehovot Shel Etzim" Association.  
> Developers: [Shaked Yaeil, Sahar Mizrahi]  

