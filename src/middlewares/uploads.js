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


const handleMultipleUpload = (req, res, next) => {
    // Change from single upload to multiple uploads, specifying field names
    const multipleUpload = upload.fields([
        { name: 'large', maxCount: 1 },
        { name: 'small', maxCount: 1 }
    ]);

    multipleUpload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: err.message });
        }
        else if (err) {
            return res.status(500).json({ error: "Internal Server Error" });
        }

        // Get the file paths for both large and small images if they exist
        req.largeImage = req.files && req.files.large && req.files.large[0] 
            ? `${req.protocol}://${req.host}/uploads/${req.files.large[0].filename}` 
            : null;
            
        req.smallImage = req.files && req.files.small && req.files.small[0] 
            ? `${req.protocol}://${req.host}/uploads/${req.files.small[0].filename}` 
            : null;
            
        next();
    });
};
const deleteFile = (fileName)=>{
    const filePath = path.join(__dirname,`../../uploads/${fileName}`)
    fs.unlink(filePath,(err)=>{
        if(err){
            console.error("Failed to delete file")
            console.error(err)
        }
    })
}

module.exports = {handleFileUpload,deleteFile,handleMultipleUpload}