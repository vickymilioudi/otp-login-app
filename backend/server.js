import express from 'express';
import userRoutes from './routes/user.routes.js';

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Welcome to OTP Login App." });
});

app.use('/api/auth', userRoutes);

app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).json({ error: "Something broke!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port: ${PORT}`));