# PDF Scraper App

## What You Need to Run the Project

### Prerequisites

- Node.js 20.9+ (Due to Next.js 16)
- PostgreSQL database (via Supabase)
- OpenAI API key
- Supabase account
- Stripe account

### Environment Variables Required

```env
# Database
DATABASE_URL="your-supabase-database-url"
DIRECT_URL="your-supabase-database-url"

# NextAuth
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI (required for resume parsing)
OPENAI_API_KEY="your-openai-api-key-here"

# Supabase (required for image storage)
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_BASIC="price_..."
STRIPE_PRICE_PRO="price_..."
STRIPE_PUBLIC_KEY="pk_test_..."
```

## PDF Processing Pipeline

The application follows a sophisticated pipeline to handle PDF processing:

### 1. Client-Side PDF Conversion

- **Technology**: PDF.js worker (`public/scripts/pdfjs-worker.js`)
- **Process**: PDF pages are converted to images directly in the browser
- **Benefits**: Client-side processing ensures privacy and reduces server load

### 2. Image Upload to Supabase

- **Storage**: Images are uploaded to Supabase Storage bucket (`pdf-scraper`)
- **Security**: Temporary signed URLs (10-minute expiration) are generated
- **Purpose**: Secure access to uploaded images for processing

### 3. Signed URL Generation

- **Method**: Supabase client generates signed URLs with 10-minute expiration
- **Security**: Prevents unauthorized access while allowing temporary processing access
- **Usage**: URLs are used for OpenAI API calls without exposing permanent links

### 4. OpenAI Vision Processing

- **API**: OpenAI GPT-4o vision model
- **Input**: Signed image URLs are sent to OpenAI for structured data extraction
- **Output**: JSON data following the exact schema specified in the assignment

### 5. Database Storage

- **Location**: Extracted resume data stored in Supabase database
- **Structure**: JSON data stored under authenticated user accounts
- **History**: Complete processing history maintained for each user

## Supabase Bucket Configuration

### Creating the Storage Bucket

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Navigate to Storage in your Supabase dashboard
3. Create a new bucket named `pdf-scraper`

### Setting Up Policies

Enable Row Level Security (RLS) in the bucket settings and create the following policies:

#### Policy 1: Public Reading Access

```sql
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'pdf-scraper');
```

#### Policy 2: Public Upload Access

```sql
CREATE POLICY "Public upload access" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'pdf-scraper');
```

## Quick Start

1. Clone the repository:

```bash
git clone <your-github-repo-url>
cd pdf-scraper
```

2. Install dependencies:

```bash
npm install
```

3. Set up Supabase (see bucket configuration above)

4. Configure environment variables in `.env.local`

5. Set up the database:

```bash
npx prisma migrate dev
npx prisma generate
```

6. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.
