import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini AI endpoint for Dinsos Service Assistance
  app.post("/api/ai/service-info", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ 
          error: "GEMINI_API_KEY is not configured",
          fallbackResponse: "Kunci API Gemini belum terkonfigurasi. Silakan pastikan dokumen persyaratan standar seperti Fotokopi KTP, KK, dan Surat Pengantar Kelurahan sudah disiapkan."
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Anda adalah Asisten Resmi Informasi Sentra Pelayanan Kito Dinas Sosial Kota Tanjungbalai, Sumatera Utara.
Tugas Anda adalah memberikan penjelasan yang ramah, sopan, jelas, dan akurat mengenai persyaratan dokumen, alur pelayanan, dan informasi bansos/layanan di Dinas Sosial Kota Tanjungbalai.

Pertanyaan Pengunjung/Petugas: "${query}"

Berikan jawaban singkat, terstruktur dengan poin-poin (bullet points), dan mudah dipahami oleh masyarakat umum maupun kelompok rentan (lansia, disabilitas, ibu hamil). Tekankan bahwa semua pelayanan di Sentra Pelayanan Kito Dinas Sosial Kota Tanjungbalai adalah GRATIS.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      const text = response.text || "Maaf, informasi tidak dapat dimuat saat ini.";
      return res.json({ result: text });
    } catch (error: any) {
      console.error("Error calling Gemini API:", error);
      return res.status(500).json({ 
        error: error.message || "Failed to generate AI response",
        fallbackResponse: "Terjadi kendala saat menghubungi asisten AI. Persyaratan umum layanan Dinsos meliputi: KTP Tanjungbalai, Kartu Keluarga (KK), Surat Keterangan Tidak Mampu (SKTM) dari Kelurahan, dan berkas pendukung sesuai jenis permohonan." 
      });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", app: "Antrean Sentra Pelayanan Kito - Dinsos Tanjungbalai" });
  });

  // Vite middleware for development vs static build for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
