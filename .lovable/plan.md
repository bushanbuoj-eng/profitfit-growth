

# PROFITFIT — Premium SaaS Web Application

## Overview
A luxury gold-and-black fitness content platform with multi-language support (EN/AR), user authentication, content generation, supplements marketplace, and admin panel.

## 1. Design System & Theme
- Gold (#D4AF37) primary, deep black (#0F0F0F) background, white/gold text
- Premium feel with smooth transitions, subtle gold accents and gradients
- Mobile-first responsive design using Tailwind
- Custom CSS variables for the luxury palette

## 2. Multi-Language System (EN | AR)
- Language toggle (EN | AR) in the header
- React context for language state
- Full Arabic translations for all UI text
- RTL layout when Arabic is selected (dir="rtl" on root)
- All generated content respects selected language

## 3. Landing Page
- Hero section: "Turn Content Into Paying Gym Clients" with "Start Free" CTA
- Demo section showcasing the platform
- Pricing section (3 tiers, display only — no payments)
- Testimonials section with client quotes
- Fully translated when Arabic is selected

## 4. Authentication (No Supabase initially — local state)
- **Sign-up flow** (3 steps, no OTP):
  1. Country dropdown, email, phone number
  2. Password + confirm password
  3. Create 4-digit PIN
- **Login**: Email + password
- PIN for secure actions (optional)
- Users stored in Supabase (will need Lovable Cloud enabled)

## 5. User Dashboard
- Input field: "Enter your content idea"
- "Generate" button produces template-based outputs:
  1. Short video script
  2. Caption
  3. Call to action
  4. Direct message reply
- Outputs generated from pre-built templates (no AI branding)
- Output language matches selected language (EN/AR)

## 6. Supplements Page (User-facing)
- Grid of product cards: image, name, price, description
- Data fetched from Supabase (populated by admin)
- Mobile-friendly responsive grid
- Real-time sync — admin changes appear immediately

## 7. Admin Panel
- Protected route, accessible only to a hardcoded admin email
- Sidebar navigation: Dashboard, Customers, Products
- **Customers**: Table of all registered users (email, phone, country, registration date)
- **Products**: Full CRUD — add/edit/delete supplements with image upload, name, price, description

## 8. User Profile
- Display email, country, selected language
- Logout button

## 9. Database (Supabase via Lovable Cloud)
- `profiles` table: user info (email, phone, country, pin, registration date)
- `products` table: supplement data (name, price, description, image URL)
- `user_roles` table: admin role designation
- RLS policies for security
- Storage bucket for product images

## Technical Notes
- No use of the word "AI" anywhere in the UI
- Admin identified by hardcoded email in the roles system
- Template-based content generation with variety/randomization

