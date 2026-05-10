import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import ytdl from "@distube/ytdl-core";
import { ttdl, fbdown } from "btch-downloader";
import multer from "multer";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import { initializeApp } from "firebase/app";
import { getFirestore, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

// Read Firebase config
const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const auth = getAuth(firebaseApp);

const BOT_TOKEN = "8577168806:AAEvPksc7qHSYmr0wzE7DwHQeglzOUZZn5U";
const ADMIN_CHAT_ID = "-1002647379129";

async function authenticateBot() {
  const botEmail = "bot-calloftamim@gmail.com";
  const botPassword = "ComplexPassword123#";
  try {
    await signInWithEmailAndPassword(auth, botEmail, botPassword);
    console.log("Telegram Bot authenticated with Firebase as Admin");
  } catch (err: any) {
    if (err.code === 'auth/user-not-found' || err.message.includes('invalid-credential') || err.code === 'auth/invalid-login-credentials') {
      try {
        await createUserWithEmailAndPassword(auth, botEmail, botPassword);
        console.log("Telegram Bot user created and authenticated");
      } catch (createErr) {
        console.error("Failed to create bot user:", createErr);
      }
    } else {
      console.error("Bot auth error:", err);
    }
  }
}

authenticateBot();

// Telegram Long Polling for inline buttons
async function startTelegramPolling() {
  // First, delete any existing webhook to ensure getUpdates works
  try {
    const dres = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook?drop_pending_updates=true`);
    console.log("deleteWebhook response:", dres.data);
  } catch(e: any) {
    console.log("deleteWebhook failed:", e.message);
  }
  
  // Wait a bit to ensure old long pollings or webhooks from previous hot-reloads get cleaned up
  await new Promise(res => setTimeout(res, 2000));

  let offset = 0;
  console.log("Started Telegram Long Polling...");
  
  while (true) {
    try {
      const response = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates`, {
        params: { offset, timeout: 30 }
      });
      
      const updates = response.data.result;
      for (const update of updates) {
        offset = update.update_id + 1;
        
        if (update.callback_query && update.callback_query.data) {
          const callbackQueryId = update.callback_query.id;
          const data = update.callback_query.data;
          const messageId = update.callback_query.message.message_id;
          
          const [action, postId] = data.split(":");
          
          let alertText = "";
          let nextMarkup = null;
          let newCaption = update.callback_query.message.caption || "";

          try {
            if (action === "approve") {
              await updateDoc(doc(db, "posts", postId), { status: "approved", webhookToken: "7bba23b9f8Xv" });
              alertText = "Post Approved!";
              nextMarkup = { inline_keyboard: [[ { text: "🗑️ Delete Permanently", callback_data: `delete:${postId}` } ]] };
              newCaption += "\n\n✅ Approved and Published";
            } else if (action === "reject") {
              await updateDoc(doc(db, "posts", postId), { status: "rejected", webhookToken: "7bba23b9f8Xv" });
              alertText = "Post Rejected!";
              nextMarkup = { inline_keyboard: [[ { text: "❌ Rejected", callback_data: "none" } ]] };
              newCaption += "\n\n❌ Rejected";
            } else if (action === "delete") {
              await updateDoc(doc(db, "posts", postId), { status: "deleted", webhookToken: "7bba23b9f8Xv" });
              alertText = "Post Deleted!";
              nextMarkup = { inline_keyboard: [[ { text: "🗑️ Deleted", callback_data: "none" } ]] };
              newCaption += "\n\n🔥 Deleted Permanently";
            }

            // Acknowledge callback
            await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
              callback_query_id: callbackQueryId,
              text: alertText
            });

            // Update Telegram message
            if (nextMarkup) {
              const hasMedia = update.callback_query.message.photo || update.callback_query.message.video || update.callback_query.message.document;
              if (hasMedia) {
                await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageCaption`, {
                  chat_id: ADMIN_CHAT_ID,
                  message_id: messageId,
                  caption: newCaption,
                  reply_markup: nextMarkup
                });
              } else {
                const newText = (update.callback_query.message.text || "") + newCaption;
                await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`, {
                  chat_id: ADMIN_CHAT_ID,
                  message_id: messageId,
                  text: newText,
                  reply_markup: nextMarkup,
                  parse_mode: 'Markdown'
                });
              }
            }

          } catch (err: any) {
             console.error("Firestore Update Error:", err);
             // Acknowledge with error
             await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
               callback_query_id: callbackQueryId,
               text: "Error executing action"
             });
          }
        }
      }
    } catch (e: any) {
      if (e.response?.status !== 502 && e.response?.status !== 409) { // suppress typical timeout and conflict errors
        console.error("Polling error:", e.message);
      }
      await new Promise(res => setTimeout(res, 5000));
    }
  }
}

startTelegramPolling();

// In-memory store for pending posts
const pendingPostsMap = new Map<string, any>();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Multer setup for handling file uploads
  const uploadDir = "uploads/";
  if (!fs.existsSync(uploadDir)){
      fs.mkdirSync(uploadDir);
  }
  const upload = multer({ dest: uploadDir });

  // Telegram Report Endpoint
  app.post("/api/telegram/report", async (req, res) => {
    try {
      const { postId, authorName, content, reasonEn, reasonBn, reporterUid, currentReports, hasMedia, mediaUrl, allReasons } = req.body;
      
      const snippet = content ? content.substring(0, 100) : (hasMedia ? 'Media only' : 'No content');
      let text = `🚨 *New Report from Muslim Social* 🚨\n\n` +
          `*Post Author:* ${authorName || 'Unknown'}\n` +
          `*Post ID:* \`${postId}\`\n\n` +
          `*Snippet:* ${snippet}...\n\n` +
          `*New Report Reason:* ${reasonEn} (${reasonBn})\n` +
          `*Reporter UID:* \`${reporterUid}\`\n` +
          `*Total Reports so far:* ${currentReports}\n`;
          
      if (allReasons && Array.isArray(allReasons)) {
          text += `*All Reasons:* ${allReasons.join(', ')}\n\n`;
      } else {
          text += `\n`;
      }

      if (currentReports >= 5) {
          text += `⚠️ *ALERT: This post has reached 5+ reports! Please review or delete it.*`;
      }

      const reply_markup = {
          inline_keyboard: [[
            { text: "🗑️ Action: Delete Post", callback_data: `delete:${postId}` }
          ]]
      };

      await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        chat_id: ADMIN_CHAT_ID,
        text,
        parse_mode: 'Markdown',
        reply_markup
      });

      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("Telegram report error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to send report to Telegram" });
    }
  });

  // Telegram Support Ticket Endpoint
  app.post("/api/telegram/support", async (req, res) => {
    try {
      const { uid, name, email, message, issue, fileUrl } = req.body;
      
      const text = `🛠️ *New Support Appeal* 🛠️\n\n` +
                   `👱‍♂️ *User:* ${name || 'Unknown'} (UID: \`${uid}\`)\n` +
                   `📧 *Email:* ${email || 'N/A'}\n` +
                   `⚠️ *Account Issue:* ${issue || 'Unknown'}\n\n` +
                   `💬 *Message:*\n${message}\n\n` +
                   (fileUrl ? `📎 *Has Attachment:* Yes (See photo)` : `📎 *Has Attachment:* No`) +
                   `\n\n*Admin Dashboard Update Needed:* Go to your Firebase Console or Admin Dashboard to update \`reportsCount\` back to \`0\` or manually change the \`isVerified\` status for this UID.`;

      const ADMIN_CHAT_ID = "-1002347608247"; // using same admin group as report

      if (fileUrl) {
        // Find if fileUrl is proxy
        const fileIdMatch = fileUrl.match(/file\/([A-Za-z0-9_-]+)/);
        let actualFileId = fileIdMatch ? fileIdMatch[1] : null;

        if (actualFileId) {
          try {
             await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendPhoto`, {
               chat_id: ADMIN_CHAT_ID,
               photo: actualFileId,
               caption: text,
               parse_mode: 'Markdown'
             });
             return res.status(200).json({ success: true });
          } catch(e) {}
        }
      }

      await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        chat_id: ADMIN_CHAT_ID,
        text,
        parse_mode: 'Markdown'
      });

      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("Telegram support ticket error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to send support ticket to Telegram" });
    }
  });

  // Telegram API Message Update Endpoint (Called by Admin via frontend URL)
  app.post("/api/telegram/update-message", async (req, res) => {
    try {
      const { messageId, action, postId, appUrl } = req.body;
      
      let reply_markup = {};
      let captionText = "";
      if (action === "approve") {
        reply_markup = {
          inline_keyboard: [[
            { text: "🗑️ Delete Permanently", callback_data: `delete:${postId}` }
          ]]
        };
        captionText = "✅ Approved and Published";
      } else if (action === "reject") {
        reply_markup = {
          inline_keyboard: [[
            { text: "❌ Rejected", callback_data: "none" }
          ]]
        };
        captionText = "❌ Rejected";
      } else if (action === "delete") {
        reply_markup = {
          inline_keyboard: [[
            { text: "🗑️ Deleted", callback_data: "none" }
          ]]
        };
        captionText = "🔥 Deleted Permanently";
      }

      await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageReplyMarkup`, {
        chat_id: ADMIN_CHAT_ID,
        message_id: messageId,
        reply_markup
      });

      // Also try to update caption to append status
      if (captionText) {
         try {
            await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
              chat_id: ADMIN_CHAT_ID,
              reply_to_message_id: messageId,
              text: captionText
            });
         } catch(e) {}
      }

      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("Telegram update message error:", error.response?.data || error.message);
      res.status(500).json({ error: "Failed to update Telegram message" });
    }
  });

  // Telegram Upload Endpoint
  app.post("/api/telegram/upload", upload.single("file"), async (req, res) => {
    console.log("Received Telegram Upload Request");
    try {
      const { type, postId, appUrl, title, authorName, caption, chat_id } = req.body;
      const file = (req as any).file;
      
      if (!file) {
        console.error("Upload Error: No file found in request");
        return res.status(400).json({ error: "No file uploaded" });
      }

      const formData = new FormData();
      formData.append("chat_id", chat_id || ADMIN_CHAT_ID);
      
      const defaultCaption = `New ${type} Post Request:\n\nUser: ${authorName}\nText: ${title}`;
      formData.append("caption", caption || defaultCaption);
      
      formData.append(type === "video" ? "video" : "photo", fs.createReadStream(file.path), {
        filename: file.originalname || (type === "video" ? "video.mp4" : "photo.jpg"),
        contentType: file.mimetype || (type === "video" ? "video/mp4" : "image/jpeg")
      });

      const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/${type === "video" ? "sendVideo" : "sendPhoto"}`;

      let telegramResponse;
      try {
        telegramResponse = await axios.post(telegramUrl, formData, {
          headers: formData.getHeaders(),
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        });
      } catch (axiosError: any) {
        console.error("Telegram API Error Details:", JSON.stringify(axiosError.response?.data || axiosError.message));
        return res.status(500).json({
          error: "Telegram API request failed",
          details: axiosError.response?.data || axiosError.message
        });
      }

      const result = telegramResponse.data.result;
      const messageId = result.message_id;
      
      let fileId = "";
      if (type === "video") {
        fileId = result.video?.file_id;
      } else {
        fileId = result.photo && result.photo.length > 0 ? result.photo[result.photo.length - 1].file_id : "";
      }
      
      // Update with Inline Keyboard pointing to App URLs ONLY if it's a post (has postId)
      if (postId) {
        await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/editMessageReplyMarkup`, {
          chat_id: chat_id || ADMIN_CHAT_ID,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [[
              { text: "✅ Approve", callback_data: `approve:${postId}` },
              { text: "❌ Reject", callback_data: `reject:${postId}` }
            ]]
          }
        });
      }

      try {
        fs.unlinkSync(file.path);
      } catch (e) {}

      res.json({ success: true, fileId, fileUrl: `/api/telegram/file/${fileId}` });
    } catch (error: any) {
      console.error("Telegram upload error:", error);
      res.status(500).json({ 
        error: "Failed to upload to Telegram",
        details: error.message 
      });
    }
  });


  // Audio Proxy Route for generic files (like Quran audio)
  app.get("/api/proxy/audio", async (req, res) => {
    try {
      const audioUrl = req.query.url as string;
      if (!audioUrl) {
        return res.status(400).json({ error: "Missing url parameter" });
      }
      
      const response = await axios({
        method: 'get',
        url: audioUrl,
        responseType: 'stream',
      });
      
      // Pass correct content type
      const contentType = response.headers['content-type'];
      res.setHeader('Content-Type', typeof contentType === 'string' ? contentType : 'audio/mpeg');
      res.setHeader('Content-Disposition', `attachment; filename="audio.mp3"`);
      
      // Pipe the data to the client
      response.data.pipe(res);
    } catch (error: any) {
      console.error("Proxy error:", error.message);
      res.status(500).json({ error: "Proxy streaming failed" });
    }
  });

  // Media Proxy Route to fetch files from Telegram
  app.get("/api/telegram/file/:fileId", async (req, res) => {
    try {
      const { fileId } = req.params;
      const botToken = "8577168806:AAEvPksc7qHSYmr0wzE7DwHQeglzOUZZn5U";
      
      const pathResponse = await axios.get(`https://api.telegram.org/bot${botToken}/getFile?file_id=${fileId}`);
      const filePath = pathResponse.data.result?.file_path;
      
      if (!filePath) {
        return res.status(404).json({ error: "File not found in Telegram" });
      }

      const fileUrl = `https://api.telegram.org/file/bot${botToken}/${filePath}`;
      
      const headers: any = {};
      if (req.headers.range) {
          headers['Range'] = req.headers.range;
      }

      const fileResponse = await axios.get(fileUrl, { 
          responseType: "stream",
          headers: headers,
          validateStatus: (status) => status < 500
      });

      // Forward headers to the client
      const headersToForward = ['content-type', 'content-length', 'accept-ranges', 'content-range'];
      headersToForward.forEach(header => {
          if (fileResponse.headers[header]) {
              res.setHeader(header, fileResponse.headers[header]);
          }
      });

      res.status(fileResponse.status);
      fileResponse.data.pipe(res);
    } catch (error: any) {
      console.error("Media Proxy Error:", error.message);
      res.status(500).json({ error: "Failed to fetch media from Telegram" });
    }
  });

  app.post("/api/download/youtube", async (req, res) => {
    try {
      const { url } = req.body;
      if (!ytdl.validateURL(url)) {
        return res.status(400).json({ error: "Invalid YouTube URL" });
      }

      const info = await ytdl.getInfo(url);
      const title = info.videoDetails.title;
      const formats = ytdl.filterFormats(info.formats, "videoandaudio").map((format) => ({
        quality: format.qualityLabel || "Auto",
        ext: format.container,
        url: format.url,
      }));

      // Add audio-only option
      const audioFormats = ytdl.filterFormats(info.formats, "audioonly").map((format) => ({
        quality: "Audio Only",
        ext: format.container,
        url: format.url,
      }));

      res.json({
        title,
        formats: [...formats, ...audioFormats],
      });
    } catch (error) {
      console.error("YouTube download error:", error);
      res.status(500).json({ error: "Failed to fetch video details" });
    }
  });

  app.post("/api/download/social", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (url.includes('tiktok.com')) {
        const result = await ttdl(url);
        if (result && result.status) {
          const formats = [];
          if (result.video && result.video.length > 0) {
            formats.push({ quality: "Watermark Free", ext: "mp4", url: result.video[0] });
          }
          if (result.audio && result.audio.length > 0) {
            formats.push({ quality: "Audio Only", ext: "mp3", url: result.audio[0] });
          }
          return res.json({ title: result.title || "TikTok Video", formats });
        }
      } else if (url.includes('facebook.com') || url.includes('fb.watch') || url.includes('fb.gg')) {
        const result = await fbdown(url);
        if (result && result.status) {
          const formats = [];
          if (result.HD) formats.push({ quality: "HD", ext: "mp4", url: result.HD });
          if (result.Normal_video) formats.push({ quality: "SD", ext: "mp4", url: result.Normal_video });
          
          if (formats.length > 0) {
            return res.json({ title: "Facebook Video", formats });
          }
        }
      }
      
      res.status(404).json({ error: "Could not fetch video details from this URL" });
    } catch (error) {
      console.error("Social download error:", error);
      res.status(500).json({ error: "Failed to fetch video details" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // ESM workaround for __dirname
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", async () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
