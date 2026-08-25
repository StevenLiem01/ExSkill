# Product Requirements Document (PRD)

# **SkillSwap — Peer-to-Peer Student Skill Exchange Platform**

**Document Version:** 1.0  
**Project Type:** Portfolio / MVP  
**Platform:** Web Application  
**Primary Users:** University Students  
**Roles:** User dan Admin

---

# 1. Product Overview

## 1.1 Product Name

**SkillSwap**

> Nama ini masih bisa kita ganti nanti. Untuk sementara digunakan sebagai nama proyek.

## 1.2 Product Description

SkillSwap adalah platform berbasis web yang memungkinkan mahasiswa untuk **bertukar keterampilan dan pengetahuan secara peer-to-peer**.

Seorang user dapat berperan sebagai **teacher dan learner secara bersamaan**, tergantung pada skill yang sedang dipertukarkan.

Contoh:

> User A memiliki kemampuan C++ dan ingin belajar UI/UX.

> User B memiliki kemampuan UI/UX dan ingin belajar C++.

Keduanya dapat membuat sebuah **Skill Exchange Agreement** untuk melakukan pertukaran pembelajaran secara terstruktur.

Namun, platform tidak hanya berfungsi sebagai tempat menemukan partner belajar.

Masalah utama yang ingin diselesaikan adalah:

> **Bagaimana membuat proses pertukaran skill antara dua orang yang tidak saling mengenal menjadi lebih terstruktur, adil, dan terpercaya?**

Untuk menjawab masalah tersebut, SkillSwap menyediakan mekanisme:

- Skill Matching
- Exchange Proposal
- Exchange Agreement
- Milestone-Based Exchange
- Session Tracking
- Mutual Confirmation
- Rating & Review
- Trust Score
- Reporting & Moderation

---

# 2. Problem Statement

## 2.1 Masalah Utama

Mahasiswa memiliki berbagai keterampilan yang dapat dibagikan kepada mahasiswa lain, seperti:

- Programming
- UI/UX Design
- Graphic Design
- Video Editing
- Public Speaking
- Photography
- Foreign Language
- Data Analysis

Di sisi lain, mahasiswa juga ingin mempelajari keterampilan baru.

Namun, terdapat beberapa permasalahan.

### Problem 1 — Sulit menemukan partner yang tepat

Pencarian partner belajar biasanya dilakukan melalui:

- Teman
- Grup WhatsApp
- Komunitas
- Media sosial
- Organisasi

Proses tersebut tidak memiliki sistem khusus untuk mencocokkan:

> Skill yang dimiliki ↔ Skill yang ingin dipelajari.

---

### Problem 2 — Pembelajaran dapat membutuhkan biaya

Tidak semua mahasiswa memiliki budget untuk:

- Kursus
- Mentor
- Bootcamp
- Kelas premium

Padahal mahasiswa lain mungkin memiliki kemampuan yang dibutuhkan dan bersedia melakukan pertukaran skill.

---

### Problem 3 — Tidak adanya struktur dalam proses exchange

Pertukaran informal dapat menyebabkan situasi seperti:

```text id="tv9z8h"
User A mengajarkan C++
        ↓
User B menerima pembelajaran
        ↓
User B tidak memenuhi komitmennya
        ↓
User B menghilang
```

Situasi ini disebut dalam konteks project sebagai:

> **Asymmetric Commitment**

Satu pihak telah memberikan value, sementara pihak lain belum atau tidak memberikan value yang telah disepakati.

---

### Problem 4 — Trust antar-user

User mungkin:

- Mengklaim memiliki skill yang sebenarnya belum dikuasai.
- Membatalkan exchange secara berulang.
- Tidak hadir pada sesi.
- Memberikan rating palsu.
- Menghilang setelah menerima pembelajaran.
- Melakukan harassment.

Karena itu, platform membutuhkan mekanisme trust dan accountability.

---

# 3. Product Vision

Membangun sebuah platform yang memungkinkan mahasiswa untuk:

> **Learn from others, teach what they know, and exchange knowledge through a structured and trusted system.**

---

# 4. Product Goals

## 4.1 Primary Goals

1. Memudahkan mahasiswa menemukan partner pertukaran skill.
2. Memungkinkan user menjadi teacher dan learner secara fleksibel.
3. Menyediakan sistem exchange yang terstruktur.
4. Mengurangi risiko asymmetric commitment.
5. Membangun trust antar-user melalui reputation system.
6. Memberikan pengalaman penggunaan yang mudah dipahami.
7. Menjadi portfolio project yang menunjukkan kemampuan:
   - Full-stack development
   - Database design
   - Authentication & Authorization
   - Business logic
   - Algorithm design
   - Role-based system
   - System design

---

# 5. Non-Goals

Untuk MVP, SkillSwap **tidak bertujuan untuk**:

- Menjadi platform kursus online.
- Menggantikan Zoom atau Google Meet.
- Menjadi social media.
- Menyediakan payment gateway.
- Menjadi marketplace mentor profesional.
- Memiliki AI recommendation system.
- Memiliki aplikasi mobile native.

Fitur-fitur tersebut dapat menjadi pengembangan di masa depan.

---

# 6. Target Users

## 6.1 Primary Target User

### University Students

Karakteristik:

- Memiliki minimal satu skill yang dapat dibagikan.
- Ingin mempelajari skill baru.
- Memiliki keterbatasan budget untuk kursus.
- Tertarik pada peer learning.
- Ingin memperluas networking.

---

## 6.2 User Persona

### Persona A — Skill Provider & Learner

**Name:** Steven  
**Major:** Computer Science

**Can Teach:**

- C++
- Basic Programming

**Wants to Learn:**

- UI/UX Design
- Figma

Goal:

> Menemukan mahasiswa yang dapat mengajarkan UI/UX dan mendapatkan pembelajaran C++ sebagai pertukaran.

---

### Persona B — Reciprocal Partner

**Name:** Sarah  
**Major:** Visual Communication Design

**Can Teach:**

- UI/UX
- Figma

**Wants to Learn:**

- Programming

Goal:

> Mempelajari dasar programming sambil mengajarkan UI/UX.

---

# 7. User Roles

SkillSwap memiliki dua role.

## 7.1 User

User merupakan mahasiswa yang menggunakan platform untuk:

- Membuat profile.
- Menambahkan skills.
- Menentukan skills yang ingin dipelajari.
- Menemukan match.
- Mengirim exchange proposal.
- Melakukan exchange.
- Mengikuti session.
- Memberikan rating.
- Melakukan report.
- Membangun reputation.

### Important Design Decision

User **tidak dibagi menjadi Teacher dan Student**.

Alasannya:

> SkillSwap menggunakan konsep peer-to-peer.

Satu user dapat menjadi:

```text id="3v2oos"
Teacher → ketika mengajarkan C++

Learner → ketika mempelajari UI/UX
```

Role tidak berubah.

Yang berubah adalah **konteks dalam sebuah exchange**.

---

## 7.2 Admin

Admin bertanggung jawab terhadap pengelolaan dan keamanan platform.

Admin dapat:

- Melihat user.
- Mengelola status user.
- Suspend atau ban user.
- Melihat exchange.
- Menangani report.
- Menangani dispute.
- Mengelola skill master data.
- Melihat platform analytics.

Admin **tidak berpartisipasi dalam skill exchange**.

---

# 8. Authentication & Authorization

## 8.1 Authentication

User dapat:

- Register
- Login
- Logout

Setelah login berhasil, sistem mengidentifikasi:

```text id="pfcjyo"
User ID
Role
Account Status
```

---

## 8.2 Role-Based Experience

Semua user menggunakan:

> Satu website dan satu landing page.

Contoh:

```text id="gq1nyw"
/
```

Setelah login:

```text id="1lh7dz"
Authenticated
       ↓
Check Role
   ┌───┴────┐
   ↓        ↓
USER      ADMIN
   ↓        ↓
User UI   Admin UI
```

Dashboard dapat menggunakan route utama yang sama:

```text id="135mfv"
/dashboard
```

Namun konten yang ditampilkan berbeda berdasarkan role.

---

## 8.3 Authorization

Frontend hanya menentukan tampilan.

Backend tetap melakukan pengecekan role.

Contoh:

```text id="ysbx0w"
USER
GET /api/admin/users
        ↓
403 Forbidden
```

Sedangkan:

```text id="g6q3mh"
ADMIN
GET /api/admin/users
        ↓
200 OK
```

---

# 9. User Dashboard Requirements

Dashboard User harus fokus pada aktivitas skill exchange.

## 9.1 Dashboard Overview

Menampilkan:

- Trust Score
- Total Skill Credits
- Active Exchanges
- Completed Exchanges
- Upcoming Sessions
- Recommended Matches

---

## 9.2 My Skills

User dapat:

### Add Skill

Informasi:

- Skill Name
- Category
- Skill Level
- Experience Description

Contoh:

```text id="gir5mi"
Skill: C++

Level: Advanced

Experience:
2 years of academic and personal project experience.
```

---

## 9.3 Skills I Want to Learn

User dapat menambahkan skill yang ingin dipelajari.

Contoh:

```text id="80eh5v"
UI/UX Design
Level Target: Beginner
```

---

## 9.4 Discover / Matching

User dapat:

- Melihat recommended users.
- Melakukan search.
- Melakukan filtering.
- Melihat Match Score.
- Melihat profile kandidat.

---

## 9.5 User Profile

Menampilkan:

- Name
- University
- Major
- Bio
- Skills
- Skill Levels
- Portfolio Links
- Trust Score
- Completed Exchanges
- Reviews

---

# 10. Matching Mechanism

## 10.1 Objective

Menemukan user yang memiliki potensi pertukaran skill yang relevan.

---

## 10.2 Initial Approach

MVP menggunakan:

> **Rule-Based Weighted Matching**

Bukan AI atau Machine Learning.

Alasan:

1. Dataset belum tersedia.
2. Matching criteria sudah dapat didefinisikan.
3. Hasil mudah dijelaskan.
4. Lebih mudah di-debug.
5. Cocok untuk MVP.

---

## 10.3 Matching Factors

Contoh faktor:

| Factor | Weight |
|---|---:|
| Reciprocal Skill Match | 40% |
| Skill Interest Match | 30% |
| Skill Level Compatibility | 15% |
| Availability Compatibility | 10% |
| Trust Score | 5% |

Contoh:

```text id="vnhe8x"
User A:
Can Teach → C++
Wants → UI/UX

User B:
Can Teach → UI/UX
Wants → C++
```

Keduanya memiliki reciprocal match yang tinggi.

---

## 10.4 Match Score

Sistem menghitung:

```text id="ay4qod"
Match Score =
Reciprocal Match
+
Interest Match
+
Level Compatibility
+
Availability Compatibility
+
Trust Score
```

Hasil:

```text id="cv4atf"
95% Match
```

Match Score digunakan sebagai:

> Recommendation indicator

dan bukan jaminan bahwa exchange pasti berhasil.

---

# 11. Exchange Proposal

## 11.1 Create Proposal

User dapat mengirim proposal kepada user lain.

Proposal berisi:

- Skill yang akan diajarkan.
- Skill yang ingin dipelajari.
- Jumlah session.
- Durasi per session.
- Optional message.

---

## 11.2 Proposal Status

```text id="fgtuhy"
PENDING
ACCEPTED
REJECTED
CANCELLED
EXPIRED
```

---

## 11.3 Proposal Rules

1. User tidak dapat mengirim proposal kepada dirinya sendiri.
2. Proposal hanya dapat dibuat jika kedua user aktif.
3. User tidak dapat membuat proposal duplikat yang identik dan masih aktif.
4. Proposal dapat ditolak.
5. Proposal dapat dibatalkan sebelum diterima.

---

# 12. Exchange Agreement

Ketika proposal diterima, sistem membuat Exchange.

Exchange berisi:

```text id="x1e8ql"
Participant A
Participant B

Skill A teaches
Skill B teaches

Total sessions

Session duration
```

Status:

```text id="oaqdlr"
ACTIVE
COMPLETED
CANCELLED
DISPUTED
```

---

# 13. Milestone-Based Exchange

Ini adalah salah satu core mechanism.

Masalah:

```text id="3wlaf3"
A memberikan 100%
B belum memberikan apa pun
```

Solusi:

> Value diberikan secara bertahap.

Contoh:

```text id="80fvpe"
Milestone 1
A teaches C++
B teaches UI/UX

Milestone 2
A teaches C++
B teaches UI/UX

Milestone 3
A teaches C++
B teaches UI/UX
```

Dengan demikian:

```text id="5bg01o"
A memberi value
        ↕
B memberi value
        ↓
Next milestone
```

Tidak ada requirement bahwa satu pihak harus menyelesaikan seluruh kewajibannya terlebih dahulu.

---

# 14. Session Management

Setiap milestone dapat memiliki session.

Informasi:

- Scheduled Date
- Duration
- Status

Status:

```text id="9lu37m"
SCHEDULED
IN_PROGRESS
AWAITING_CONFIRMATION
COMPLETED
CANCELLED
DISPUTED
```

---

# 15. Mutual Confirmation

Session tidak langsung dianggap selesai.

Flow:

```text id="yify2t"
Session occurs
      ↓
User A confirms
      ↓
User B confirms
      ↓
Session Completed
```

Jika salah satu user tidak melakukan confirmation:

```text id="63pvbp"
AWAITING_CONFIRMATION
```

User lain dapat:

- Wait
- Raise an issue
- Open dispute

---

# 16. Trust Score System

Trust Score digunakan untuk membantu user menilai reliability user lain.

## 16.1 Influencing Factors

Trust Score dapat dipengaruhi oleh:

### Positive

- Completed Exchanges
- Completed Sessions
- Positive Ratings
- High Attendance

### Negative

- Repeated Cancellation
- No-show
- Valid Reports
- Dispute Violations

---

## 16.2 Example Formula

Untuk MVP, formula harus sederhana dan explainable.

Contoh konseptual:

```text id="7eon6g"
Trust Score =
Base Score
+ Completion Score
+ Rating Score
+ Attendance Score
- Cancellation Penalty
- Violation Penalty
```

Score dibatasi:

```text id="jdhr78"
0 – 100
```

---

## 16.3 Trust Restrictions

Contoh:

| Trust Score | Status |
|---|---|
| 80–100 | Excellent |
| 60–79 | Good |
| 40–59 | Fair |
| Below 40 | Restricted |

User dengan score sangat rendah dapat dibatasi untuk membuat exchange baru.

---

# 17. Rating & Review System

User hanya dapat memberikan rating setelah:

> Exchange Completed.

Hal ini mencegah fake review dari user yang tidak pernah melakukan exchange.

Rating:

```text id="nalymn"
1–5
```

Optional review:

```text id="udlqc2"
Text Comment
```

User hanya dapat memberikan satu rating kepada partner untuk satu exchange.

---

# 18. Reporting & Dispute System

## 18.1 Report User

User dapat melaporkan user lain.

Kategori:

- No-show
- Harassment
- Fake Skill
- Exchange Violation
- Other

---

## 18.2 Dispute

Jika terjadi konflik dalam exchange:

```text id="6ixzx2"
User
 ↓
Open Dispute
 ↓
Select Reason
 ↓
Provide Description
 ↓
Admin Review
 ↓
Decision
```

Status:

```text id="5w80xq"
OPEN
UNDER_REVIEW
RESOLVED
REJECTED
```

---

## 18.3 Admin Actions

Admin dapat:

- Approve dispute.
- Reject dispute.
- Warn user.
- Reduce Trust Score.
- Suspend user.
- Ban user.

---

# 19. User Status

User status berbeda dari role.

Role:

```text id="5oue1x"
USER
ADMIN
```

Status:

```text id="3pdano"
ACTIVE
SUSPENDED
BANNED
```

Contoh:

```text id="4fyiyq"
Role: USER
Status: ACTIVE
```

---

# 20. Block System

User dapat memblokir user lain.

Setelah diblokir:

- User tidak dapat mengirim proposal baru.
- User tidak muncul sebagai recommended match.
- Existing communication dapat dibatasi.

Untuk MVP, behavior exact dapat ditentukan lebih lanjut saat system design.

---

# 21. Admin Dashboard Requirements

Admin dashboard memiliki fokus:

> Platform management, safety, dan moderation.

## 21.1 Dashboard Overview

Menampilkan:

- Total Users
- Active Users
- Active Exchanges
- Completed Exchanges
- Pending Reports
- Open Disputes
- Suspended Users

---

## 21.2 User Management

Admin dapat:

- Search user.
- View user profile.
- View Trust Score.
- View exchange history.
- Suspend user.
- Ban user.
- Reactivate user jika sesuai kebijakan.

---

## 21.3 Exchange Monitoring

Admin dapat melihat:

- Exchange status.
- Participants.
- Milestones.
- Session history.
- Completion history.

Admin tidak mengubah exchange normal tanpa alasan moderasi.

---

## 21.4 Report Management

Admin dapat:

```text id="mm3689"
View
Review
Resolve
Reject
```

---

## 21.5 Dispute Management

Admin dapat melihat:

- Reporter
- Reported User
- Exchange History
- Session Confirmation
- Evidence
- Previous Reports

Kemudian membuat keputusan.

---

## 21.6 Skill Management

Admin dapat:

- Add Skill
- Edit Skill
- Disable Skill
- Manage Category

Tujuannya mencegah:

```text id="l3lubg"
C++
C Plus Plus
Cplusplus
CPP
```

menjadi data skill yang terpisah.

---

# 22. Core Database Entities

Struktur konseptual:

```text id="6fwvwk"
User
 │
 ├── UserSkill
 │      └── Skill
 │
 ├── WantedSkill
 │      └── Skill
 │
 ├── ExchangeProposal
 │
 ├── Exchange
 │      │
 │      ├── Milestone
 │      │      │
 │      │      └── Session
 │      │              │
 │      │              └── Confirmation
 │
 ├── Rating
 │
 ├── Report
 │
 ├── Dispute
 │
 └── Block
```

---

# 23. Proposed Core Entities

## User

```text id="cwxh82"
id
name
email
password_hash
role
status
trust_score
created_at
updated_at
```

---

## Skill

```text id="azp55j"
id
name
category
status
```

---

## UserSkill

```text id="iybrmr"
id
user_id
skill_id
level
experience_description
```

---

## WantedSkill

```text id="j4uum4"
id
user_id
skill_id
target_level
```

---

## ExchangeProposal

```text id="7y025j"
id
sender_id
receiver_id

sender_teaches_skill_id
sender_wants_skill_id

session_count
session_duration

status
created_at
```

---

## Exchange

```text id="swtv24"
id
proposal_id

participant_a_id
participant_b_id

status
started_at
completed_at
```

---

## Milestone

```text id="grf9ck"
id
exchange_id
sequence
status
```

---

## Session

```text id="wefqwi"
id
milestone_id

scheduled_at
duration

status
```

---

## SessionConfirmation

```text id="903m6g"
id
session_id
user_id
confirmed_at
```

---

## Rating

```text id="sdrccj"
id
exchange_id
reviewer_id
reviewee_id
rating
review
created_at
```

---

## Report

```text id="m9y3fr"
id
reporter_id
reported_user_id
exchange_id
reason
description
status
created_at
```

---

## Dispute

```text id="totmld"
id
exchange_id
opened_by
reason
description
status
admin_id
resolution
created_at
resolved_at
```

---

## Block

```text id="mh48u3"
id
blocker_id
blocked_id
created_at
```

---

# 24. Core System Flow

```text id="xlgufj"
LANDING PAGE
      ↓
REGISTER / LOGIN
      ↓
AUTHENTICATION
      ↓
ROLE CHECK
      │
 ┌────┴─────┐
 ↓          ↓
USER       ADMIN
 ↓          ↓
User UI    Admin UI
```

User flow:

```text id="eebmzj"
PROFILE
   ↓
ADD SKILLS
   ↓
ADD WANTED SKILLS
   ↓
MATCHING
   ↓
VIEW CANDIDATE
   ↓
SEND PROPOSAL
   ↓
ACCEPT / REJECT
   ↓
CREATE EXCHANGE
   ↓
MILESTONE
   ↓
SESSION
   ↓
MUTUAL CONFIRMATION
   ↓
NEXT MILESTONE
   ↓
EXCHANGE COMPLETED
   ↓
RATING & REVIEW
   ↓
TRUST SCORE UPDATE
```

---

# 25. Core Features vs Optional Features

## MVP — Core Features

| Feature | Priority |
|---|---|
| Authentication | High |
| Role-Based Authorization | High |
| User Profile | High |
| Skills Management | High |
| Wanted Skills | High |
| Matching | High |
| Match Score | High |
| Exchange Proposal | High |
| Exchange Agreement | High |
| Milestone | High |
| Session Tracking | High |
| Mutual Confirmation | High |
| Rating & Review | High |
| Trust Score | High |
| Report System | High |
| Admin Dashboard | High |
| User Management | High |
| Dispute Management | High |

---

## Optional Features

- Availability scheduling
- In-app notification
- Portfolio links
- Advanced filtering
- Exchange history analytics

---

## Future Features

- Real-time chat
- Video call
- AI recommendation
- Machine Learning matching
- Mobile application
- Payment system
- Paid mentoring
- Gamification
- Certification
- Advanced verification

---

# 26. MVP Boundaries

Agar project tidak over-scope, MVP **tidak akan memiliki**:

```text id="hqkcdi"
Real-Time Chat
Video Call
Payment Gateway
AI
Machine Learning
Mobile App
Complex Notification System
Public Deployment Requirement
Monetization System
```

Fokus MVP:

> **Membuktikan bahwa sistem skill exchange yang memiliki trust dan fairness mechanism dapat bekerja.**

---

# 27. Key Abuse & Mitigation Matrix

| Abuse / Problem | Solution |
|---|---|
| User menghilang | Trust penalty |
| Salah satu pihak tidak memenuhi kewajiban | Milestone |
| Fake completion | Mutual confirmation |
| Fake rating | Rating setelah completed exchange |
| Fake skill | Experience + Rating + Reputation |
| Repeated cancellation | Trust penalty |
| Harassment | Report + Block |
| User bermasalah berulang kali | Suspension / Ban |
| Konflik exchange | Dispute system |
| Skill duplicate | Admin-managed skill master |

---

# 28. Product Success Criteria

Karena ini adalah portfolio MVP dan belum dipromosikan secara publik, keberhasilan tidak hanya diukur dari jumlah user.

Success criteria:

### Functional

- User dapat register dan login.
- Role authorization berjalan.
- User dapat menambahkan skill.
- Matching menghasilkan kandidat.
- User dapat membuat proposal.
- Exchange dapat dibuat.
- Milestone berjalan dengan benar.
- Session membutuhkan mutual confirmation.
- Rating hanya tersedia setelah exchange selesai.
- Trust Score berubah berdasarkan event tertentu.
- Admin dapat menangani report dan dispute.

### Technical

- Database relationships konsisten.
- Unauthorized access ditolak.
- User tidak dapat mengakses admin resource.
- Duplicate rating dicegah.
- Invalid state transition dicegah.
- Suspended user tidak dapat melakukan aktivitas restricted.

### Portfolio

Kamu dapat menjelaskan:

1. Masalah yang diselesaikan.
2. Kenapa solusi ini dipilih.
3. Kenapa hanya ada dua role.
4. Kenapa Teacher dan Learner bukan role.
5. Cara matching bekerja.
6. Kenapa tidak menggunakan AI/ML.
7. Cara mencegah asymmetric commitment.
8. Cara menghitung Trust Score.
9. Cara database dirancang.
10. Cara authorization bekerja.
11. Trade-off dan limitation sistem.
12. Future improvement.

---

# 29. Future Business Potential

Walaupun belum direalisasikan pada MVP, terdapat beberapa kemungkinan.

## Premium Account

- Advanced matching
- Priority recommendation
- Advanced analytics
- Verified profile

## Paid Mentoring

User dengan reputasi tinggi dapat menawarkan mentoring berbayar.

Platform dapat mengambil commission.

## University Partnership

Universitas dapat menggunakan SkillSwap sebagai:

> Student peer-learning ecosystem.

## Verified Mentor

User dengan track record tertentu dapat memperoleh:

- Verified badge
- Mentor status
- Increased visibility

---

# 30. Future Product Evolution

Roadmap konseptual:

### Phase 1 — Portfolio MVP

```text id="vm4gn7"
Profile
Skills
Matching
Exchange
Milestone
Confirmation
Trust
Admin
```

### Phase 2 — User Experience

```text id="qk4vj2"
Notification
Scheduling
Portfolio
Advanced Discovery
```

### Phase 3 — Intelligent Matching

```text id="xcwwyc"
Exchange History
Behavior Analysis
Recommendation System
AI Matching
```

### Phase 4 — Business

```text id="vwo3kd"
Premium
Paid Mentoring
University Partnership
Verified Mentors
```

---

# 31. Final Product Positioning

SkillSwap bukan sekadar:

> **“Website untuk mahasiswa tukar skill.”**

Positioning yang lebih tepat:

> **A peer-to-peer skill exchange platform designed to help students discover learning partners and exchange knowledge through a structured system that addresses trust, fairness, and commitment challenges.**

---

## Inti dari seluruh project

Menurutku, fondasi project ini dapat diringkas menjadi:

```text id="g63udi"
PROBLEM
Mahasiswa memiliki skill
tetapi sulit menemukan partner
dan tidak ada mekanisme pertukaran yang terpercaya.
        ↓
REASONING
Direct exchange memiliki risiko:
- Ghosting
- Ninja
- Fake skill
- Fake completion
- Cancellation
- Trust issues
        ↓
SOLUTION
Structured Skill Exchange System
        ↓
FEATURES
Matching
Proposal
Agreement
Milestone
Confirmation
Trust Score
Rating
Report
Dispute
Admin Moderation
```

Menurutku, **PRD ini sudah cukup kuat sebagai fondasi utama project**. Langkah berikutnya yang paling logis bukan langsung coding, tetapi kita bisa lanjut membuat **System Requirements Specification (SRS)** atau **Software/System Design**, yang akan menerjemahkan PRD ini menjadi hal yang lebih teknis seperti:

1. **Use Case Diagram**
2. **User Flow Diagram**
3. **Activity Diagram**
4. **ERD / Database Relationship**
5. **Business Rules yang lebih formal**
6. **API Requirements**
7. **Frontend Page Structure**
8. **Backend Architecture**
9. **Authentication & Authorization Flow**
10. **Trust Score Formula yang final**
11. **Matching Algorithm yang final**
12. **MVP Development Roadmap**

Dengan begitu, nanti kamu benar-benar punya alur yang rapi:

> **Idea → PRD → Requirements → System Design → Database → API → UI/UX → Development → Testing → Portfolio Documentation**
