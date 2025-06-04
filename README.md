# 🌟 Sadaora Assessment - Member Profiles & Feed

A full-stack Next.js application implementing a member profiles and feed system for the Sadaora Senior Full-Stack Engineer assessment.

## 🏗️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **File Storage**: AWS S3
- **Deployment**: Vercel (planned)

## 🚀 Features

### Core Requirements ✅
- **Authentication**: Email/password signup and login via Clerk
- **Profile CRUD**: Complete create, read, update, delete profile functionality
- **Public Feed**: Display all user profiles with pagination
- **File Upload**: Direct AWS S3 integration for profile images
- **API Architecture**: RESTful API endpoints with proper error handling

### Bonus Features ✅
- **Image Upload**: Direct AWS S3 integration with automatic cleanup
- **Search**: Search profiles by name, bio, or headline  
- **Pagination**: Efficient pagination for large datasets
- **Type Safety**: Full TypeScript coverage
- **Security**: Row Level Security (RLS) policies in Supabase

## 📁 Project Structure

```
sadaora-assestment/
├── app/                          # Next.js 15 App Router
│   ├── api/                      # API Routes
│   │   └── profiles/            # Profile CRUD endpoints
│   │       ├── route.ts         # GET /api/profiles, POST /api/profiles
│   │       └── [userId]/        # Individual profile operations
│   │           └── route.ts     # GET, PUT, DELETE /api/profiles/[userId]
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout with ClerkProvider
│   └── page.tsx                 # Home page
├── components/                   # Reusable React components (TBD)
├── lib/                         # Utility libraries
│   ├── aws.ts                   # AWS S3 upload/delete functions
│   ├── database.sql             # Supabase database schema
│   ├── profiles.ts              # Profile service functions
│   └── supabase.ts              # Supabase client configuration
├── scripts/                     # Helper scripts
│   └── test-api.js              # API endpoint testing script
├── types/                       # TypeScript type definitions
│   └── index.ts                 # Profile and API response types
├── middleware.ts                # Clerk authentication middleware
├── SETUP.md                     # Detailed setup instructions
└── README.md                    # This file
```

## 🛠️ Setup Instructions

### Quick Start
1. **Follow the detailed setup guide**: See [SETUP.md](./SETUP.md) for complete instructions
2. **Create `.env.local`** with your service credentials
3. **Install dependencies**: `npm install`
4. **Start development**: `npm run dev`
5. **Test APIs**: `npm run test:api`

### Environment Variables Required
```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

# AWS S3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=sadaora-profile-images-...
```

## 🔌 API Endpoints

### Profiles
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/profiles` | List all profiles (paginated) | No |
| POST | `/api/profiles` | Create new profile | Yes |
| GET | `/api/profiles/[userId]` | Get specific profile | No |
| PUT | `/api/profiles/[userId]` | Update profile | Yes (own profile) |
| DELETE | `/api/profiles/[userId]` | Delete profile | Yes (own profile) |

### Query Parameters
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term for name/bio/headline

## 🏛️ Database Schema

```sql
-- Profiles table
profiles (
  id UUID PRIMARY KEY,
  user_id TEXT UNIQUE,      -- Clerk user ID
  name TEXT NOT NULL,
  bio TEXT NOT NULL,
  headline TEXT NOT NULL,
  avatar_url TEXT,
  interests TEXT[],         -- Array of interest tags
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## 🔐 Security

- **Authentication**: Clerk handles user authentication and session management
- **Authorization**: Users can only modify their own profiles
- **Database Security**: Row Level Security (RLS) policies in Supabase
- **File Upload**: Secure S3 uploads with public read access for avatars
- **Type Safety**: Full TypeScript coverage prevents runtime errors

## 🧪 Testing

### API Testing
```bash
# Test all endpoints
npm run test:api

# Manual testing with curl
curl http://localhost:3000/api/profiles
curl http://localhost:3000/api/profiles?page=1&limit=5
curl "http://localhost:3000/api/profiles?search=john"
```

### Expected Test Results
- All GET endpoints should return valid JSON
- Empty arrays/null results are expected initially (no profiles yet)
- Authentication protected endpoints require Clerk session

## 🎯 Development Status

### Completed ✅
- [x] Project setup and dependencies
- [x] Database schema and migrations
- [x] Authentication with Clerk
- [x] Complete CRUD API for profiles
- [x] AWS S3 image upload integration
- [x] TypeScript types and interfaces
- [x] API testing script
- [x] Documentation

### In Progress 🚧
- [ ] UI Components (mobile-first design)
- [ ] Profile creation/editing forms
- [ ] Public feed interface
- [ ] Image upload UI component

### Planned 📋
- [ ] Search functionality UI
- [ ] Responsive design implementation
- [ ] Error handling UI
- [ ] Loading states
- [ ] Deployment to Vercel

## 🎨 Design Implementation

The application will implement the provided mobile-first design with:
- Clean, modern interface matching the design mockups
- Mobile-responsive layout
- Profile cards with user information
- Image upload with preview
- Search functionality
- Smooth interactions and loading states

## 🚀 Deployment

The application is designed for easy deployment to Vercel:
1. Connect GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Automatic deployments on push to main branch

## 📝 Assessment Notes

This project demonstrates:
- **Full-stack architecture** with Next.js 15 App Router
- **Database design** with proper relationships and indexing
- **Authentication integration** with modern auth provider
- **File upload handling** with cloud storage
- **API design** following RESTful principles
- **Type safety** throughout the application
- **Security best practices** for web applications
- **Modern development practices** with proper tooling

---

**Next Step**: Follow [SETUP.md](./SETUP.md) to configure external services, then return here for UI development.
