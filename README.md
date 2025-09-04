# Marrero Stern - Property Management Application

A comprehensive property management platform built with React, Firebase, and Tailwind CSS, offering role-based features for administrators, property owners, service providers, and travelers.

## 🚀 Features

### 🏠 **Owner Features**
- **Budget Dashboard**: Track monthly revenue, expenses, and profit margins with interactive charts
- **Booking Calendar**: Manage reservations with visual calendar interface
- **Property Management**: Add, edit, and manage owned properties
- **Real-time Communication**: Message administrators and service providers
- **Incident Reporting**: Report property-related incidents

### 👷 **Service Provider Features**
- **Task Management**: View and complete assigned tasks with interactive checklists
- **Task Checklists**: Step-by-step completion tracking with photo uploads
- **Check-in/Check-out**: Update reservation statuses in real-time
- **Incident Reporting**: Report issues during service visits
- **Internal Messaging**: Communicate with administrators and owners
- **Invoice Access**: View and download payment documents

### ✈️ **Traveler Features**
- **Digital Welcome Booklet**: Interactive property guide with local information
- **Check-in Form**: Secure KYC and contact information submission
- **Review System**: Rate and review accommodations and service providers
- **Account Access**: Automatic account creation upon booking

### 👩‍💼 **Administrator Features**
- **Global Dashboard**: Comprehensive overview of all operations
- **User Management**: Full CRUD operations for user accounts with role management
- **Stock Management**: Inventory tracking with low-stock alerts
- **Task Assignment**: Manual and automated task distribution
- **Reservation Management**: Full booking lifecycle management
- **Incident Monitoring**: Centralized incident triage and resolution
- **Enhanced Messaging**: Real-time communication platform
- **Document Validation**: Service provider document verification workflow

## 🛠 Technology Stack

- **Frontend**: React 19+ with Vite
- **Styling**: Tailwind CSS + Bootstrap components
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Charts**: Chart.js with React-ChartJS-2
- **Calendar**: React-Calendar
- **Icons**: React Icons
- **Routing**: React Router DOM

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project with configured services

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd marrerostern-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Firebase Setup**
   - Enable Authentication (Email/Password)
   - Create Firestore database with appropriate security rules
   - Configure Firebase Storage
   - Set up the following Firestore collections:
     - `users` (user profiles and roles)
     - `properties` (property information)
     - `reservations` (booking data)
     - `tasks` (assigned tasks)
     - `incidents` (reported issues)
     - `inventory` (stock management)
     - `messages` (real-time messaging)
     - `conversations` (message threads)

5. **Start Development Server**
   ```bash
   npm run dev
   ```

6. **Build for Production**
   ```bash
   npm run build
   ```

## 🎯 User Roles & Permissions

### Administrator (`admin`/`administrator`)
- Full system access
- User management
- Global dashboard
- Stock management
- Task assignment
- Incident monitoring

### Property Owner (`owner`/`proprietaire`) 
- Budget tracking
- Booking calendar
- Property management
- Messaging with staff
- Incident reporting

### Service Provider (`provider`/`prestataire`)
- Task management with checklists
- Check-in/check-out functionality
- Incident reporting
- Internal messaging
- Invoice access

### Traveler (`traveler`/`voyageur`)
- Digital welcome booklet
- Check-in form submission
- Review and rating system
- Account access after booking

## 📊 Key Components

### Dashboard Components
- `AdminDashboard.jsx` - Administrative overview
- `OwnerDashboard.jsx` - Property owner interface
- `ProviderDashboard.jsx` - Service provider workspace
- `TravelerDashboard.jsx` - Guest interface

### Feature Components
- `StockManagement.jsx` - Inventory tracking system
- `BudgetDashboard.jsx` - Financial overview with charts
- `BookingCalendar.jsx` - Reservation management calendar
- `EnhancedMessaging.jsx` - Real-time communication platform
- `TaskChecklist.jsx` - Interactive task completion
- `WelcomeBooklet.jsx` - Digital guest guide

## 🔐 Authentication & Security

- Firebase Authentication with email/password
- Role-based access control (RBAC)
- Route protection based on authentication status
- User role validation on protected routes
- Firebase security rules for data access control

## 🌐 Deployment

The application is configured for deployment on various platforms:

1. **Firebase Hosting**
   ```bash
   npm run build
   firebase deploy
   ```

2. **Netlify/Vercel**
   - Connect repository
   - Set build command: `npm run build`
   - Set publish directory: `dist`
   - Configure environment variables

## 📱 Mobile Responsiveness

The application is fully responsive with:
- Mobile-first design approach
- Bootstrap responsive utilities
- Tailwind CSS responsive classes
- Touch-friendly interface elements

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the documentation for common solutions

## 🚀 Future Enhancements

- [ ] Advanced reporting and analytics
- [ ] Mobile application
- [ ] Integration with external booking platforms
- [ ] Automated task scheduling
- [ ] Multi-language support
- [ ] Advanced notification system
- [ ] API documentation
- [ ] Automated testing suite
