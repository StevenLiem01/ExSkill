<div align="center">
  
# ExSkill
**Peer-to-Peer Student Skill Exchange Platform**

![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

*A secure, accountable, and gamified ecosystem for university students to trade their skills without money.*

</div>

---

## 🧐 Problem & Solution

### The Problem
University students often want to learn new practical skills outside their major (e.g., a Business student wanting to learn Python, or an IT student wanting to learn Public Speaking) but cannot afford expensive courses or tutors. 
Traditional informal skill exchanges suffer from two major flaws:
- **Asymmetric Commitment**: One party teaches fully, but the other party flakes or puts in zero effort.
- **Ghosting**: Participants abandon the learning process midway without consequences.

### The Solution: ExSkill
ExSkill solves this by providing a structured, milestone-driven environment. Instead of informal promises, exchanges are tracked systematically. Participants must mutually confirm the completion of sessions, and their behavior directly impacts their public **Trust Score**. This creates a reliable, consequence-driven ecosystem where both parties are equally invested.

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| 🧮 **Smart Matching Algorithm** | A rule-based weighted algorithm that calculates a 0-100% Match Score based on reciprocal interests, skill proficiency levels, and the candidate's Trust Score. |
| 📍 **Milestone-Based Exchange** | Break down the learning journey into structured milestones. Clear goals prevent scope creep and keep the exchange focused. |
| 🤝 **Mutual Confirmation** | Both the teacher and the learner must digitally confirm the completion of a session. No one can claim a milestone is finished unilaterally. |
| 🛡️ **Trust Score System** | A dynamic reputation metric. Successful exchanges and good reviews boost the score, while being reported or losing a dispute decreases it. |
| ⚖️ **Dispute & Block System** | Built-in safety mechanisms allowing users to block toxic individuals or open a dispute for admin mediation if an exchange goes wrong. |
| 🎨 **Cyber-Neon UI** | A premium, dark-mode exclusive interface utilizing modern Glassmorphism and vibrant neon accents for a highly immersive experience. |

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🏗️ System Architecture

ExSkill is built with a clear separation of concerns and robust access control:

- **Role-Based Access Control (RBAC)**: 
  - `USER`: Can explore partners, propose exchanges, manage milestones, and leave reviews.
  - `ADMIN`: Has access to a dedicated dashboard to resolve disputes, manage user bans, and oversee platform statistics.
- **Session Management**: Each milestone contains multiple "Sessions". A session transitions from `SCHEDULED` to `COMPLETED` only after both parties trigger the Mutual Confirmation logic.
- **Security-First API**: All API routes are protected using server-side session validation. Sensitive actions (like blocking or reporting) are strictly scoped to the authenticated user.

---

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (or any relational database supported by Prisma)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/exskill.git
   cd exskill
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add the required variables:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/exskill?schema=public"
   NEXTAUTH_SECRET="your-super-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Initialize Database**
   Push the Prisma schema to your database and generate the Prisma Client:
   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Run the Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

---

## 🗺️ Roadmap (Future Enhancements)

While ExSkill is currently fully functional as an MVP, we have ambitious plans for future versions:

- [ ] **Real-time Chat**: Upgrade the current polling-based chat to WebSockets (Socket.io/Pusher) for seamless real-time communication.
- [ ] **AI Recommendation Engine**: Replace the rule-based matching algorithm with a machine learning model that understands natural language bios and learning styles.
- [ ] **Mobile Application**: Port the web experience into a native mobile app using React Native for on-the-go learning.
- [ ] **Video Integration**: In-app WebRTC video calling for remote learning sessions without relying on external links.

---

> *"Empowering students to share knowledge, one milestone at a time."*

## 👨‍💻 Author

https://github.com/StevenLiem01