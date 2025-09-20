# ENT & Dental Polyclinic - Hospital Management System

A modern, responsive web application for ENT and dental practice management built with Next.js, TailwindCSS, Supabase, and shadcn/ui.

## Features

- **Role-based Authentication**: Support for admin, doctor, receptionist, and pharmacist roles
- **Patient Management**: Complete patient records with medical history and contact information
- **Visit Scheduling**: Appointment management with different visit types
- **Medicine Inventory**: Stock management with expiry tracking and low stock alerts
- **Reports & Analytics**: Comprehensive reporting dashboard
- **Responsive Design**: Mobile-first design that works on all devices
- **Dark/Light Mode**: Theme switching with system preference detection
- **Modern UI**: Built with shadcn/ui components for a professional look

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **UI Components**: shadcn/ui with Radix UI primitives
- **Icons**: Lucide React
- **Theme**: next-themes for dark/light mode

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ent_dental
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Your Supabase project is already configured with:
     - Project URL: `https://adygnadivhzoemoqrbgv.supabase.co`
     - Anon Key: Already set in `.env.local`
   - To get your service role key (optional for advanced features):
     - Go to your Supabase project dashboard
     - Navigate to Settings > API
     - Copy the "service_role" key and update `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

4. **Set up the database**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL commands from `supabase-schema.sql` to create tables and sample data

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

   The development server should now be running successfully! 🎉

## Demo Credentials

The application comes with pre-configured demo accounts:

- **Admin**: admin@dental.com / admin123
- **Doctor**: doctor@dental.com / doctor123  
- **Receptionist**: reception@dental.com / reception123
- **Pharmacist**: pharmacist@dental.com / pharmacist123

## User Roles & Permissions

### Admin
- Full access to all features
- Can manage users and system settings
- View all reports and analytics

### Doctor
- View and manage patients
- Schedule and manage visits
- Create prescriptions
- View reports

### Receptionist
- Manage patient records
- Schedule appointments
- View visit information
- Limited access to other features

### Pharmacist
- Manage medicine inventory
- View prescriptions
- Stock management
- Inventory reports

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (dashboard)/       # Dashboard layout and pages
│   ├── login/            # Authentication pages
│   └── layout.tsx        # Root layout
├── components/           # Reusable UI components
│   ├── ui/              # shadcn/ui components
│   ├── sidebar.tsx      # Navigation sidebar
│   ├── navbar.tsx       # Top navigation
│   └── theme-*.tsx      # Theme components
├── lib/                 # Utility functions
│   ├── supabase/        # Supabase client configuration
│   └── utils.ts         # General utilities
└── types/               # TypeScript type definitions
    └── database.ts      # Database schema types
```

## Key Features

### Dashboard
- Overview statistics (patients, visits, medicines)
- Recent activity feed
- Quick action buttons
- Role-based content

### Patient Management
- Complete patient profiles
- Medical history tracking
- Contact information
- Search and filtering

### Visit Management
- Appointment scheduling
- Visit types (consultation, follow-up, emergency, routine)
- Status tracking
- Doctor assignment

### Medicine Inventory
- Stock level monitoring
- Expiry date tracking
- Low stock alerts
- Price management

### Reports
- Visit statistics
- Patient demographics
- Medicine usage
- Revenue tracking (coming soon)

## Customization

### Adding New Features
1. Create new pages in `src/app/(dashboard)/`
2. Add navigation items to `src/components/sidebar.tsx`
3. Update role permissions as needed
4. Add database tables and types if required

### Styling
- Uses TailwindCSS for styling
- Custom CSS variables in `src/app/globals.css`
- Dark/light theme support via CSS variables
- Responsive design with mobile-first approach

### Database Schema
- All tables use Row Level Security (RLS)
- Role-based access control
- Automatic timestamp updates
- Foreign key relationships

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the Supabase documentation for backend questions

## Roadmap

- [ ] Patient photo uploads
- [ ] Advanced reporting with charts
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Integration with payment systems
- [ ] Multi-language support
- [ ] Advanced search and filtering
- [ ] Backup and restore functionality