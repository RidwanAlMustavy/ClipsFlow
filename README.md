# ClipFlow

![ClipFlow Banner](https://picsum.photos/1200/400?random=1) <!-- You can replace this with an actual screenshot or banner -->

ClipFlow is a modern, multi-tenant B2B content approval platform designed specifically for video agencies. It bridges the gap between agencies generating high-quality video content (like TikToks, Reels, and LinkedIn clips) and clients who need a seamless, professional interface to review, provide feedback, and approve their content.

## ✨ Features

- **Multi-Tenant Architecture:** Secure spaces tailored for both Agency Admins and individual Clients.
- **Automated Video Workflows:** Seamlessly process source assets (YouTube links or direct file uploads) and generate platform-specific clips.
- **Interactive Review System:** Clients can watch generated clips, leave timestamps, add comments, and approve or request revisions instantly.
- **Content Calendar:** Keep track of scheduled and published content with an intuitive, date-based calendar view.
- **Real-Time Database Sync:** Any edits to metadata, clip titles, or status updates are reflected immediately across the platform.
- **Beautiful UI:** Built with Tailwind CSS and Next.js, featuring dark mode, glassmorphism, and responsive design.

## 🛠 Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database:** [Prisma ORM](https://www.prisma.io/) + PostgreSQL / SQLite
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **Icons:** [Lucide React](https://lucide.dev/)

## 🚀 Getting Started

### Prerequisites

Make sure you have Node.js (v18+) and npm installed.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/ClipFlow.git
   cd ClipFlow
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root and add the required variables (e.g., Database URL, NextAuth Secret).
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_SECRET="your-super-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   ```

4. **Initialize the database:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## 🤝 Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request if you'd like to improve ClipFlow.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
