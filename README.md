# 🏥 Afyaconnect (My Afya Link)

🌐 **Live Application:** https://my-afya-link.vercel.app/

Afyaconnect (My Afya Link) is a digital health platform developed to improve healthcare accessibility in Kenya by connecting patients with nearby clinics through a mobile-first web application.

---

## 📌 Project Overview

Access to reliable healthcare services remains a challenge in many regions. Patients often struggle to:

- Locate nearby clinics
- Verify clinic services
- Access contact information


**Afyaconnect provides a technological solution by offering:**

- 📍 Location-based clinic discovery
- 🏥 Verified clinic listings
- 🗺 Interactive map integration
- 📱 Mobile-first responsive design

---

## 🎯 Project Objectives

1. Improve healthcare accessibility through digital clinic discovery.
2. Provide structured and verified clinic information.
3. Create a scalable health-tech solution for Kenya.


---

## 🛠 Tech Stack

- **Frontend:** Lovable (Mobile-first web app)
- **Backend:** Supabase
- **Database:** PostgreSQL (via Supabase)
- **Maps:** OpenStreetMap
- **Payments:** Safaricom Daraja API (M-Pesa)
- **Hosting:** Vercel

---

## 🔥 Core Features

### 📍 Clinic Discovery
- Search for nearby clinics
- View clinic details
- Access contact information

### 🗺 Map Integration
- OpenStreetMap integration
- Location-based clinic display
- Navigation support

### 💳 Digital Payments
- M-Pesa STK Push integration (Daraja API)
- Secure transaction logging
- Payment verification system

### 🔐 Authentication & Data Management
- Secure user authentication
- Role-based access control
- Cloud-based database storage

### 📱 Mobile-First Design
- Optimized for smartphones
- Fully responsive on tablets and desktops
- Lightweight and fast-loading interface

---

## 🏗 System Architecture

User (Browser)  
→ Frontend (Lovable)  
→ Supabase (Authentication & Database)  
→ External APIs  
&nbsp;&nbsp;&nbsp;&nbsp;• OpenStreetMap  
&nbsp;&nbsp;&nbsp;&nbsp;• Safaricom Daraja API  

---

## ⚙️ Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/afyaconnect.git
cd afyaconnect
2. Install Dependencies
npm install
3. Configure Environment Variables
Create a .env file:

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
DARJA_CONSUMER_KEY=your_daraja_key
DARJA_CONSUMER_SECRET=your_daraja_secret
4. Run Development Server
npm run dev
🚀 Future Enhancements
Real-time clinic availability

Appointment booking system

Telemedicine integration

Digital medical records

Admin analytics dashboard

AI-powered clinic recommendations

👨‍💻 Contributors
Robert Weda – System Design & Development

IT Group Members – Research, Testing & Documentation

📖 Academic Context
This system was developed as an Information Technology group project aimed at solving healthcare accessibility challenges in Kenya using scalable digital technologies.

📜 License
This project is developed for academic purposes.
For commercial use, please contact the project team.

🌍 Vision
To become Kenya’s leading digital health connection platform by making healthcare access simple, secure, and location-aware.


