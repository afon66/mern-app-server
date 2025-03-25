import multer from 'multer'

const destination = 'uploads'

const storage = multer.diskStorage({
  destination,
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})

const uploads = multer({ storage })

export default uploads 