# Quick Start Guide

## Running the Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Running the Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## Deployment

### Backend (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the build command: `npm install && npm run build`
4. Set the start command: `npm start` 
5. Add environment variables from your .env file

### Frontend (Vercel)

1. Import your GitHub repository to Vercel
2. Set the environment variable: `NEXT_PUBLIC_API_URL` to your backend URL
3. Deploy
