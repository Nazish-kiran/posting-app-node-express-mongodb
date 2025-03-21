import mongoose from "mongoose";
import { type } from "os";
import dotenv from "dotenv";
dotenv.config(); // Load environment variables

// mongoose
//   .connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => {
//     console.log("MongoDB Connected");
//     console.log(process.env.MONGO_URI);
//   })
//   .catch((err) => {
//     console.error("MongoDB connection error:", err);
//   });

const url =
  "mongodb+srv://nazish:admin123@cluster1.9rs1f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1";

mongoose
  .connect(url)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("MongoDB connection error:", err));

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  password: String,
  age: Number,
  email: String,
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
});

export default mongoose.model("User", userSchema);
