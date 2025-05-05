const multer = require('multer')
const path = require('path')
const fs = require("fs")

const storage = multer.diskStorage({
    destination : (req,res,cb)=>{
        cb(null,"uploads/")
    },
    filename : (req,file,cb)=>{
        const ext = path.extname(file.originalname)
        cb(null,file.fieldname+'-'+Date.now()+ext)
    }
})

const upload = multer({storage})

const handleFileUpload = (req,res,next) =>{
    const singleUpload = upload.single("image")

    singleUpload(req,res,function (err){
        if(err instanceof multer.MulterError){
            return res.status(400).json({error:err.message})
        }
        else if(err){
            return res.status(500).json({error:"Internal Server Error"})
        }
        req.imageName = req.file ? `${req.protocol}://${req.host}/uploads/${req.file.filename}` : null
        next()
    })
    
}
const deleteFile = (fileName)=>{
    const filePath = path.join(__dirname,`../../uploads/${fileName}`)
    fs.unlink(filePath,(err)=>{
        if(err){
            console.error("Failed to delete file")
            console.error(err)
        }
    })
}

module.exports = {handleFileUpload,deleteFile}