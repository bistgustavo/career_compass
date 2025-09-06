import express, { urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

//common middleware
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// All the routes
import userRoutes from "./routes/user.routes.js";
import courseRoutes from "./routes/course.routes.js";
import collegeRoutes from "./routes/college.routes.js";
import markRoutes from "./routes/mark.routes.js";

app.use("/api/users", userRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/colleges", collegeRoutes);
app.use("/api/marks", markRoutes);

// Error handling middleware should be last
app.use(errorHandler);

export { app };
