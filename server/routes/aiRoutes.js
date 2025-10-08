import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

router.post("/summarize", async (req , res) =>{
    try {
        const {text} = req.body;

        if(!text || text.trim()==""){
            return res.status(400).json({error: "no text provided"});
        }

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
             messages: [
        {
          role: "system",
          content: "You are a helpful assistant that summarizes notes briefly.",
        },
        {
          role: "user",
          content: `Summarize this note in 4-5 concise bullet points:\n${text}`,
        },
      ],
      max_tokens: 150,
        });

        const summary = response.choices[0].message.content;
    res.json({ summary });
  } catch (error) {
  console.error("Error summarizing:", error?.response?.data || error);

  if (error.code === "insufficient_quota" || error.status === 429) {
    return res.status(429).json({ error: "OpenAI quota exceeded. Please check your plan." });
  }

  res.status(500).json({ error: "Failed to summarize note" });
}

});

export default router;