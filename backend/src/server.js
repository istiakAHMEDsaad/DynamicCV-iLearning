import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import attributeRoutes from "./routes/attributeRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import cvRoutes from "./routes/cvRoutes.js";
import discussionRoutes from "./routes/discussionRoutes.js";
import positionRoutes from "./routes/positionRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import { ENV } from "./utils/env.js";
import statsRoutes from "./routes/statsRoutes.js";

const app = express();
const PORT = process.env.PORT || 5000;
app.set("trust proxy", 1);

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://dynamiccvlearningbackend.netlify.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/attributes", attributeRoutes);
app.use("/api/positions", positionRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/cvs", cvRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stats", statsRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    status: "server is running...",
    timestamp: new Date(),
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
