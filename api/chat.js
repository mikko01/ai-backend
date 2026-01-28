export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    let body = req.body;

    // 🧠 إذا لم يتم解析 body تلقائيًا
    if (!body) {
      let rawBody = "";
      await new Promise((resolve) => {
        req.on("data", (chunk) => {
          rawBody += chunk;
        });
        req.on("end", resolve);
      });

      // محاولة解析 JSON
      try {
        body = JSON.parse(rawBody);
      } catch {
        return res.status(400).json({
          error: "Body ليس JSON صالح"
        });
      }
    }

    const message = body.message;

    if (!message) {
      return res.status(400).json({
        error: "الرجاء إرسال message"
      });
    }

    // 🔥 استدعاء OpenAI
    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "أجب بالعربية الفصحى بأسلوب حكيم ومختصر."
            },
            {
              role: "user",
              content: message
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({
        error: "لم يصل رد من OpenAI",
        raw: data
      });
    }

    return res.status(200).json({
      reply: data.choices[0].message.content
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
