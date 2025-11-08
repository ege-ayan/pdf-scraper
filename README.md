# PDF Scraper - Resume Parser

A Next.js application that uses AI to parse resume PDFs and extract structured data. Features authentication, PDF upload with drag-and-drop, and OpenAI-powered resume parsing.

## Features

- 🔐 **Authentication**: NextAuth.js with credentials provider
- 📄 **PDF Processing**: Client-side PDF to image conversion using PDF.js
- 🗄️ **Image Storage**: Supabase Storage for secure image hosting
- 🤖 **AI Parsing**: OpenAI GPT-4o-mini for structured resume data extraction
- 🎨 **Modern UI**: Built with shadcn/ui and Tailwind CSS
- 📱 **Responsive**: Works on all devices
- ⚡ **Performance**: Tanstack Query for state management

## Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript
- **UI**: shadcn/ui, Tailwind CSS, Lucide Icons
- **Authentication**: NextAuth.js
- **Database**: Prisma + PostgreSQL
- **Storage**: Supabase Storage
- **State Management**: Tanstack Query (React Query)
- **PDF Processing**: PDF.js
- **AI**: OpenAI API
- **Forms**: React Hook Form + Zod validation

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenAI API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/pdf-scraper.git
cd pdf-scraper
```

2. Install dependencies:

```bash
npm install
```

3. Set up Supabase:

   - Create a new project at [supabase.com](https://supabase.com)
   - Create a storage bucket called `pdf-scraper`
   - Set bucket to public access

4. Set up environment variables in `.env.local`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/pdfscraper"
DIRECT_URL="postgresql://username:password@localhost:5432/pdfscraper"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI (required for resume parsing)
OPENAI_API_KEY="your-openai-api-key-here"

# Supabase (required for image storage)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
```

6. Set up the database:

```bash
npx prisma migrate dev
npx prisma generate
```

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Usage

1. **Register/Login**: Create an account or sign in
2. **Upload Resume**: Drag and drop a PDF file (max 10MB) on the dashboard
3. **AI Processing**: The app converts PDF to images and sends to OpenAI
4. **View Results**: Extracted resume data is logged to the browser console

## Resume Schema

The AI extracts resume data following this exact JSON schema:

```json
{
  "profile": {
    "name": "string",
    "surname": "string",
    "email": "string",
    "headline": "string",
    "professionalSummary": "string",
    "linkedIn": "string?",
    "website": "string?",
    "country": "string",
    "city": "string",
    "relocation": "boolean",
    "remote": "boolean"
  },
  "workExperiences": [...],
  "educations": [...],
  "skills": ["string"],
  "licenses": [...],
  "languages": [...],
  "achievements": [...],
  "publications": [...],
  "honors": [...]
}
```

See `lib/schemas.ts` for the complete TypeScript schema with enums and validation rules.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
