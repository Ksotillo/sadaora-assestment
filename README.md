# 🌟 Sadaora Starter App - Senior Full-Stack Engineer Assessment

**Assessment Implementation for:** Sadaora Senior Full-Stack Engineer Position  
**Project:** Member Profiles + Feed Application  
**Tech Stack:** Next.js 15, React 19, TypeScript, Supabase (PostgreSQL), AWS S3, Clerk Auth  
**Deployment:** Vercel

## 📋 Assessment Requirements Completed

### ✅ **Core Requirements - All Implemented**

#### 1. **Authentication** 
- ✅ Email/password signup and login via **Clerk**
- ✅ JWT-based session management with secure middleware
- ✅ Protected routes and API endpoints
- ✅ Clean UX with redirect flows

#### 2. **Profile Page (CRUD)**
- ✅ Complete Create, Read, Update, Delete functionality
- ✅ **Profile Model includes all required fields:**
  - ✅ Name
  - ✅ Bio  
  - ✅ Headline
  - ✅ Photo (AWS S3 file upload)
  - ✅ Interests tags (array with filtering)
- ✅ Users can only modify their own profiles (authorization)

#### 3. **Public Feed**
- ✅ Displays all user profiles excluding current user
- ✅ **Pagination implemented** with efficient database queries
- ✅ Mobile-first responsive design
- ✅ RESTful API backend with proper error handling

### 🚀 **Bonus/Stretch Goals - All Implemented**

#### ✅ **Cloud Storage Implementation**
- **AWS S3 integration** for profile image uploads
- Automatic image cleanup on profile updates/deletion
- Secure upload with proper CORS configuration

#### ✅ **Deployment** 
- **Vercel deployment** with production-ready configuration
- Environment variables properly configured
- Automatic deployments on Git push

#### ✅ **Extra Features Implemented**
- **Interest-based filtering** (filter profiles by interest tags)
- **Search functionality** (search by name, bio, headline)
- **Social features** (Follow/Like profiles with real-time updates)
- **Notifications system** for social interactions

## 🏗️ Tech Stack & Architecture

**Frontend:**
- **Next.js 15** with App Router (React.js as required)
- **React 19** with TypeScript for type safety
- **Tailwind CSS v4** for responsive, mobile-first design

**Backend:**
- **Next.js API Routes** (Node.js backend as required)
- RESTful API design with proper HTTP methods
- **Supabase** (PostgreSQL as required)

**Authentication & Security:**
- **Clerk** for JWT-based authentication
- Row Level Security (RLS) policies in database
- Input validation and sanitization

**File Storage:**
- **AWS S3** for profile image storage
- Secure upload with automatic cleanup

**Deployment:**
- **Vercel** for production hosting
- Environment variable management
- Automatic deployments

## 🎯 Architectural Decisions

### **1. Next.js App Router Choice**
I chose Next.js 15 with App Router for several strategic reasons:
- **Full-stack in one framework**: Eliminates the need for separate Express.js backend while still providing Node.js API routes
- **Performance**: Built-in optimizations for images, routing, and static generation
- **Developer Experience**: Hot reloading, TypeScript support, and excellent tooling
- **Scalability**: Easy deployment to Vercel with automatic scaling

### **2. Supabase + Clerk Integration**
Rather than building custom authentication, I integrated Clerk (industry-standard) with Supabase:
- **Security**: Clerk handles JWT token management, password hashing, and session security
- **Developer Productivity**: Focus on business logic rather than auth boilerplate
- **User Experience**: Built-in UI components and smooth authentication flows
- **Database Security**: Leveraged Supabase RLS policies for additional data protection

## 🔧 Setup Instructions

### **Prerequisites**
- Node.js 18+
- npm or yarn
- Git

### **1. Clone and Install**
```bash
git clone <repository-url>
cd sadaora-assestment
npm install
```

### **2. Environment Configuration**
Create `.env.local` with your service credentials:

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/create-profile

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AWS S3 Storage
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET_NAME=your-bucket-name
```

### **3. Database Setup**
The database schema is automatically configured. Key tables:
- `profiles` - User profile data with interests array
- `follows` - Social following relationships  
- `likes` - Profile likes/reactions

### **4. Run Development Server**
```bash
npm run dev
# Visit http://localhost:3000
```

### **5. Test API Endpoints**
```bash
npm run test:api
```

## 📊 Project Structure

```
sadaora-assestment/
├── app/                     # Next.js 15 App Router
│   ├── api/                 # API Routes (Node.js backend)
│   │   ├── profiles/        # Profile CRUD + search
│   │   ├── follows/         # Social following
│   │   └── likes/           # Profile likes
│   ├── dashboard/           # Main feed page
│   ├── profile/             # Profile management
│   └── globals.css          # Tailwind styles
├── components/              # React components
│   ├── feed/                # Feed and profile cards
│   ├── forms/               # Profile creation/editing
│   ├── layout/              # Navigation and layout
│   └── ui/                  # Reusable UI components
├── lib/                     # Utility libraries
│   ├── profiles.ts          # Profile service functions
│   ├── aws.ts               # S3 upload/delete
│   └── supabase.ts          # Database client
├── types/                   # TypeScript definitions
└── middleware.ts            # Clerk authentication
```

## 🛡️ Security Implementation

- **Authentication**: JWT tokens managed by Clerk
- **Authorization**: Users can only modify their own profiles
- **Database Security**: Row Level Security (RLS) policies
- **Input Validation**: TypeScript + runtime validation
- **File Upload Security**: S3 with proper CORS and access controls

## 🧪 API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/profiles` | List profiles (paginated, searchable) | No |
| POST | `/api/profiles` | Create new profile | Yes |
| GET | `/api/profiles/[userId]` | Get specific profile | No |
| PUT | `/api/profiles/[userId]` | Update profile | Yes (own) |
| DELETE | `/api/profiles/[userId]` | Delete profile | Yes (own) |
| POST | `/api/follows` | Follow a user | Yes |
| DELETE | `/api/follows` | Unfollow a user | Yes |
| POST | `/api/likes` | Like a profile | Yes |
| DELETE | `/api/likes` | Unlike a profile | Yes |

## 📝 Key Assumptions Made

1. **Mobile-First Design**: Assumed primary usage on mobile devices, implemented responsive design accordingly
2. **Interest Tags**: Implemented as a flexible array allowing users to add custom interests rather than predefined categories
3. **Social Features**: Added Follow/Like functionality assuming this would be valuable for a member profiles app
4. **Public Profiles**: All profiles are public by default (can view without authentication, but need auth to interact)
5. **Image Storage**: Chose AWS S3 for scalability and professional image handling rather than simple URL storage
6. **Real-time Updates**: Implemented optimistic UI updates for better user experience on social interactions

## 🚀 Deployment

**Live Application:** [Deployed on Vercel](https://sadaora-assestment.vercel.app)

The application is deployed with:
- ✅ Automatic deployments on Git push
- ✅ Environment variables configured
- ✅ Production optimization enabled
- ✅ Global CDN for fast loading

## 🎯 What This Demonstrates

**Code Quality:**
- TypeScript throughout for type safety
- Clean component architecture with separation of concerns
- Proper error handling and loading states
- Consistent naming conventions and file structure

**Frontend Design:**
- Mobile-first responsive design
- Modern UI with smooth interactions
- Reusable component library
- Optimistic UI updates for better UX

**Backend Architecture:**
- RESTful API design
- Proper HTTP status codes and error handling
- Efficient database queries with pagination
- Secure authentication and authorization

**Product Sense:**
- Interest-based filtering for member discovery
- Social features to increase engagement
- Clean onboarding flow
- Performance optimizations for scale

**Security:**
- Industry-standard authentication (Clerk)
- Database-level security (RLS policies)
- Secure file uploads to S3
- Input validation and sanitization

---

**Repository:** [GitHub Link](https://github.com/your-username/sadaora-assestment)  
**Live Demo:** [Vercel Deployment](https://sadaora-assestment.vercel.app)  
**Assessment Completion:** All core requirements + all bonus features implemented
