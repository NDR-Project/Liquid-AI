let chatHistory = [];

document.addEventListener("DOMContentLoaded", () => {
    const sendBtn = document.getElementById("send-btn");
    const userInput = document.getElementById("user-input");

    if (sendBtn) {
        sendBtn.addEventListener("click", sendMessage);
    }

    if (userInput) {
        userInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter") sendMessage();
        });
    }
    
    console.log("Liquid AI: Tombol dan Input siap!");
});

async function sendMessage() {
    const input = document.getElementById("user-input");
    const text = input.value.trim();
    if (!text) return;

    // Tampilkan pesan user ke layar
    displayMessage("user", text);
    input.value = "";

    // Simpan ke history & potong jadi 40 pesan terakhir
    chatHistory.push({ role: "user", content: text });
    const memory = chatHistory.slice(-40);

    try {
        // Panggil Backend kamu sendiri
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: memory })
        });

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        // Tampilkan pesan AI & simpan ke history
        displayMessage("ai", aiResponse);
        chatHistory.push({ role: "assistant", content: aiResponse });

    } catch (error) {
        console.error("Error:", error);
        displayMessage("ai", "Maaf Bos, ada kendala koneksi ke server.");
    }
}

function displayMessage(role, text) {
    const container = document.getElementById("chat-container");
    if (!container) return;
    
    const div = document.createElement("div");
    div.className = role === "user" ? "user-msg" : "ai-msg";
    div.innerText = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
}
    try {
        // 4. Panggil Backend (Bukan Groq langsung agar aman!)
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ messages: finalMessages })
        });

        if (!response.ok) throw new Error("Gagal terhubung ke Backend");

        const data = await response.json();
        const aiResponse = data.choices[0].message.content;

        // 5. Tampilkan jawaban AI
        addMessage("ai", aiResponse);

    } catch (error) {
        console.error("Error:", error);
        addMessage("ai", "Waduh Bos, sepertinya server lagi plenger. Coba cek koneksi atau API Key di Vercel!");
    }
}

// --- FUNGSI TAMBAH PESAN KE UI ---
function addMessage(role, content) {
    const msgObj = { role, content };
    chatHistory.push(msgObj);
    
    // Simpan ke LocalStorage agar tidak hilang saat refresh
    localStorage.setItem("liquid_chat_history", JSON.stringify(chatHistory));

    renderMessage(role, content);
    scrollToBottom();
}

function renderMessage(role, content) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", role === "user" ? "user-message" : "ai-message");
    
    // Support sederhana untuk baris baru
    messageDiv.innerText = content; 
    
    chatContainer.appendChild(messageDiv);
}

// --- FUNGSI PEMBANTU (UTILITY) ---
function renderChatHistory() {
    chatHistory.forEach(msg => renderMessage(msg.role, msg.content));
}

function toggleLanding() {
    if (chatHistory.length > 0) {
        landingPage.style.display = "none";
    } else {
        landingPage.style.display = "flex"; // Sesuai CSS Center kita tadi
    }
}

function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// --- EVENT LISTENERS ---
sendBtn.addEventListener("click", sendMessage);

userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// Fungsi Reset Chat (Opsional buat di menu settings)
function resetChat() {
    chatHistory = [];
    localStorage.removeItem("liquid_chat_history");
    location.reload();
}
