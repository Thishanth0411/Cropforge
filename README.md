# CropForge — MERN Stack

Professional image cropping tool built with MongoDB, Express, React, and Node.js.

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)

### 1. Clone & Install

```bash
# Install all dependencies (root + server + client)
npm run install-all
```

### 2. Configure Environment

Edit `server/.env`:

```env
MONGO_URI=mongodb://localhost:27017/cropforge
JWT_SECRET=change_this_to_a_long_random_string
PORT=5000
```

If using MongoDB Atlas, replace MONGO_URI with your connection string.

### 3. Run Development

```bash
npm run dev
```

This starts:
- **Backend** → http://localhost:5000
- **Frontend** → http://localhost:3000

---

## 🗂 Project Structure

```
cropforge/
├── server/
│   ├── index.js              # Express entry point
│   ├── .env                  # Environment variables
│   ├── models/
│   │   ├── User.js           # User schema (auth)
│   │   ├── Image.js          # Uploaded image metadata
│   │   └── Crop.js           # Crop history
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── imageController.js
│   │   └── cropController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── images.js
│   │   └── crops.js
│   ├── middleware/
│   │   ├── auth.js           # JWT protect middleware
│   │   └── upload.js         # Multer config
│   └── uploads/
│       ├── originals/        # Uploaded source images
│       └── crops/            # Generated crop files
│
└── client/
    └── src/
        ├── App.js            # Routes
        ├── App.css           # Global styles
        ├── context/
        │   └── AuthContext.js
        └── pages/
            ├── LoginPage.js
            ├── RegisterPage.js
            ├── EditorPage.js   # Main crop editor
            └── HistoryPage.js  # Crop history
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET  | `/api/auth/me` | Get current user |

### Images
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/images/upload` | Upload images (multipart) |
| GET  | `/api/images` | List user's images |
| DELETE | `/api/images/:id` | Delete image |

### Crops
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/crops` | Crop a single image |
| POST | `/api/crops/bulk` | Bulk crop multiple images |
| GET  | `/api/crops` | Get crop history |
| GET  | `/api/crops/download/:id` | Download a cropped file |
| DELETE | `/api/crops/:id` | Delete crop record |

---

## 🚀 Production Deployment (Render.com — Free)

### Backend
1. Push code to GitHub
2. New Web Service → connect repo
3. Root Directory: `server`
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Add environment variables from `.env`

### Frontend
1. New Static Site → connect repo
2. Root Directory: `client`
3. Build Command: `npm run build`
4. Publish Directory: `client/build`
5. Add env variable: `REACT_APP_API_URL=https://your-backend.onrender.com`

---

## 🖼 Print Size Presets

| Size | Ratio | Output @ 300 DPI |
|------|-------|-----------------|
| 4×6" | 2:3 | 1200×1800 px |
| 5×7" | 5:7 | 1500×2100 px |
| 8×10" | 4:5 | 2400×3000 px |
| 12×18" | 2:3 | 3600×5400 px |
| 16×24" | 2:3 | 4800×7200 px |
| 20×30" | 2:3 | 6000×9000 px |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **M** | MongoDB + Mongoose |
| **E** | Express.js |
| **R** | React 18 + React Router |
| **N** | Node.js 18+ |
| Image Processing | Sharp (Lanczos3 resampling) |
| Auth | JWT + bcrypt |
| File Upload | Multer |
| UI State | React Context + Hooks |
