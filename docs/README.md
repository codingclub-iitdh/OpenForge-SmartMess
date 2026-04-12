# SmartMess - Comprehensive Platform Documentation

**Team**: Mahesh Waghmode | **Members**: 1

---

## Platform Overview

SmartMess is an **integrated institute mess management system** for IIT Dharwad that streamlines meal planning, feedback collection, complaint management, and analytics.

---

## 🎯 Complete Features Implemented

### 1️⃣ Authentication & Authorization System

#### Multi-Role Login (3 distinct roles)
- **Student Role**: Regular student access to mess services
- **Manager/Secretary Role**: Manages mess operations and menu planning
- **SW Office Role** : Administrative oversight and approvals

#### Login Features
- Google OAuth 2.0 authentication
- JWT token-based session management
- Role-based access control (RBAC)
- Persistent login sessions
- Automatic role assignment based on email whitelist

---

### 2️⃣ Menu Management System

#### Features
- **Monthly Menu Planning**: Upload official menus as PDF
- **Weekly Meal Schedule**: Structured breakfast, lunch, snacks, dinner
- **Food Item Database**: Comprehensive food item catalog with categories
- **Menu Calendar View**: Visual weekly meal display with meal types
- **Meal Timing**: Different meal times for weekdays vs weekends
- **Kitchen TimeTable**: Ingredient-based meal scheduling

#### For Managers
- Create/Update/Delete food items
- Upload monthly menu PDFs
- Set meal schedules and timings
- Manage ingredient inventory

---

### 3️⃣ Advanced Complaint & Suggestion System

#### Multi-Channel Submission
- **Anonymous Complaints**: Submit without identification
- **Attributed Suggestions**: Sign suggestions with identity
- **Targeted Audience**: Route to Management, Dean, or Students
- **Status Tracking**: Submitted → Under Review → Resolved

#### For Students
- Submit complaints about food quality, timing, hygiene
- Make suggestions for improvement
- Track complaint resolution status
- Upvote/downvote suggestions
- View official responses from management

#### For Management
- View all complaints with filtering
- Categorize by type and urgency
- Add official responses
- Track resolution timeline
- Generate complaint statistics

#### For SW Office
- Approve/reject complaints
- Escalate critical issues
- View dashboard with all complaints
- Generate reports for analysis

---

### 4️⃣ Comprehensive Feedback & Rating System

#### Multi-Dimensional Rating
- **Food Quality**: Rate taste, freshness, presentation
- **Portion Size**: Evaluate quantity
- **Hygiene Standards**: Rate cleanliness
- **Overall Experience**: General satisfaction

#### Daily Feedback
- Rate meals on specific dates
- Time-series tracking of satisfaction trends
- Per-meal-type feedback (breakfast, lunch, etc.)

#### Analytics
- **Trend Analysis**: Food items trending up/down
- **Top-Rated Items**: Best performing meals
- **Problem Areas**: Low-rated items needing attention
- **Time-Series Data**: Historical rating patterns

#### Guest Meal Feedback
- Separate feedback system for guest meals
- Track guest satisfaction separately
- Quality metrics for special meals

---

### 5️⃣ Student Dashboard & Analytics

#### Features
- **Meal Menu Viewing**: See current and upcoming meals
- **Rating History**: View previous ratings given
- **Analytics Dashboard**: 
  - Average ratings by meal type
  - Trending food items
  - Personal contribution statistics
- **Complaint Status**: Track submitted complaints
- **Notifications**: Real-time alerts for important announcements

#### Personal Analytics
- Contribution count (ratings, suggestions)
- Participation metrics
- Comparison with other students

---

### 6️⃣ Manager/Secretary Dashboard

#### Real-Time Metrics
- **Current Item Rating**: Average rating of today's meal
- **Active Complaints**: Number of pending issues
- **Guest Bookings**: Count of special meal requests
- **Analytics Overview**: KPI dashboard

#### Menu Management
- View/edit current and future menus
- Upload monthly menu PDFs
- Add/update food items
- Manage meal timings
- View ingredient inventory

#### Operations
- **Announcements**: Broadcast to all students
- **Guest Bookings Management**: Track special meal requests
- **Complaint Monitoring**: View and respond to complaints
- **Feedback Analysis**: Monitor food ratings

---

### 7️⃣ SW Office (Dean) Administrative Panel

#### Overview Capabilities
- Complete system analytics
- All complaints and approvals
- User management insights
- Announcement broadcasting
- Role-based report generation

#### Administrative Functions
- Approve/reject escalated complaints
- View comprehensive analytics
- Access all system reports
- Manage institutional policies
- Monitor system health

---

### 8️⃣ Notification System

#### Real-Time Updates
- Firebase Cloud Messaging (FCM) integration
- Push notifications for:
  - Complaint status changes
  - New announcements
  - System alerts
  - Meal updates

#### Notification Channels
- In-app notifications
- Firebase push notifications
- Notification history tracking
- Subscription management

---

### 9️⃣ Image & File Management

#### Features
- **Profile Pictures**: User avatars
- **Menu PDFs**: Upload official menus
- **Rule Books**: Upload hostel/mess rules
- **Food Images**: Visual meal catalog
- **Attachment Support**: Upload supporting documents for complaints

#### Storage
- Cloudinary integration for cloud storage
- Automatic image optimization
- CDN distribution for fast loading

---

### 🔟 Analytics & Reporting

#### Data Insights
- **Visitor Analytics**: Daily unique users tracking
- **Meal Ratings Timeline**: Trends over time
- **Complaint Statistics**: Categories and resolution rates
- **User Engagement**: Participation metrics

#### Reports Available
- Daily analytics snapshot
- Weekly summary reports
- Monthly performance review
- Food item performance ranking
- Student engagement metrics

---


## 📊 Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB + Mongoose
- **Authentication**: Google OAuth 2.0 + JWT
- **Real-time**: Socket.io
- **File Storage**: Cloudinary
- **Admin**: Firebase Admin SDK

### Frontend
- **Framework**: React.js
- **UI Library**: Material-UI (MUI)
- **State Management**: React Context + Hooks
- **Styling**: Emotion/Styled Components
- **Build**: Create React App
- **HTTP Client**: Axios
- **Notifications**: Firebase Cloud Messaging
- **Charts**: MUI X Charts

### Infrastructure
- **Database**: MongoDB Atlas (Cloud)
- **File Storage**: Cloudinary
- **Authentication**: Google OAuth
- **Notifications**: Firebase
- **Deployment**: Node.js server

---

## 📁 Project Structure

```
├── Smart_Mess_Backend/
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/          # Database schemas
│   │   ├── routes/          # API endpoints
│   │   ├── middlewares/     # Auth & validation
│   │   ├── services/        # Business logic
│   │   └── config/          # Configuration
│   └── dist/                # Compiled JS
│
└── Smart_Mess_Frontend/
    ├── src/
    │   ├── pages/           # Route components
    │   ├── components/      # Reusable components
    │   ├── layouts/         # Layout components
    │   ├── services/        # API calls
    │   ├── Context/         # State management
    │   └── hooks/           # Custom hooks
    └── public/              # Static assets
```

---

## 🔐 Security Features

- Google OAuth 2.0 for secure authentication
- JWT token validation on all protected routes
- Role-based access control (RBAC)
- Password-less authentication
- Secure credential management
- Environment variable isolation
- Input validation and sanitization

---

## 📈 Scalability Features

- Microservices-ready architecture
- Cloud database (MongoDB Atlas)
- CDN for static assets (Cloudinary)
- Horizontal scaling support
- Efficient query indexing
- Rate limiting ready
- Caching strategies

---

## ✅ Testing & Verification

All features tested locally:
- ✓ Multi-role authentication working
- ✓ Menu management functional
- ✓ Complaint system operational
- ✓ Feedback/ratings system active
- ✓ Analytics dashboard populated
- ✓ Notifications triggering
- ✓ File uploads working
- ✓ No breaking changes

---

## 🚀 Deployment Ready

- ✓ Clean build
- ✓ Production environment variables
- ✓ Database migrations documented
- ✓ API endpoints documented
- ✓ Error handling implemented
- ✓ Logging configured

---

## 📝 Documentation

- **README.md**: This comprehensive overview
- **IMPLEMENTATION_GUIDE.md**: Setup, testing, technical details

For detailed setup and testing procedures, see `IMPLEMENTATION_GUIDE.md`


