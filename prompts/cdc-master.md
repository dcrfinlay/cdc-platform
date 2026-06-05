CDC Platform

A production-grade university Career Development Centre system.

Users:
- Student
- Employer
- CDC Staff
- CDC Administrator

Goal:
Replace prototype HTML with scalable SaaS-like system.

Constraints:
- Next.js 15 + TypeScript
- Supabase (PostgreSQL + Storage + Auth)
- TailwindCSS + shadcn/ui
- No SSO, no LDAP, no enterprise auth systems
- Email/password + magic link only
- Must support 10k students + 1k employers
- Mobile-first design
- Lighthouse score target > 95

Modules:

1. Authentication System
- Email/password
- Magic link
- JWT session
- Role-based access control

2. Job & Internship System
- Job board
- Internship listings
- Applications
- Saved jobs

3. Events System
- Career fairs
- Guest speakers
- Workshops
- QR attendance

4. Internship Letter Workflow
- Draft → Submitted → Review → Approved → Collected

5. Appointment System
- Booking slots
- Calendar sync
- Career services

6. Resume System
- Upload CV
- Employer search (opt-in)

7. Admin CMS
- Manage homepage content
- Upload images
- Manage users
- System logs

8. Analytics
- PostHog integration
- Graduate outcomes dashboard
Core entities:

User
Profile
Role
Job
Internship
Application
Event
Booking
Resume
Employer
Notification
InternshipLetter

Security requirements:

- Supabase Row Level Security (RLS mandatory)
- Role-based access control
- Rate limiting on auth + forms
- Secure file uploads (CVs, images)
- Audit logs for admin actions
- Password hashing handled by Supabase Auth
- JWT-based session handling
- GDPR + FERPA-inspired privacy rules

Design rules:

- Minimal university SaaS UI
- Clean dashboard layouts per role
- Fast navigation
- Mobile-first responsiveness
- shadcn/ui components only
- Consistent spacing system
- Admin panel must support image updates without code changes

Build approach:

- Modular architecture
- Feature-based folders
- Avoid monolithic components
- Prefer reusable UI components
- Keep API layer thin
- Use Supabase as backend engine

When working in this project:

- Always analyze before coding
- Never build full system at once
- Work module by module
- Output file-level changes only
- Avoid duplication across systems
- Merge overlapping features when possible
