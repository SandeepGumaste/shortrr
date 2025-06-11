# shortrr - URL Shortener

A modern, fast, and secure URL shortening service built with Next.js 14 and MongoDB.

## ✨ Features

- 🚀 Lightning-fast URL shortening
- 🎨 Modern UI with smooth animations
- 📱 Responsive design for all devices
- 🔒 Secure authentication with Google
- 📊 Detailed analytics for each shortened URL
- 📱 QR code generation
- 🔍 Custom short URLs (coming soon)
- 🌐 API access for developers

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Database:** MongoDB
- **Authentication:** NextAuth.js
- **Deployment:** Vercel
- **Analytics:** Custom implementation
- **QR Code:** qrcode.js

## 🚀 Getting Started

### Prerequisites

- Node.js v22.14
- MongoDB database
- Google OAuth credentials

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/shortrr.git
   cd shortrr
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # MongoDB
   MONGODB_URI=your_mongodb_connection_string
   
   # NextAuth
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   
   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📝 Usage

### Authentication

1. Click the "Sign In" button
2. Choose your Google account
3. Grant necessary permissions

### Shortening URLs

1. Enter the URL you want to shorten
2. Click "Shorten URL"
3. Copy the generated short URL
4. Optionally generate a QR code

### Analytics

1. Access your dashboard
2. View detailed analytics for each shortened URL:
   - Total visits
   - Visit history
   - Geographic data
   - Device information

## 🔌 API Routes

### Create Short URL
```http
POST /api/url
Content-Type: application/json

{
  "redirectUrl": "https://example.com"
}
```

### Get URL Analytics
```http
GET /api/url/analytics/{shortId}
Authorization: Bearer {token}
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/)
- [MongoDB](https://www.mongodb.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)

## 📞 Support

For support, email sandeepgumaste10@gmail.com 

---

Built with ❤️ by Sandeep Gumaste
