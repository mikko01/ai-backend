export default async function handler(req, res) {
  // السماح فقط بـ POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // قراءة الرسالة من body
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "الرجاء إرسال message داخل body"
      });
    }

    // استدعاء OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
            content: "أجب باللغة العربية الفصحى، بأسلوب حكيم، واضح ومختصر."
          },
          {
            role: "user",
            content: message
          }
        ]
      })
    });

    const data = await response.json();

    // التحقق من وجود رد
    if (!data.choices || !data.choices[0]) {
      return res.status(500).json({
        error: "لم يتم استلام رد من النموذج",
        raw: data
      });
    }

    // إرسال الرد النهائي
    return res.status(200).json({
      reply: data.choices[0].message.content
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
