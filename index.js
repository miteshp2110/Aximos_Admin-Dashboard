const app = require("./src/app");
const { PORT } = require("./src/config/secrets");

app.listen(PORT,()=>{
    console.log(`Server Running on PORT: ${PORT}`)
}) 