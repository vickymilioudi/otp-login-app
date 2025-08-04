import express from 'express';

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to OTP Login App." });
});

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: "Something broke!" });
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});