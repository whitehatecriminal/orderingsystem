import mongoose from "mongoose";

//connecting database
mongoose.connect(process.env.MONGO_URI)
.then(()=> console.log('Database connected'))