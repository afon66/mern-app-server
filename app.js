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

// app.use(logger('dev'));
app.use(cors())
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use('/api', router)
app.use('/uploads', express.static('uploads'))
// app.use(cookieParser());
// app.set('view engine', 'jade');

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected at port ' + port))
  .catch(err => console.error(err));


if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads')
}

// catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function (err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

export default app
