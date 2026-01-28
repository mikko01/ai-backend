export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = await new Promise((resolve, reject) => {
      let data = "";
      req.on("data", chunk => (data += chunk));
      req.on("end", () => resolve(JSON.parse(data)));
      req.on("error", err => reject(err));
    });

    const { message } = body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // رد تجريبي مؤقت (نأكد أن كل شيء شغال)
    return res.status(200).json({
      reply: `وصلني سؤالك: ${message}`
    });

  } catch (err) {
    return res.status(500).json({
      error: err.message
    });
  }
}
