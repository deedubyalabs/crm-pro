import { ZepClient } from "@getzep/zep-cloud";

const ZEP_API_URL = process.env.ZEP_API_URL || "http://localhost:8000";
const ZEP_API_KEY = process.env.ZEP_API_KEY || "YOUR_ZEP_API_KEY"; // Replace with your actual Zep API Key

const zepClient = new ZepClient({
  apiKey: ZEP_API_KEY,
});

export default zepClient;
