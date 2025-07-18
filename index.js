app.post("/webhook", async (req, res) => {
  const events = req.body.events;

  for (const event of events) {
    if (event.type === "message" && event.message.type === "text") {
      const userMessage = event.message.text;
      const replyToken = event.replyToken;
      const userId = event.source.userId;

      // キャラ設定コマンドの処理
      if (userMessage.startsWith("キャラ：")) {
        const character = userMessage.replace("キャラ：", "").trim();
        userCharacterMap[userId] = character;
        await replyToUser(
          replyToken,
          `キャラを「${character}」に変更しました！`
        );
        continue;
      }

      const characterPrompt =
        userCharacterMap[userId] ||
        "自然で丁寧な口調で日本語の会話をするAIアシスタント";

      const completion = await openai.createChatCompletion({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: `あなたは「${characterPrompt}」というキャラになりきって会話してください。`,
          },
          { role: "user", content: userMessage },
        ],
      });

      const gptReply = completion.data.choices[0].message.content;

      await replyToUser(replyToken, gptReply);
    }
  }

  res.send("OK");
});
