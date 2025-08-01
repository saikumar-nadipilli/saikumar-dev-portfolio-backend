require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { sendContactEmail } = require("./api/handlers/emailHandler");

const app = express();
const port = process.env.PORT || 3001;

// Middleware
console.log("Frontend URL:", process.env.FRONTEND_URL);

const allowedOrigins = [
  "http://localhost:5173",
  "https://saikumar-dev-portfolio-frontend.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean); // removes undefined/null

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests like Postman or curl with no origin
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS: " + origin));
      }
    },
  })
);
app.use(bodyParser.json());

// POST /api/contact route
app.post("/api/contact", async (req, res) => {
  try {
    // Convert req to event-like object expected by your lambda-style handler
    const event = {
      body: JSON.stringify(req.body),
    };

    const response = await sendContactEmail(event);

    res.status(response.statusCode).json(JSON.parse(response.body));
  } catch (error) {
    console.error("Error in /api/contact:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Health check (optional)
app.get("/", (req, res) => {
  res.send("Contact API is running");
});

// Start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
