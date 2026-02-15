// api/chat.js
export default async function handler(req, res) {
    // Hanya izinkan metode POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Metode tidak diizinkan' });
    }

    const { messages } = req.body;

    // Ini adalah cara aman memanggil API Key dari Vercel Settings nanti
    const apiKey = process.env.GROQ_API_KEY; 

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "meta-llama/llama-4-maverick-17b-128e-instruct",
                messages: messages, // Daftar chat yang sudah di-slice(-40)
                max_tokens: 2048,
                temperature: 0.7
            })
        });

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: "Gagal menyambung ke server AI" });
    }
}
