const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

const LINE_CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  const events = req.body.events;

  for (const event of events) {
    if (event.type === "message" && event.message.type === "text") {
      const userMessage = event.message.text;
      const replyToken = event.replyToken;

      // GPTの返答を取得
      const chatGPTReply = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo", // 無料枠で使いたい場合
          messages: [
            { role: "system", content: "あなたは親切なアシスタントです。" },
            { role: "user", content: userMessage },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      const replyText = chatGPTReply.data.choices[0].message.content;

      // LINEに返信
      await axios.post(
        "https://api.line.me/v2/bot/message/reply",
        {
          replyToken: replyToken,
          messages: [{ type: "text", text: replyText }],
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${LINE_CHANNEL_ACCESS_TOKEN}`,
          },
        }
      );
    }
  }

  res.send("OK");
});

app.listen(port, () => {
  console.log(`🚀 サーバー起動！http://localhost:${port}`);
});
