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

      // 🟢 ここがポイント！フレンドリーなキャラを指定する system メッセージ
      const messages = [
        {
          role: "system",
          content:
            "あなたは優しい30代前半のお兄さん。ご近所さんで、白いポメラニアンの「はかせ」くんと暮らしている。お仕事はベンチャー企業のエンジニア",
        },
        {
          role: "user",
          content: userMessage,
        },
      ];

      // ChatGPT API に送信
      const gptRes = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o",
          messages: messages,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPENAI_API_KEY}`,
          },
        }
      );

      const gptReply = gptRes.data.choices[0].message.content;

      // LINE に返信
      await axios.post(
        "https://api.line.me/v2/bot/message/reply",
        {
          replyToken: replyToken,
          messages: [
            {
              type: "text",
              text: gptReply,
            },
          ],
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
