const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

// ← LINEチャネルアクセストークンをここに貼る
const LINE_CHANNEL_ACCESS_TOKEN =
  "BoEKmG77d47KaMw7/NhJ+lKkdrAj+bmmunZyXQzDfM5UpIEjgaormsVJ8G5sPtFyRqlz4+UD31IEOK1F82mtHNNdRRcIRIe6VE5I9mgBLm3v/9/5YBcdz/UXXIItNTaQk67v5uQn3uDsiixxHXQ4BwdB04t89/1O/w1cDnyilFU=";

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post("/webhook", async (req, res) => {
  const events = req.body.events;

  for (const event of events) {
    if (event.type === "message" && event.message.type === "text") {
      const userMessage = event.message.text;
      const replyToken = event.replyToken;

      await axios.post(
        "https://api.line.me/v2/bot/message/reply",
        {
          replyToken: replyToken,
          messages: [
            {
              type: "text",
              text: `あなたは「${userMessage}」といいましたね！`,
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
