# Smart E-Commerce Management System

Enterprise-grade E-Commerce storefront and administrative management application built with **React**, **TypeScript**, **Tailwind CSS**, **Express.js**, **Prisma ORM**, and **PostgreSQL (Supabase)**.

---

## 🚀 Features & Architecture

- **Full-Stack Application**: Node.js + Express backend powering Vite React SPA.
- **Database & ORM**: PostgreSQL database powered by Supabase with connection pooling (`PgBouncer`) and Prisma ORM.
- **Local & Cloud Sync**: Firebase Auth & Firestore support alongside PostgreSQL.
- **Bangladeshi Payment Gateways**: bKash, SSLCommerz, Nagad, Rocket, and Cash On Delivery (COD).
- **Communication Gateways**: Email Dispatch (Brevo / SendGrid / Custom SMTP) and SMS Notifications (BulkSMS BD / Twilio).
- **AI Shopping Assistant**: Server-side Gemini AI integration for intelligent customer recommendations.
- **Document & Printing Engine**: Built-in PDF generator and printer for invoices, packing slips, barcode labels, and sales reports.

---

## 🛠️ Environment Variables Configuration

Create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

### 1. PostgreSQL & Prisma Setup (Supabase)
Obtain your connection strings from your Supabase Project Settings -> Database:

```env
# Connect to Postgres via the transaction pooler (port 6543 for PgBouncer)
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Connect to Postgres directly (port 5432 for migrations and schema pushes)
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres"
```

### 2. Gemini AI Assistant
```env
GEMINI_API_KEY="your-gemini-api-key"
```

### 3. Email Gateway (Brevo / SendGrid / SMTP)
```env
BREVO_API_KEY="xsmtpsib-your-brevo-api-key"
SMTP_HOST="smtp-relay.brevo.com"
SMTP_PORT="587"
SMTP_USER="your-brevo-smtp-username"
SMTP_PASS="your-brevo-smtp-password"
EMAIL_FROM="sabbircse72@gmail.com"
```

### 4. Payment Gateways (bKash, SSLCommerz, Nagad)
```env
BKASH_APP_KEY="your-bkash-app-key"
BKASH_APP_SECRET="your-bkash-app-secret"
BKASH_USERNAME="your-bkash-username"
BKASH_PASSWORD="your-bkash-password"
BKASH_IS_SANDBOX="true"

SSLCOMMERZ_STORE_ID="your-store-id"
SSLCOMMERZ_STORE_PASSWORD="your-store-password"
SSLCOMMERZ_IS_SANDBOX="true"

NAGAD_MERCHANT_ID="your-nagad-merchant-id"
NAGAD_PUBLIC_KEY="your-nagad-public-key"
NAGAD_PRIVATE_KEY="your-nagad-private-key"
NAGAD_IS_SANDBOX="true"
```

---

## 🗄️ Database Setup & Migrations (Prisma)

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

3. **Push Database Schema to Supabase**:
   ```bash
   npx prisma db push
   ```

4. **Verify Database Connection**:
   Boot the server and check the health endpoint:
   ```bash
   curl http://localhost:3000/api/db/status
   ```
   Expected response:
   ```json
   {
     "status": "connected",
     "database": "PostgreSQL (Supabase)",
     "connected": true
   }
   ```

---

## 💻 Local Development

Run the development server (bootstrapped with `tsx` and Express + Vite):

```bash
npm run dev
```

The application will be accessible at `http://localhost:3000`.

---

## 📦 Building & Production Deployment

### Build the Project
```bash
npm run build
```
This compiles the Vite React frontend into `dist/` and bundles `server.ts` into `dist/server.cjs` via `esbuild`.

### Start Production Server
```bash
npm run start
```

---

## ☁️ Deployment Instructions

### Deploying to Render / Railway / Cloud Run / VPS (Recommended for Full-Stack Node Apps)
Since this app runs a custom Node.js Express server (`server.ts`) alongside static files:

1. **Build Command**: `npm run build`
2. **Start Command**: `npm run start` (or `node dist/server.cjs`)
3. **Environment Variables**: Add all variables from `.env` in the dashboard settings.
4. **Port**: Set `PORT=3000`.

### Deploying Frontend to Vercel / Netlify
If deploying as a decoupled frontend:
- Ensure API requests point to your deployed Express backend URL.
- Set **Build Command**: `npm run build`
- Set **Output Directory**: `dist`

---

## 🛡️ License & Maintenance

Designed for enterprise-scale e-commerce operations in Bangladesh and globally.
