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

## Stripe Setup (Test Mode)

### 1. Create a Stripe Test Account

1. Go to [stripe.com](https://stripe.com) and create a new account
2. Switch to **Test Mode** in the dashboard (toggle in the top right)
3. Note: All operations must remain in test mode - no live transactions

### 2. Get API Keys

- Navigate to **Developers > API keys** in your Stripe dashboard
- Copy your **Publishable key** (starts with `pk_test_`)
- Copy your **Secret key** (starts with `sk_test_`)

### 3. Create Products and Prices

1. Go to **Products** in your Stripe dashboard
2. Create two products:

   **Basic Plan**

   - Name: "Basic Plan"
   - Price: $10/month
   - Description: "Default entry plan"

   **Pro Plan**

   - Name: "Pro Plan"
   - Price: $20/month
   - Description: "Higher limit for advanced users"

3. Note the Price IDs (start with `price_`) for each plan

### 4. Set Up Webhooks

1. Go to **Developers > Webhooks**
2. Add endpoint: `https://your-domain.com/api/webhooks/stripe`
3. Select events:
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the **Webhook signing secret** (starts with `whsec_`)

### 5. Environment Variables

Add these to your `.env.example` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY="sk_test_your_secret_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
STRIPE_PRICE_BASIC="price_your_basic_price_id"
STRIPE_PRICE_PRO="price_your_pro_price_id"
STRIPE_PUBLIC_KEY="pk_test_your_publishable_key_here"
```

## Subscription and Upgrade Instructions

### Credit System Overview

- **Cost per resume**: 100 credits
- **Basic Plan**: 10,000 credits ($10/month)
- **Pro Plan**: 20,000 credits ($20/month)

### For Users

1. **Free (Initial)**: New users start with 0 credits
2. **Subscribe**: Go to `/dashboard/settings` and click "Subscribe to Basic Plan"
3. **Upgrade**: Click "Upgrade to Pro Plan" to get 20,000 credits
4. **Manage Billing**: Use "Manage Billing" to access Stripe Customer Portal

### For Developers

- Credits are automatically added when subscriptions are created/renewed
- Webhooks handle real-time credit updates
- All subscription events are logged for debugging

## Credit Consumption During PDF Scraping

### How Credits Work

Every time a user uploads and processes a resume, the system:

1. **Pre-Check**: Verifies user has ≥100 credits before starting OpenAI processing
2. **Processing**: Calls OpenAI API and extracts structured data
3. **Deduction**: Subtracts exactly 100 credits from user's balance
4. **Storage**: Saves extracted JSON data to database

### Insufficient Credits Flow

If a user has fewer than 100 credits:

- Upload is blocked with friendly error message
- Toast notification suggests upgrading subscription
- Redirect to settings page offered

### Credit Balance Display

- Real-time credit balance shown in dashboard header
- Settings page shows current plan and remaining credits
- Automatic credit top-ups on subscription renewal

### Example Usage

```
User uploads resume (500KB PDF)
→ System checks: 200 credits available ✓
→ PDF converted to images via PDF.js
→ Images uploaded to Supabase storage
→ Signed URLs generated (10min expiry)
→ OpenAI processes images → structured JSON
→ 100 credits deducted (200 → 100 remaining)
→ Resume data stored in database
→ Success toast + history updated
```
