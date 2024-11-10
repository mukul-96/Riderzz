// const express = require("express");
// const http = require("http");
// const path = require("path");
// const { Server } = require("socket.io");

// const app = express();
// const server = http.createServer(app);
// const io = new Server(server);

// // Set view engine to EJS
// app.set("view engine", "ejs");

// // Serve static files from the 'public' folder
// app.use(express.static(path.join(__dirname, "public")));

// // Socket.io connection
// io.on("connection", (socket) => {
//     console.log("A user connected:", socket.id);

//     // Handle receiving location data from the client
//     socket.on("send-location", (data) => {
//         io.emit("receive-location", { id: socket.id, ...data });
//     });

//     // Handle user disconnection
//     socket.on("disconnect", () => {
//         io.emit("user-disconnected", socket.id);
//     });
// });

// // Route to render the index page
// app.get("/", (req, res) => {
//     res.render("index");
// });

// // Start the server
// const PORT = 3000;
// server.listen(PORT, () => {
//     console.log(`Server running on http://localhost:${PORT}`);
// });

const express = require("express");
const http = require("http");
const path = require("path");
const socketio = require("socket.io");
const cors = require("cors"); // Import CORS

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
  cors: {
    origin: "*", // Allow your frontend origin
    methods: ["GET", "POST"]
  }
});

// Use CORS middleware
app.use(cors({ origin: "*" }));

app.use(express.static(path.join(__dirname, "../frontend/build")));

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("send-location", (data) => {
    io.emit("receive-location", { id: socket.id, ...data });
  });

  socket.on("disconnect", () => {
    io.emit("user-disconnected", socket.id);
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Fallback for React Router
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
