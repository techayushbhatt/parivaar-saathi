# 🏠 Parivaar Saathi

<p align="center">
  <strong>Intelligent Family Care Coordination Web Application</strong>
</p>

<p align="center">
  <em>Care Together. Stay Connected.</em>
</p>

<p align="center">
  A centralized platform for managing family care, medications, reminders, appointments, tasks, documents, and care-related information.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Project-Parivaar%20Saathi-2563EB?style=for-the-badge" alt="Parivaar Saathi">
  <img src="https://img.shields.io/badge/React.js-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React.js">
  <img src="https://img.shields.io/badge/Tailwind%20CSS-Styling-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/MySQL-Database-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL">
</p>

---

## 📖 About The Project

**Parivaar Saathi** is a family-care coordination web application designed to bring important care-related information and responsibilities into one shared digital workspace.

The system is intended to help families coordinate the care of an elderly or dependent family member by organizing medications, appointments, reminders, care tasks, documents, and family participation in one place.

> **Important:** Parivaar Saathi focuses on care coordination, organization, and record management. It is **not** a medical diagnosis, treatment recommendation, or medical advice system.

---

## 🎯 Problem Statement

Family caregiving can involve several people managing medication schedules, appointments, documents, daily responsibilities, and important care information.

Without a centralized system, families may experience:

- ❌ Missed medication schedules
- ❌ Forgotten appointments
- ❌ Unclear care responsibilities
- ❌ Difficulty finding important documents
- ❌ Scattered communication and records
- ❌ Poor visibility into ongoing care activities

### 💡 Proposed Solution

Parivaar Saathi provides a centralized family-care workspace where authorized family members can organize and coordinate care activities, maintain shared records, and quickly see important upcoming and pending actions.

---

## ✨ Key Features

### 🔐 Authentication & Access Control

- User registration
- User login
- Logout
- Secure session/token architecture
- Role-Based Access Control (RBAC)
- Authorized access to family-care information

### 👨‍👩‍👧‍👦 Family Health Circle

- Create and manage a family circle
- Add authorized participants
- Assign roles
- Manage access permissions
- Coordinate care responsibilities

### 👤 Patient / Care Receiver Profile

- Maintain care-receiver information
- Medical information
- Health history
- Emergency contacts
- Care-related notes
- Associated medications, appointments, tasks, and documents

### 💊 Medication Management

- Store medication details
- Dosage
- Frequency
- Schedule/timing
- Medication status
- Medication tracking
- Medication-related reminders

### 🔔 Reminder System

- Create reminders
- Medication reminders
- Appointment reminders
- Care-task reminders
- Confirm reminders
- Skip reminders
- Track pending/completed outcomes

### 📝 Caregiver Coordination

- Create care tasks
- Assign tasks to family members
- Track task status
- Monitor responsibilities
- Track task completion

### 📅 Doctor Visit Management

- Record appointments
- Doctor/contact details
- Appointment dates
- Notes
- Follow-up information
- Track appointment status

### 📁 Health Document Vault

- Organize health documents
- Reports
- Prescriptions
- Document categories
- Authorized document access
- Secure file-storage architecture

### 📊 Family Care Dashboard

A central dashboard for:

- Today's important actions
- Pending tasks
- Medication schedules
- Upcoming appointments
- Recent reminders
- Relevant care information

### 📈 Adherence Analytics

Basic analytics based on recorded reminder outcomes, including:

- Medication adherence trends
- Reminder outcomes
- Care activity
- Caregiver/task workload trends

---

# 👥 User Roles

| Role | Responsibility |
|---|---|
| 👑 **Admin** | Manages family, users, permissions, and care activities |
| 🧑‍⚕️ **Caregiver** | Manages medications, reminders, tasks, and appointments |
| 🧓 **Care Receiver** | Views relevant care information |
| 👨‍⚕️ **Doctor** | Accesses relevant patient and appointment information |
| 👀 **Observer** | Provides authorized view-only access |

---

# 🛠️ Technology Stack

## Frontend

- ⚛️ React.js
- 🟨 JavaScript
- 🌐 HTML5
- 🎨 CSS3
- 💨 Tailwind CSS

## Backend

- 🟢 Node.js
- 🚂 Express.js
- 🔗 REST APIs

## Database

- 🐬 MySQL

## Authentication & Security

- 🔑 JWT Authentication
- 🛡️ Role-Based Access Control
- 🔐 Password Hashing
- 📁 Controlled Document Access
- 📝 Audit Logging
- 🔒 Protected API Responses

## Development Tools

- Visual Studio Code
- Git
- GitHub
- Postman
- Figma

---

# 🏗️ System Architecture

```text
                         PARIVAAR SAATHI
                                │
                                ▼
                ┌──────────────────────────┐
                │      React Frontend      │
                │     User Interface       │
                └────────────┬─────────────┘
                             │
                             │ REST API
                             ▼
                ┌──────────────────────────┐
                │      Node.js + Express   │
                │        API Layer         │
                └────────────┬─────────────┘
                             │
                             ▼
                ┌──────────────────────────┐
                │    Business Logic Layer  │
                │       Services / RBAC    │
                └────────────┬─────────────┘
                             │
                             ▼
                ┌──────────────────────────┐
                │       MySQL Database     │
                └──────────────────────────┘
```

---

# 🗄️ Core Data Entities

The planned system contains the following major entities:

```text
USERS
  │
  ├── FAMILIES
  │      │
  │      └── PATIENTS
  │              │
  │              ├── MEDICATIONS
  │              ├── APPOINTMENTS
  │              ├── DOCUMENTS
  │              ├── REMINDERS
  │              └── CARE_TASKS
  │
  └── ADHERENCE_LOGS
```

- `USERS`
- `FAMILIES`
- `PATIENTS`
- `MEDICATIONS`
- `APPOINTMENTS`
- `DOCUMENTS`
- `REMINDERS`
- `CARE_TASKS`
- `ADHERENCE_LOGS`

---

# 📂 Project Structure

```text
parivaar-saathi/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   └── Header.jsx
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Profile.jsx
│   │   └── Settings.jsx
│   │
│   ├── data/
│   │   └── store.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/techayushbhatt/parivaar-saathi.git
```

## 2. Navigate to the Project

```bash
cd parivaar-saathi
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Start Development Server

```bash
npm run dev
```

## 5. Open in Browser

```text
http://localhost:5173
```

---

# 🧪 Production Build

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

---

# 🔒 Security Design

Because the application manages sensitive care-related information, the planned system includes:

- Secure password hashing
- JWT-based authentication
- Role-Based Access Control
- Controlled access to sensitive documents
- Audit logging for important writes
- Protected API responses
- Authorized family-data access

---

# 🧪 Testing Strategy

The project is intended to be tested across:

| Area | Expected Result |
|---|---|
| Authentication / RBAC | Valid login and restricted-role access |
| Medication / Reminder | Correct status and adherence outcome |
| Care Tasks | Correct assignee and completion status |
| Appointments / Documents | Correct timeline and authorized access |
| API Validation | Clear validation errors and consistent data |
| Responsive UI | Core workflows usable on desktop, tablet, and mobile |

---

# 📱 Responsive Design

Parivaar Saathi is designed as a responsive web application.

The interface is intended to remain usable across:

- 💻 Desktop
- 💻 Laptop
- 📱 Tablet
- 📱 Mobile

---

# 🌐 Future Scope

Possible future enhancements include:

- 🤖 AI-assisted conversion of voice/text into organized care tasks
- 🔔 Advanced notification and reminder features
- 🏥 Integration with relevant healthcare or pharmacy services
- 📱 Mobile application support
- ☁️ Cloud-based storage and deployment enhancements
- 📊 More advanced analytics

---

# 🎓 Academic Project

| Information | Details |
|---|---|
| **Project Name** | Parivaar Saathi |
| **Project Title** | Intelligent Family Care Coordination Web Application |
| **Project Type** | Web Application |
| **Domain** | Family Care Coordination |
| **Course** | Front End Web Development |
| **Degree** | Master of Computer Applications (MCA) |
| **Institution** | Krishna Institute of Engineering & Technology (KIET), Ghaziabad |
| **Academic Year** | 2026 |

---

# 👨‍💻 Development Team

### Ayush Bhatt

**MCA Student | Full Stack Developer | Generative AI Enthusiast | Tech Content Creator**

GitHub:  
https://github.com/techayushbhatt

### Project Team

- **Harsh Shukla** - Team Leader
- **Ayush Bhatt**
- **Broja Kishor Mohanta**

---

# ⚠️ Disclaimer

Parivaar Saathi is intended for family-care coordination, organization, reminders, and record management.

It does **not** provide:

- Medical diagnosis
- Treatment recommendations
- Medical advice
- Automated medical decision-making

For medical decisions, users should consult qualified healthcare professionals.

---

# ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.

---

<p align="center">
  <strong>🏠 Parivaar Saathi</strong>
  <br>
  <em>Care Together. Stay Connected.</em>
</p>
