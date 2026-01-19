# LawMate Product Requirements Document

## CONTENTS

- Abstract
- Business Objectives
- KPI
- Success Criteria
- User Journeys
- Scenarios
- User Flow
- Functional Requirements
- Model Requirements
- Data Requirements
- Prompt Requirements
- Testing & Measurement
- Risks & Mitigations
- Costs
- Assumptions & Dependencies
- Compliance/Privacy/Legal
- GTM/Rollout Plan

---

## 📝 Abstract

LawMate is a web-based legal case management system that bridges the communication gap between lawyers and clients. It enables lawyers to efficiently manage multiple cases, track court schedules, and communicate updates in plain language, while allowing clients to monitor case progress, understand legal proceedings without jargon, and receive timely hearing reminders—all without requiring office visits. Built on the MERN stack, LawMate addresses real-world problems including client confusion over legal procedures, missed court dates, lost paperwork, and inefficient lawyer-client communication.

---

## 🎯 Business Objectives

- Reduce client anxiety and confusion by providing transparent, real-time case visibility with simplified legal explanations
- Decrease unnecessary office visits and phone calls by centralizing case information online
- Improve lawyer productivity through centralized case management, task tracking, and automated client notifications
- Prevent missed court hearings through automated email reminder system
- Establish digital record-keeping to eliminate lost paperwork and improve document accessibility
- Create market differentiation for law firms adopting modern, client-friendly technology
- Build foundation for scalable SaaS model serving multiple law firms

---

## 📊 KPI

| GOAL                  | METRIC                     | QUESTION                                                    |
| --------------------- | -------------------------- | ----------------------------------------------------------- |
| Market Adoption       | 10-25 Active Lawyers       | How many lawyers actively use the platform within 8-12 weeks |
| Product Usage         | 50-60 Active Cases         | How many real cases are being managed through the system     |
| Value Delivery        | 40-60% WAU OR 4.2+ Rating  | Are users engaged weekly and satisfied with the experience   |

---

## 🏆 Success Criteria

- **Adoption:** Onboard 10-25 lawyers managing real cases within the first 12 weeks
- **Engagement:** Achieve 40-60% weekly active user rate across both lawyer and client segments OR maintain a 4.2+ satisfaction rating
- **Case Volume:** Track 50-60 active cases demonstrating real-world product usage
- **Client Satisfaction:** Reduce client confusion and office visits as measured through user feedback
- **System Reliability:** Maintain 95%+ uptime and successful email delivery rate for hearing reminders
- **Timeline:** Launch fully functional V1 within 10 weeks

---

## 🚶‍♀️ User Journeys

### Lawyer Journey
Maya is a lawyer managing 15 active cases. She logs into LawMate each morning to review her dashboard. When a new client registers, she reviews their details and approves access. She creates a new case for an approved client, selecting "Filed" as the initial stage and adding a simple explanation: "Your case documents have been submitted to the court. We're waiting for the court to assign a hearing date." She schedules the first hearing date and the system automatically queues an email reminder. Throughout the week, she updates case stages as proceedings advance, each time adding plain-language explanations so clients understand what's happening without needing to call her office.

### Client Journey
Raj hired a lawyer for a property dispute but feels lost in the legal process. He receives an email with login credentials to LawMate. After logging in, he sees his case displayed with a progress bar showing "Filed - 20% complete." He reads the lawyer's simple explanation and feels relieved to understand the current status. Two days before his hearing, he receives an email reminder with the date, time, and court location. He logs in again to review the case timeline and confirm the details. This transparency reduces his anxiety and eliminates the need to repeatedly call the lawyer's office for updates.

---

## 📖 Scenarios

### Primary Scenarios

**Lawyer Scenarios:**
1. Lawyer approves a new client registration and grants access to the client portal
2. Lawyer creates a new case, assigns it to a client, sets initial stage as "Filed," and adds a beginner-friendly explanation
3. Lawyer updates case stage from "Filed" to "Hearing" when court date is assigned, explaining what happens next in simple terms
4. Lawyer schedules a hearing date and the system auto-generates email reminder 2 days in advance
5. Lawyer reviews dashboard to see all active cases, upcoming hearings, and pending tasks at a glance
6. Lawyer marks a case as "Closed" with final explanation once judgment is executed

**Client Scenarios:**
1. Client registers on the platform and waits for lawyer approval
2. Client logs in and views assigned case with current stage and visual progress bar
3. Client reads simple-language explanation to understand current case status without legal jargon
4. Client receives email reminder 2 days before hearing with date, time, and location details
5. Client views case timeline to see complete history of case progress
6. Client checks profile to update personal contact information

---

## 🕹️ User Flow

### V1 Happy Path Flow

**Lawyer Flow:**
1. Lawyer registers account with email/password
2. Lawyer logs in to dashboard
3. Lawyer reviews pending client registrations in "Client Approval" section
4. Lawyer approves client access
5. Lawyer navigates to "Create Case" section
6. Lawyer fills case details (case title, type, client assignment, initial stage: "Filed")
7. Lawyer adds simple explanation in plain language
8. Lawyer schedules hearing date
9. System automatically queues email reminder for 2 days before hearing
10. Lawyer views dashboard with case overview and upcoming hearings

**Client Flow:**
1. Client registers account with email/password
2. Client waits for lawyer approval (receives email notification when approved)
3. Client logs in to dashboard
4. Client views "My Cases" section with assigned cases
5. Client sees case progress bar (e.g., "Filed - 20%")
6. Client reads simple-language explanation of current status
7. Client views hearing date details
8. Client receives email reminder 2 days before hearing
9. Client accesses case timeline to see complete case history

**Alternative Flows:**
- Lawyer updates case stage (Hearing → Evidence → Judgment → Closed) with new explanation at each step
- Client checks multiple cases if assigned more than one
- Lawyer rejects client registration if invalid/spam

---

## 🧰 Functional Requirements

### Authentication & Access Control

| SECTION         | SUB-SECTION      | USER STORY & EXPECTED BEHAVIORS                                                                                                                                           | SCREENS      |
| --------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| Signup          | Lawyer           | As a lawyer, I can register with email and password so I can access the admin dashboard. System validates email format and password strength (min 8 characters).        | TBD          |
| Signup          | Client           | As a client, I can register with email and password so I can access my cases. Registration creates pending account awaiting lawyer approval.                             | TBD          |
| Login           | Lawyer           | As a lawyer, I can log in with email/password to access my dashboard. System redirects to lawyer dashboard on successful authentication.                                 | TBD          |
| Login           | Client           | As a client, I can log in with email/password to access my cases. System redirects to client dashboard. Displays "pending approval" message if not yet approved.         | TBD          |
| Forgot Password | Both             | As a user, I can reset my password via email link so I can regain access if I forget credentials. System sends password reset link to registered email.                  | TBD          |

### Lawyer Dashboard Features

**Client Approval System:**
- As a lawyer, I can view all pending client registrations with basic details (name, email, registration date)
- As a lawyer, I can approve or reject client accounts
- System sends email notification to client when approved

**Case Registration:**
- As a lawyer, I can create a new case with fields: case title, case type, client assignment (dropdown of approved clients), initial stage (Filed/Hearing/Evidence/Judgment/Closed)
- As a lawyer, I can add a simple-language explanation for each case stage update
- System validates required fields before case creation

**Case Stage Updates:**
- As a lawyer, I can update case stage from dropdown (Filed → Hearing → Evidence → Judgment → Closed)
- As a lawyer, I must add plain-language explanation with each stage update
- System displays visual progress bar reflecting stage percentage (Filed=20%, Hearing=40%, Evidence=60%, Judgment=80%, Closed=100%)

**Hearing Date Scheduling:**
- As a lawyer, I can add hearing date, time, and location to any case
- System automatically schedules email reminder to client 2 days before hearing date
- As a lawyer, I can edit or cancel hearing dates

**Dashboard Overview:**
- As a lawyer, I can view summary of total cases, active cases, upcoming hearings, and pending client approvals
- As a lawyer, I can see list of all my cases with quick filters (by stage, by client, by priority)
- As a lawyer, I can search cases by case title or client name

**Profile Management:**
- As a lawyer, I can update my profile including firm name, contact details, and profile photo

### Client Dashboard Features

**My Cases Dashboard:**
- As a client, I can view all cases assigned to me
- As a client, I can see case title, current stage, and visual progress bar for each case
- System displays "No cases assigned" message if client has no cases

**Case Progress & Updates:**
- As a client, I can click on a case to view detailed information
- As a client, I can see the current stage with simple-language explanation provided by lawyer
- As a client, I can view visual progress bar showing case completion percentage

**Hearing Date Alerts:**
- As a client, I receive email notification 2 days before scheduled hearing with date, time, and location
- As a client, I can view upcoming hearing details in my case view

**Case Timeline:**
- As a client, I can view complete case history showing all stage updates with timestamps and explanations
- Timeline displays in reverse chronological order (newest first)

**Profile Management:**
- As a client, I can update my personal information (name, phone, address)
- As a client, I can change my password

### System-Wide Features

**Responsive Design:**
- All interfaces work seamlessly on desktop, tablet, and mobile browsers
- Mobile-first design ensures usability on smartphones

**Data Protection:**
- All case data and personal information stored securely in MongoDB with encryption
- User passwords hashed using bcrypt before storage
- HTTPS enforced for all communications

---

## 📐 Model Requirements

Not applicable. LawMate V1 does not use AI/ML models. All content (case explanations, notifications) is lawyer-generated text.

---

## 🧮 Data Requirements

**Data Collection:**
- User data: email, password (hashed), name, phone, address, role (lawyer/client)
- Case data: case title, case type, assigned client, current stage, stage explanations, creation date, last updated date
- Hearing data: hearing date, time, location, associated case
- Timeline data: stage change logs with timestamps and explanations

**Data Storage:**
- MongoDB collections: Users, Cases, Hearings, CaseTimeline
- All data stored with proper indexing for performance (user ID, case ID, hearing date)

**Data Privacy:**
- Client data visible only to assigned lawyer and the client themselves
- Lawyer data partitioned per lawyer account (no cross-lawyer data visibility in V1)
- Secure password storage using bcrypt hashing
- Session management using JWT tokens with expiration

**Data Retention:**
- No automatic deletion in V1
- Lawyers can manually mark cases as "Closed" but data remains in system
- Future: implement data retention policy per legal compliance requirements

---

## 💬 Prompt Requirements

Not applicable. LawMate V1 does not use AI-generated content or prompts. All case explanations are manually written by lawyers.

---

## 🧪 Testing & Measurement

### Pre-Launch Testing

**Functional Testing:**
- Test all user registration and login flows for both lawyer and client roles
- Verify client approval workflow (approve/reject) with email notifications
- Test case creation, stage updates, and simple explanation input
- Validate hearing date scheduling and email reminder delivery (test 2-day-before trigger)
- Verify visual progress bar updates correctly with stage changes (20%, 40%, 60%, 80%, 100%)
- Test case timeline displays all stage changes in correct order
- Verify responsive design on mobile, tablet, and desktop browsers

**Security Testing:**
- Verify password hashing with bcrypt
- Test role-based access control (clients cannot access lawyer dashboard and vice versa)
- Ensure clients only see their assigned cases
- Validate session expiration and token security

**Performance Testing:**
- Test page load times under expected user load (25 lawyers, 60 cases)
- Verify email delivery success rate for hearing reminders

### Post-Launch Monitoring

**Usage Tracking:**
- Daily active lawyers and clients
- Weekly active user rate (target: 40-60%)
- Number of cases created per week (target: 50-60 total active cases by week 12)
- Hearing reminders sent vs. delivered successfully

**User Feedback:**
- In-app feedback form for both lawyers and clients
- Track satisfaction rating (target: 4.2+ out of 5)
- Monitor support requests and common issues

**Performance Monitoring:**
- System uptime tracking (target: 95%+)
- Email delivery success rate (target: 95%+)
- Page load time monitoring
- Error rate tracking

**Iteration Plan:**
- Weekly review of usage metrics and user feedback
- Bi-weekly prioritization of bug fixes and UX improvements
- Monthly assessment of KPI progress toward 8-12 week targets

---

## ⚠️ Risks & Mitigations

| RISK                                      | MITIGATION                                                                                      |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------- |
| TBD - Minimal risk assessment per request | Focus on thorough testing, user feedback loops, and iterative improvements post-launch          |

---

## 💰 Costs

### Development Costs
- **Zero budget:** Open-source MERN stack, free hosting options (Render, Vercel, MongoDB Atlas free tier)
- **Time investment:** 10-week development timeline with focus on V1 core features
- **Email service:** Free tier of SendGrid or NodeMailer with Gmail SMTP (up to 100 emails/day initially)

### Operational Costs
- **Hosting:** Free tier initially, may require paid hosting as user base grows beyond free limits
- **Database:** MongoDB Atlas free tier (512MB storage, sufficient for initial 50-60 cases)
- **Email delivery:** Free tier sufficient for V1 scale (approx. 120 reminders/month with 60 cases)
- **Domain:** Optional, can use free subdomain initially

### Post-V1 Scaling Costs
- Paid hosting tier if exceeding free tier limits
- Paid email service tier if reminder volume increases
- Potential costs for SSL certificate if not using free options

---

## 🔗 Assumptions & Dependencies

### Assumptions
1. **Self-registration allowed:** Lawyers can self-register without admin approval in V1 (simplified onboarding)
2. **Email as primary notification channel:** Clients have access to email and check it regularly
3. **Simple case stages sufficient:** Five stages (Filed, Hearing, Evidence, Judgment, Closed) cover most case types in V1
4. **Manual explanations acceptable:** Lawyers willing to write simple-language explanations for each stage update
5. **No document upload in V1:** Document management deferred to post-V1 iteration due to 10-week timeline
6. **Single lawyer per firm:** V1 does not support multi-lawyer firms or collaborative case management
7. **No payment integration:** Fee tracking mentioned in PDF deferred to post-V1

### Dependencies
1. **Email delivery service:** Reliable email provider (SendGrid/NodeMailer) for hearing reminders
2. **Hosting platform:** Stable hosting environment for MERN stack application
3. **Database availability:** MongoDB Atlas or equivalent for data storage
4. **Browser compatibility:** Modern browsers (Chrome, Firefox, Safari, Edge) for responsive web app
5. **Development resources:** Skilled MERN stack developer(s) available for 10-week timeline
6. **User testing participants:** Access to 2-3 lawyers and 5-10 clients for beta testing before launch

---

## 🔒 Compliance/Privacy/Legal

### Data Protection
- **Encryption:** All sensitive data encrypted at rest and in transit (HTTPS enforced)
- **Password security:** Passwords hashed using bcrypt before storage, never stored in plain text
- **Access control:** Role-based access ensures clients only see their own cases and lawyers only see their own clients

### Privacy Considerations
- **Data minimization:** Collect only essential information needed for case management
- **User consent:** Clear terms of service and privacy policy required at registration
- **Data sharing:** No third-party data sharing in V1
- **User rights:** Users can update their profile information; future: implement data export and deletion

### Legal Compliance
- **Attorney-client privilege:** Case data treated as confidential legal information
- **Data sovereignty:** Consider regional data storage requirements if expanding beyond initial market
- **Disclaimer:** Add disclaimer that LawMate is a case management tool, not legal advice platform

### Future Compliance Roadmap
- GDPR compliance if serving EU clients
- HIPAA considerations if handling medical-legal cases
- Regular security audits as user base grows
- Data retention and deletion policies per legal standards

---

## 📣 GTM/Rollout Plan

### Pre-Launch Phase (Weeks 1-8)
- **Week 1-6:** Core development (authentication, case management, notification system)
- **Week 7:** Internal testing and bug fixes
- **Week 8:** Beta testing with 2-3 pilot lawyers and 5-10 clients

### Beta Launch (Week 9)
- **Objective:** Validate V1 happy path with real users
- **Participants:** 3-5 early-adopter lawyers managing 10-15 real cases
- **Focus:** Gather feedback on usability, notification reliability, and simple-language effectiveness
- **Success metric:** 80%+ of beta users complete end-to-end workflow without support

### Public Launch (Week 10)
- **Channels:** Direct outreach to law firms, legal community forums, LinkedIn legal groups
- **Messaging:** "Simplify client communication and case management with LawMate - free, open-source, and built for modern law practices"
- **Target audience:** Solo practitioners and small law firms (2-5 lawyers) with high client interaction volume

### Post-Launch Growth (Weeks 11-12)
- **Goal:** Reach 10-25 active lawyers and 50-60 active cases
- **Tactics:**
  - Word-of-mouth from beta users
  - Case study featuring successful beta firm
  - Demo video showing lawyer and client dashboards
  - Free onboarding support for first 25 lawyers
- **Monitoring:** Weekly KPI review and user feedback sessions

### Future Roadmap (Post-Week 12)
- **Phase 2 features:** Document upload, fee tracking, task management, advanced reporting
- **Scaling:** Migrate to paid hosting if traffic exceeds free tier
- **Monetization:** Explore freemium model or subscription pricing for advanced features
- **Expansion:** Multi-lawyer firm support, mobile app, integrations with court e-filing systems

---

**End of PRD**
