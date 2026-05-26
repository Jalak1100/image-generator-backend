import dns from 'dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import imageRoutes from './routes/images.js'
import mongoose from 'mongoose';

// Setup for ES Modules to find exact folder paths
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config()

const app = express()
app.use('/uploads', express.static('uploads'));

// Middleware
app.use(cors())
app.use(express.json())

// THIS IS THE MAGIC LINE: It makes your 'uploads' folder public to your React frontend
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =====================================================================
// 🛡️ THE DOWNLOAD PROXY: Bypasses browser CORS for external images
// (We put this BEFORE the other image routes so it doesn't get swallowed)
// We are catching both /api/images and /images just in case your Vite proxy is strict!
// =====================================================================
const downloadHandler = async (req, res) => {
  try {
    const { url, filename } = req.query;

    if (!url) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    // 1. Node.js fetches the image (Node doesn't care about browser CORS rules!)
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    // 2. Convert the image into a raw buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 3. Ensure the filename is safe for Windows/Mac
    const safeFilename = filename ? filename.replace(/[^a-z0-9_.-]/gi, '_') : 'AI_Masterpiece.jpg';

    // 4. Force the browser to download the file instead of opening it
    res.setHeader('Content-Type', response.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);

    // 5. Send the raw file to the user's computer
    res.send(buffer);
  } catch (error) {
    console.error('Download Proxy Error:', error);
    res.status(500).json({ error: 'Failed to proxy image download' });
  }
};

app.get('/api/images/download', downloadHandler);
app.get('/images/download', downloadHandler);
// =====================================================================

// Routes
app.use('/auth', authRoutes)
app.use('/images', imageRoutes)

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' })
})

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ message: 'Internal server error' })
})

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('📦 Successfully connected to MongoDB!'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})