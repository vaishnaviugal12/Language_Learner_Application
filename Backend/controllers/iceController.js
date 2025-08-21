// controllers/iceController.js
import twilio from "twilio";

export const getIceServers = async (req, res) => {
  // If Twilio credentials present in env, request ICE servers
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
    try {
      const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
      // Twilio's tokens API provides iceServers via client.tokens.create()
      const tokenResponse = await client.tokens.create();
      // tokenResponse.iceServers is expected
      return res.json({ iceServers: tokenResponse.iceServers || [] });
    } catch (err) {
      console.warn("Twilio ICE servers error:", err.message);
      // fall through to fallback
    }
  }

  // Fallback: public STUN only (development)
  return res.json({
    iceServers: [
      { urls: ["stun:stun.l.google.com:19302"] },
      { urls: ["stun:stun1.l.google.com:19302"] }
    ]
  });
};
