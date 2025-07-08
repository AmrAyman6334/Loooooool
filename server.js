const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const app = express();

app.use(cors());

const CLIENT_ID = "1382655315820150794";
const CLIENT_SECRET = "HHIgAymFEl0kbvnpQ7q35k9ptxVKuImf";
const REDIRECT_URI = "https://amrbot-auth-production.up.railway.app/callback"; // ← هيتغير بعد الرفع الحقيقي

app.get("/", (req, res) => {
  res.send("✅ AmrBot OAuth شغال");
});

app.get("/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).json({ error: "Missing code" });

  try {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: REDIRECT_URI,
      scope: "identify"
    });

    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
    });

    const tokenData = await tokenResponse.json();
    if (!tokenData.access_token) return res.status(500).json({ error: "Token exchange failed" });

    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    });

    const userData = await userResponse.json();
    const avatar = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=256`;

    res.json({
      id: userData.id,
      username: userData.username,
      discriminator: userData.discriminator,
      avatar: avatar
    });

  } catch (err) {
    res.status(500).json({ error: "Something went wrong", details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("✅ السيرفر شغال على بورت", PORT));