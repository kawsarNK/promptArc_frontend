# PromptArc — AI Prompt Sharing & Marketplace Platform

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)
![Status](https://img.shields.io/badge/Status-Live-success)

PromptArc is a modern, community-driven **AI Prompt Sharing & Marketplace Platform** where users can discover, create, bookmark, review, manage, and share high-quality AI prompts for tools such as ChatGPT, Gemini, Claude, Midjourney, and more.

The platform includes authentication, role-based dashboards, Premium prompt access, prompt moderation, analytics, search/filter/sorting, bookmarking, reviews, reporting, notifications, and responsive user interfaces.

---

## 🔗 Live Links

### Frontend

https://prompt-arc-frontend.vercel.app

### Backend API

https://prompt-arc-backend.vercel.app

### Backend Health Check

https://prompt-arc-backend.vercel.app/api/health

### Client Repository

https://github.com/kawsarNK/promptArc_frontend

### Server Repository

https://github.com/kawsarNK/promptArc_backend

---

## 🎯 Project Purpose

PromptArc was created to provide a centralized platform where AI users and prompt creators can exchange useful prompts efficiently.

Users can:

- Discover prompts for different AI platforms
- Publish their own prompts
- Bookmark useful prompts
- Copy prompt content
- Review and rate prompts
- Report inappropriate prompts
- Access Premium/private prompts
- Track their prompt activity
- Manage their account
- Explore top creators
- View trending prompts

Creators receive additional analytics for their published prompts, while administrators can manage users, prompts, reports, payments, and platform moderation.

<img width="907" height="437" alt="image" src="https://github.com/user-attachments/assets/ffa41014-9afe-4f2c-881d-248cbb555b8f" />
<img width="909" height="435" alt="image" src="https://github.com/user-attachments/assets/e7cbe66e-646a-4a00-9ac5-7deafe4c9e3d" />
<img width="959" height="436" alt="image" src="https://github.com/user-attachments/assets/9206d77c-eeb5-4c63-bcd9-3d6a0ec6e792" />

---

# ✨ Key Features

## 🔐 Authentication

- Email and password registration
- Email and password login
- Google OAuth login
- JWT-based authentication
- Persistent authentication after page reload
- Protected private routes
- Automatic redirect to login for unauthorized users
- Logout functionality
- Suspended-account protection

---

## 👥 Role-Based Access Control

PromptArc contains three different user roles:

### User

A regular marketplace member can:

- Browse prompts
- View prompt details
- Add prompts
- Manage own prompts
- Bookmark prompts
- Remove bookmarks
- Copy prompts
- Review prompts
- Rate prompts
- Report prompts
- View saved prompts
- View submitted reviews
- Manage profile
- Upgrade to Premium

Free users can publish up to **3 prompts**.

### Creator

Creators receive a dedicated publishing-focused dashboard with:

- Creator Dashboard
- Add Prompt
- My Prompts
- Prompt analytics
- Total prompts
- Total copies
- Total bookmarks
- Prompt growth analytics
- Recharts visualization

### Admin

Administrators receive a separate administrative dashboard with:

- All Users
- All Prompts
- All Payments
- Reported Prompts
- Platform Analytics
- Add Admin Prompt
- User role management
- User deletion
- User status management
- Prompt approval
- Prompt rejection
- Rejection feedback
- Prompt deletion
- Feature/unfeature prompt
- Report moderation

---

# 🏠 Home Page

The homepage contains:

- Responsive Navbar
- Animated Hero/Banner
- AI prompt search
- Trending prompt tags
- CTA buttons
- Featured prompts
- Prompt thumbnails
- AI tool marquee animation
- Dynamic marketplace statistics
- Dynamic categories
- Top creators
- Customer/community reviews
- Why Choose PromptArc section
- Additional promotional sections
- Responsive footer

Framer Motion is used throughout the landing page for modern animations and transitions.

---

# 🔍 All Prompts Marketplace

Users can browse approved public prompts from the marketplace.

Each prompt card displays:

- Thumbnail
- Prompt title
- Category
- AI tool
- Difficulty level
- Creator
- Rating
- Copy count
- Bookmark count
- Tags
- Premium indicator
- Details button

### Search

Users can search prompts by:

- Prompt title
- Tags
- AI tool

### Filters

Users can filter prompts by:

- Category
- AI tool
- Difficulty level

### Sorting

Prompts can be sorted by:

- Most Popular
- Most Copied
- Latest

Search, filtering, sorting, and pagination are handled by the backend API.

---

# 📄 Prompt Details

The protected Prompt Details page displays:

- Prompt title
- Full description
- Prompt content
- Prompt thumbnail
- Category
- Tags
- AI tool
- Difficulty level
- Usage instructions
- Creator information
- Copy count
- Bookmark count
- Reviews
- Ratings

---

# 🔖 Bookmark System

Authenticated users can:

- Bookmark prompts
- Remove bookmarks
- See current bookmark state
- View saved prompts in Dashboard
- Remove bookmarks from Saved Prompts

Duplicate bookmarks are prevented by the backend.

---

# 📋 Copy Prompt

Users who have access to a prompt can:

- Copy the prompt content to clipboard
- Automatically increase the prompt copy count
- Receive a success toast notification

Premium prompt content cannot be copied by free users.

---

# ⭐ Review & Rating System

Eligible authenticated users can:

- Give ratings
- Write reviews
- Update their review

Reviews display:

- User name
- Email
- Rating
- Date
- Comment

Average ratings are calculated dynamically.

---

# 🚩 Prompt Reporting

Users can report prompts by selecting a reason such as:

- Inappropriate Content
- Spam
- Copyright Violation

Users can also provide an optional description.

Reports are sent to the Admin Dashboard for moderation.

---

# 💎 Premium Prompt System

PromptArc supports public and Premium/private prompts.

### Public Prompt

Accessible to authenticated users.

### Premium Prompt

For free users:

- Prompt content is locked
- Copy is disabled
- Review/rating is restricted
- Upgrade to Premium CTA is displayed

Premium users can access all private/Premium prompt content.

---

# 💳 Stripe Premium Payment

PromptArc uses Stripe Checkout for a **one-time USD $5 Premium payment**.

After successful payment:

- Payment is verified
- User subscription becomes Premium
- Transaction information is stored
- Private prompts become accessible
- User receives confirmation
- User is redirected back to the application

---

# 📊 User Dashboard

The User Dashboard contains:

- Overview
- Add Prompt
- My Prompts
- Saved Prompts
- My Reviews
- Profile

Dashboard information comes from real backend/database records.

---

# ➕ Add Prompt

Users and creators can submit prompts using:

- Prompt Title
- Prompt Description
- Prompt Content
- Category
- AI Tool
- Tags
- Difficulty Level
- Thumbnail Image
- Visibility
- Usage Instructions

Newly submitted prompts are created with:

```text
copyCount = 0
status = pending
```

Prompts remain hidden from the public marketplace until approved by an administrator.

---

# 🖼️ Thumbnail Upload

PromptArc supports prompt thumbnail uploads.

Images are uploaded through the backend using Cloudinary.

Uploaded images are displayed on prompt cards and prompt-related views.

Supported image types include standard web image formats such as:

- JPEG
- PNG
- WebP

---

# 📝 My Prompts

The My Prompts page displays prompts created by the current user.

Available actions include:

- View
- Edit
- Delete
- View Analytics

The page includes backend-powered search, filtering, and pagination.

---

# 🔖 Saved Prompts

Saved Prompts displays the authenticated user's actual bookmarked prompts.

Available actions:

- View Details
- Remove Bookmark

No static/demo saved-prompt data is used.

---

# ⭐ My Reviews

Users can view the reviews they have submitted from the Dashboard.

The data is loaded from the backend/database.

---

# 👤 Profile

Profile displays:

- Name
- Email
- Profile image
- Account role
- Prompt statistics
- Subscription status
- Free/Premium account state

Users can update supported profile information.

Free users receive an **Upgrade to Premium** option.

---

# 🎨 Creator Dashboard

Creator accounts have a dedicated analytics-focused dashboard.

Creator analytics include:

- Total Prompts
- Total Copies
- Total Bookmarks
- Prompt Growth
- Copy performance

Charts are rendered with **Recharts**.

---

# 🛡️ Admin Dashboard

The Admin Dashboard is separated from User and Creator dashboards.

Admin sections include:

### All Users

Administrators can:

- Search users
- Filter users
- Change user role
- Manage account status
- Delete users
- View real database accounts

### All Prompts

Administrators can:

- Search prompts
- Filter prompts
- Approve prompts
- Reject prompts
- Provide rejection feedback
- Delete prompts
- Feature prompts
- Unfeature prompts
- Edit/view prompt data

### All Payments

Displays Stripe payment records stored in the database.

### Reported Prompts

Administrators can:

- View reports
- Remove reported prompts
- Warn creators
- Dismiss reports as not harmful

### Analytics

Admin analytics include:

- Total Users
- Total Prompts
- Total Reviews
- Total Copies
- Platform activity

---

# 🔔 Notifications

PromptArc includes a notification system.

Notifications can be generated for events such as:

- Account welcome
- Prompt submission
- Prompt approval/rejection
- Bookmark activity
- Reviews
- Reports
- Role changes
- Account actions
- Premium activation

Users can:

- View unread notifications
- Mark individual notifications as read
- Mark all notifications as read

---

# 🌗 Theme Support

PromptArc includes:

- Light theme
- Dark theme

The interface maintains consistent styling across public pages and dashboards.

---

# 📱 Responsive Design

PromptArc is designed for:

- Desktop
- Laptop
- Tablet
- Mobile

The project includes:

- Responsive grids
- Responsive cards
- Mobile-friendly forms
- Responsive dashboard sidebar
- Responsive tables
- Consistent typography
- Proper spacing
- Modern icons
- Accessible color contrast

---

# ⚡ Loading & Error Handling

The frontend includes:

- Loading states
- Loading spinner/skeleton behavior
- API error handling
- Toast notifications
- Error boundary
- Custom 404 page
- Authentication loading state

---

# 🧰 Technology Stack

## Frontend

- Next.js 16
- React 19
- React DOM 19
- JavaScript
- CSS
- Vercel

## Authentication

- JWT authentication through backend
- Google OAuth / Google Identity Services

## Animation

- Framer Motion

## Charts

- Recharts

## Notifications

- React Toastify

## Icons

- Lucide React

---

# 📦 NPM Packages

Main frontend packages:

```text
@react-oauth/google
framer-motion
lucide-react
next
react
react-dom
react-toastify
recharts
```

Development packages:

```text
eslint
eslint-config-next
```

---

# 📦 Package Versions

```json
{
  "@react-oauth/google": "^0.12.2",
  "framer-motion": "^12.23.12",
  "lucide-react": "^0.468.0",
  "next": "16.2.6",
  "react": "19.2.6",
  "react-dom": "19.2.6",
  "react-toastify": "^11.0.5",
  "recharts": "^3.1.2"
}
```

---

# ⚙️ Environment Variables

Create:

```text
.env.local
```

in the frontend project root.

Example:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

For production:

```env
NEXT_PUBLIC_API_URL=https://prompt-arc-backend.vercel.app/api
NEXT_PUBLIC_SITE_URL=https://prompt-arc-frontend.vercel.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID=543243419511-i30qr6bec2og6u1rptrv3bo5ccsj9732.apps.googleusercontent.com
```

> `NEXT_PUBLIC_*` variables are visible to the browser. Never place MongoDB credentials, JWT secrets, Stripe secret keys, or Cloudinary API secrets in frontend environment variables.

---

# 💻 Run Locally

## 1. Clone the frontend repository

```bash
git clone https://github.com/kawsarNK/promptArc_frontend
```

## 2. Enter the project

```bash
cd YOUR_FRONTEND_REPOSITORY_FOLDER
```

## 3. Install dependencies

```bash
npm install
```

or:

```bash
npm ci
```

## 4. Create `.env.local`

Add:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=543243419511-i30qr6bec2og6u1rptrv3bo5ccsj9732.apps.googleusercontent.com
```

## 5. Start development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🏗️ Production Build

```bash
npm run build
```

Then:

```bash
npm start
```

---

# 🧹 Lint

```bash
npm run lint
```

---

# ☁️ Deployment

The frontend is deployed using **Vercel**.

Production URL:

https://prompt-arc-frontend.vercel.app

Required Vercel environment variables:

```env
NEXT_PUBLIC_API_URL=https://prompt-arc-backend.vercel.app/api
NEXT_PUBLIC_SITE_URL=https://prompt-arc-frontend.vercel.app
NEXT_PUBLIC_GOOGLE_CLIENT_ID=543243419511-i30qr6bec2og6u1rptrv3bo5ccsj9732.apps.googleusercontent.com
```

Deploy with Vercel CLI:

```bash
vercel --prod
```

---

# 🔄 Frontend–Backend Architecture

```text
User Browser
     │
     ▼
PromptArc Frontend
Next.js + React
     │
     │ HTTPS / REST API
     ▼
PromptArc Backend
Express + Node.js
     │
     ├── MongoDB Atlas
     ├── Stripe
     ├── Cloudinary
     └── Google Authentication
```

---

# 🔐 Security Notes

- Secret credentials are not stored in frontend source code.
- Sensitive backend credentials are stored in backend environment variables.
- Authentication is validated by the backend.
- Role permissions are also enforced by backend middleware.
- Protected frontend routes cannot replace server-side authorization.

---

# 👨‍💼 Demo Admin Account

> Use a dedicated demo account only. Do not publish a sensitive personal or production password.

```text
Email: admin@promptarc.dev
Password: admin@promptarc.dev
```

---

# ✅ Major Requirement Coverage

- JWT Authentication ✅
- Google Login ✅
- Role-Based Access Control ✅
- User Dashboard ✅
- Creator Dashboard ✅
- Admin Dashboard ✅
- Prompt CRUD ✅
- Prompt Moderation ✅
- Bookmark System ✅
- Copy Count ✅
- Review & Rating ✅
- Report System ✅
- Premium Prompts ✅
- Stripe Payment ✅
- Cloudinary Image Upload ✅
- Backend Search ✅
- Backend Filtering ✅
- Backend Sorting ✅
- Pagination ✅
- Analytics ✅
- MongoDB Aggregation ✅
- Notifications ✅
- Responsive Design ✅
- Loading States ✅
- Error Page ✅
- 404 Page ✅
- Framer Motion ✅
- Dark/Light Theme ✅
- Vercel Deployment ✅

---

# 👨‍💻 Author

**Md Kawsar Hamid**

Full-Stack Web Developer

---

# 📌 Project Status

**Production / Live**

Frontend:

https://prompt-arc-frontend.vercel.app

Backend:

https://prompt-arc-backend.vercel.app

---

## ⭐ Thank You

Thank you for exploring **PromptArc**.

PromptArc aims to make discovering, sharing, managing, and improving AI prompts simple, secure, and community-driven.
