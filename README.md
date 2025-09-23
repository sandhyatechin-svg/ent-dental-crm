# ENT & Dental Polyclinic CRM

A comprehensive Customer Relationship Management system designed specifically for ENT & Dental Polyclinics. This application helps manage patients, appointments, medicines, and clinic operations efficiently.

## Features

### 🏥 **Patient Management**
- Patient registration and profile management
- Medical history tracking
- Contact information management

### 📅 **Appointment Scheduling**
- Visit scheduling and management
- Doctor assignment
- Visit type categorization (consultation, follow-up, emergency, etc.)
- Automatic fee calculation based on revisit timing

### 💊 **Pharmacy Management**
- Medicine inventory management
- Prescription handling
- Stock tracking and updates
- Medicine sales reporting

### 👨‍⚕️ **Doctor Dashboard**
- Today's patient list
- Visit management
- Patient examination tracking
- Quick actions and notes

### 🏢 **Admin Dashboard**
- Comprehensive analytics and reports
- Income tracking (visits and medicine sales)
- Patient statistics
- Revenue charts and insights

### 🖨️ **Print Management**
- Patient letterheads
- Bill receipts
- Medicine slips
- Professional document templates

### 🔐 **Role-Based Access Control**
- Admin: Full system access
- Doctor: Patient management and examinations
- Pharmacist: Medicine and prescription management
- Receptionist: Patient registration and scheduling

## Technology Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Cloudflare Pages

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <your-repository-url>
cd ent-dental-crm
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Cloudflare Pages

1. Push your code to GitHub/GitLab
2. Connect your repository to Cloudflare Pages
3. Set build settings:
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
4. Add environment variables in Cloudflare Pages settings
5. Deploy!

## Database Setup

The application uses Supabase with the following main tables:
- `patients` - Patient information
- `visits` - Visit records and appointments
- `prescriptions` - Medicine prescriptions
- `medicines` - Medicine inventory
- `users` - User accounts and roles

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team.