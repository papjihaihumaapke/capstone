# ACMINDER CONTEXT

## App Purpose
Acminder is a smart schedule conflict detection app for students who work part-time.
It detects overlaps between academic deadlines/classes and work shifts before they happen.

## Pages and Routes
- `/` - Splash (landing page)
- `/onboarding` - Onboarding (welcome flow)
- `/signup` - SignUp (user registration)
- `/login` - Login (user authentication)
- `/import` - ImportSchedule (import existing schedule)
- `/home` - Home (dashboard with today's items, conflicts, deadlines) - Protected
- `/calendar` - Calendar (monthly calendar view) - Protected
- `/add` - AddItem (add new schedule item) - Protected
- `/item/:id` - ItemDetail (view/edit item details) - Protected
- `/conflict/:id` - ConflictDetail (resolve conflicts) - Protected
- `/settings` - Settings (user preferences) - Protected

## Components and Props
- **AppShell**: No props - wraps app with responsive shell
- **AuthLayout**: No props - layout for auth pages
- **BottomNav**: No props - bottom navigation with conflict badge
- **FormInput**: label (string), placeholder? (string), type? (string), value (string), onChange ((value: string) => void)
- **MiniCalendar**: No props - date picker component
- **ScheduleItemCard**: item (ScheduleItem), hasConflict? (boolean), onClick? (() => void)
- **Spinner**: No props - loading indicator
- **TabSwitcher**: No props - tab navigation for forms
- **Toast**: No props - notification toast

## Hooks and Returns
- **useAuth**: loading (boolean), error (string | null), signUp (email, pass => Promise<boolean>), signIn (email, pass => Promise<boolean>), signOut (() => Promise<boolean>)
- **useItems**: items (ScheduleItem[]), loading (boolean), error (string | null), fetchItems (() => Promise<void>), addItem (item => Promise<void>), updateItem (id, updates => Promise<void>), deleteItem (id => Promise<void>)
- **useItemForm**: activeTab ('shift'|'class'|'assignment'), setActiveTab (tab => void), formData (object), updateFormData (key, value => void), validate (() => boolean), submit (() => Promise<void>), loading (boolean)
- **usePreferences**: prefs ({notifications: boolean, smartSuggestions: boolean}), setNotifications (val => void), setSmartSuggestions (val => void)

## Supabase Tables
- **profiles**: id (uuid, FK auth.users), email (text), name (text), created_at (timestamptz)
- **schedule_items**: id (uuid), user_id (uuid, FK profiles), type ('shift'|'class'|'assignment'), title (text), date (date), start_time (time), end_time (time), location (text), role (text), repeats_weekly (boolean), due_date (date), due_time (time), course (text), created_at (timestamptz)

## Design Tokens
- **Colors**:
  - Primary: #F07B5A (coral/salmon)
  - Background: #FAFAF8 (off-white warm)
  - Card: #FFFFFF
  - Text Primary: #1A1A1A
  - Text Secondary: #6B6B6B
  - Error/Conflict: #F07B5A
  - Success: #10B981 (green)
- **Fonts**:
  - Body: DM Sans
  - Display/Headings: Poppins
- **Radii**:
  - Cards: 12px
  - Inputs: 8px
  - Buttons: 24px
- **Shadows**: Soft shadows with rgba(0,0,0,0.03) for bottom nav, standard for cards

## Item Types
1. Work Shift — title, date, start time, end time, location, role
2. Class — title, date, start time, end time, location, repeats weekly toggle
3. Assignment — title, due date, due time, course

## Conflict Logic
A conflict = any Work Shift that overlaps in time with a Class on the same date.
Show a red conflict badge on dashboard. Resolve options: Request Shift Change OR Finish Assignment ASAP.

## Code Rules
- Keep components small and single-responsibility
- No inline styles — Tailwind classes only
- All shared types in /src/types/index.ts
- All Supabase calls in /src/lib/supabase.ts and /src/hooks/
- Context: /src/context/AppContext.tsx — single source of truth for items + user
- Human-readable variable names (no abbreviations except id, db, ctx)
- Every file max ~120 lines — split if longer

## Responsive Rules
- Mobile-first: max-width 430px centered card on desktop
- Desktop: centered phone shell with soft shadow
- Never break the mobile layout on larger screens