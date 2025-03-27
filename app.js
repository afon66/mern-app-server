import createError from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import fs from 'fs'
import mongoose from 'mongoose';
import router from './routes/index.js'
import dotenv from 'dotenv'
import cors from 'cors'
dotenv.config()

const app = express();
const port = process.env.PORT || 3000
const mongoURI = process.env.MONGO_URI

app.use(cors()) 
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/api', router)
app.use('/uploads', express.static('uploads'))

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected at port ' + port))
  .catch(err => console.error(err));

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads')
}

export default app