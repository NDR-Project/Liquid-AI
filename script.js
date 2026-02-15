// --- KONFIGURASI AWAL ---
let chatHistory = JSON.parse(localStorage.getItem("liquid_chat_history")) || [];
const chatContainer = document.getElementById("chat-container");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");
const landingPage = document.querySelector(".landing");

// --- INISIALISASI ---
window.onload = () => {
    renderChatHistory();
    toggleLanding();
};

// --- FUNGSI UTAMA KIRIM PESAN ---
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // 1. Tambah pesan user ke layar & history
    addMessage("user", message);
    userInput.value = "";
    toggleLanding();

    // 2. Siapkan memori optimal (40 pesan terakhir)
    const memoryOptimal = chatHistory.slice(-40).map(msg => ({
        role: msg.role,
        content: msg.content
    }));

    // 3. Tambahkan Persona AI (diambil dari settings atau default)
    const aiPersona = localStorage.getItem("ai_persona") || "Kamu adalah Liquid AI yang keren.";
    const finalMessages = [
        { role: "system", content: aiPersona },
        ...memoryOptimal
    ];

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
