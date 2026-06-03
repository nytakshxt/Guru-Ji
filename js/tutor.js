// AI Tutor Component Logic for Guru Ji

class GuruJiTutor {
  constructor() {
    this.containerId = "tab-tutor";
    this.db = window.db;
    
    this.currentSubject = "Mathematics";
    this.botCharacters = {
      Mathematics: { name: "Aryabhata AI", avatar: "📐", greeting: "Namaste! I am Aryabhata AI, your mathematics guide. Let's explore calculus, geometry, or algebra together! Ask me a doubt or upload a worksheet." },
      Physics: { name: "Einstein AI", avatar: "⚛️", greeting: "Hello! I am Einstein AI. Relativity, electromagnetism, mechanics—space-time has no secrets for us. What physics puzzle shall we solve today?" },
      Chemistry: { name: "Curie AI", avatar: "🧪", greeting: "Greetings! Curie AI here. Let's discover molecular reactions, chemical bonds, and thermodynamic tables. What is your chemistry doubt?" },
      Biology: { name: "Darwin AI", avatar: "🧬", greeting: "Welcome! I am Darwin AI. Let's study evolutionary genetics, cell structures, ecology, and anatomy. What biological concept can I explain?" },
      "Computer Science": { name: "Ada AI", avatar: "💻", greeting: "Hello World! I am Ada AI. From sorting algorithms to database architectures and loops, let's write clean code. Ask your coding doubt!" },
      English: { name: "Shakespeare AI", avatar: "✍️", greeting: "Greetings, scholar! Shakespeare AI at your service. Let us dissect grammar, style, vocabulary, and literary masterpieces." },
      "General Knowledge": { name: "Chanakya AI", avatar: "🌏", greeting: "Salutations! I am Chanakya AI. Ask me about geography, global history, scientific milestones, or socio-economic facts." }
    };
    
    // Detailed replies matching subjects
    this.subjectMocks = {
      Mathematics: [
        {
          trigger: "calculus",
          reply: "Calculus concerns changes. The two major pillars are **Differentiation** (finding rates of change/slopes) and **Integration** (accumulating quantities/areas).\n\nHere is a step-by-step example:",
          steps: [
            { title: "Define the function", desc: "Let's find the slope of y = x^2 at x = 3." },
            { title: "Apply power rule", desc: "dy/dx = d/dx(x^2) = 2x." },
            { title: "Evaluate at point", desc: "Substitute x = 3: dy/dx = 2(3) = 6. This represents the rate of change." }
          ]
        },
        {
          trigger: "matrix",
          reply: "A matrix is a rectangular grid of numbers. We use matrix multiplication for system solutions, computer graphics, and machine learning transformations.",
          steps: [
            { title: "Multiplication rule", desc: "Multiply rows of the first matrix by columns of the second matrix." },
            { title: "Check dimensions", desc: "To multiply A(m x n) by B(p x q), n must equal p." }
          ]
        }
      ],
      Physics: [
        {
          trigger: "gravity",
          reply: "Gravity is a fundamental force pulling masses together. In classical mechanics, Newton modeled it as a force; in general relativity, Einstein modeled it as spacetime curvature.",
          steps: [
            { title: "Newtonian equation", desc: "F = G * (m1 * m2) / r^2." },
            { title: "Earth acceleration", desc: "On Earth, g ≈ 9.81 m/s^2, causing all free-falling objects to accelerate at the same rate in a vacuum." }
          ]
        }
      ]
    };

    // Keep track of chat logs per subject
    this.conversations = {};
  }

  init() {
    this.setupListeners();
    this.switchSubject(this.currentSubject);
  }

  setupListeners() {
    // Subject Pills click
    const pills = document.querySelectorAll("#subject-pills-bar .subject-pill");
    pills.forEach(pill => {
      pill.addEventListener("click", () => {
        const sub = pill.getAttribute("data-subject");
        this.switchSubject(sub);
      });
    });

    // Send button click
    const sendBtn = document.getElementById("tutor-send-btn");
    const chatInput = document.getElementById("tutor-chat-input");

    if (sendBtn && chatInput) {
      sendBtn.addEventListener("click", () => this.handleSendMessage());
      chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") this.handleSendMessage();
      });
    }

    // Floating templates click
    const templates = document.querySelectorAll(".tutor-template-btn");
    templates.forEach(btn => {
      btn.addEventListener("click", () => {
        if (chatInput) {
          chatInput.value = btn.innerText;
          chatInput.focus();
        }
      });
    });

    // Image/OCR Upload simulator
    const imageUpload = document.getElementById("tutor-image-uploader");
    if (imageUpload) {
      imageUpload.addEventListener("click", () => this.simulateOCR());
    }

    // PDF Upload simulator
    const pdfUpload = document.getElementById("tutor-pdf-uploader");
    if (pdfUpload) {
      pdfUpload.addEventListener("click", () => this.simulatePDFUpload());
    }
  }

  switchSubject(subject) {
    this.currentSubject = subject;
    
    // Toggle active classes on pills
    const pills = document.querySelectorAll("#subject-pills-bar .subject-pill");
    pills.forEach(pill => {
      if (pill.getAttribute("data-subject") === subject) {
        pill.classList.add("active");
      } else {
        pill.classList.remove("active");
      }
    });

    // Change Bot character card
    const char = this.botCharacters[subject];
    const charCard = document.getElementById("bot-character-info");
    if (charCard && char) {
      charCard.innerHTML = `
        <div class="character-avatar">${char.avatar}</div>
        <div>
          <h4 style="font-size: 15px; color: var(--text-main); font-weight:600;">${char.name}</h4>
          <span style="font-size: 11px; color: var(--accent);">Specialist Tutor</span>
        </div>
      `;
    }

    // Load conversation history or render greeting
    if (!this.conversations[subject]) {
      this.conversations[subject] = [
        { sender: "assistant", text: char.greeting }
      ];
    }

    this.renderChatMessages();
  }

  renderChatMessages() {
    const chatContainer = document.getElementById("tutor-chat-messages");
    if (!chatContainer) return;
    
    chatContainer.innerHTML = "";
    const messages = this.conversations[this.currentSubject];
    const char = this.botCharacters[this.currentSubject];

    messages.forEach(msg => {
      const bubble = document.createElement("div");
      bubble.className = `message-bubble ${msg.sender}`;
      
      const avatar = msg.sender === "assistant" ? char.avatar : "👤";
      
      let stepHTML = "";
      if (msg.steps && msg.steps.length > 0) {
        stepHTML = msg.steps.map((st, idx) => `
          <div class="step-block">
            <div class="step-title">Step ${idx + 1}: ${st.title}</div>
            <div class="step-desc">${st.desc}</div>
          </div>
        `).join("");
      }

      bubble.innerHTML = `
        <div class="message-avatar">${avatar}</div>
        <div class="message-content-box">
          <div class="message-text-body">${this.formatMarkdown(msg.text)}</div>
          ${stepHTML}
        </div>
      `;
      chatContainer.appendChild(bubble);
    });

    // Auto scroll to bottom
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  handleSendMessage() {
    const input = document.getElementById("tutor-chat-input");
    if (!input || !input.value.trim()) return;

    const userText = input.value;
    input.value = "";

    // Add user message
    this.conversations[this.currentSubject].push({
      sender: "user",
      text: userText
    });
    this.renderChatMessages();

    // Show Typing indicator
    this.showTypingIndicator();

    // Answer compilation
    setTimeout(() => {
      this.removeTypingIndicator();
      this.generateAIResponse(userText);
      this.db.addXp(50); // XP for chatting / solving doubts
    }, 1200);
  }

  showTypingIndicator() {
    const chatContainer = document.getElementById("tutor-chat-messages");
    if (!chatContainer) return;

    const typingBubble = document.createElement("div");
    typingBubble.className = "message-bubble assistant typing-bubble-temp";
    typingBubble.innerHTML = `
      <div class="message-avatar">${this.botCharacters[this.currentSubject].avatar}</div>
      <div class="message-content-box" style="display:flex; gap:6px; align-items:center; padding:12px 20px;">
        <span style="width:6px; height:6px; background:#fff; border-radius:50%; animation: wave 1.2s infinite 0.1s;"></span>
        <span style="width:6px; height:6px; background:#fff; border-radius:50%; animation: wave 1.2s infinite 0.2s;"></span>
        <span style="width:6px; height:6px; background:#fff; border-radius:50%; animation: wave 1.2s infinite 0.3s;"></span>
      </div>
    `;
    chatContainer.appendChild(typingBubble);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  removeTypingIndicator() {
    const indicators = document.querySelectorAll(".typing-bubble-temp");
    indicators.forEach(ind => ind.remove());
  }

  generateAIResponse(text) {
    const lowerText = text.toLowerCase();
    let replyText = `That is an interesting question! Let's analyze it under ${this.currentSubject}.`;
    let steps = [];

    // Check if we have subject triggers matching
    const subjectList = this.subjectMocks[this.currentSubject] || [];
    const matched = subjectList.find(mock => lowerText.includes(mock.trigger));

    if (matched) {
      replyText = matched.reply;
      steps = matched.steps;
    } else {
      // General fallbacks based on subject
      if (this.currentSubject === "Mathematics") {
        replyText = `Let's solve this mathematics equation. We will break down the formula and perform logical steps:`;
        steps = [
          { title: "Analyze variables", desc: `Identify terms and constraints inside your query: "${text}"` },
          { title: "Apply mathematical rule", desc: "Isolate the variables on one side of the equation." },
          { title: "Final answer calculation", desc: "Simplify the values. If this is a calculus question, check derivative/integration bounds." }
        ];
      } else if (this.currentSubject === "Physics") {
        replyText = `Here is the physical model of the problem:`;
        steps = [
          { title: "Define the physical system", desc: "Identify mass, forces, potential energy, and coefficients." },
          { title: "Apply kinematic/dynamic formulas", desc: "Construct equations based on Newton's laws or Conservation of Energy." },
          { title: "Compute value", desc: "Solve for the target variable and verify dimensions/units." }
        ];
      } else {
        replyText = `Under the study of **${this.currentSubject}**, we analyze this topic systematically. Let's break down the explanation:`;
        steps = [
          { title: "Key Term Definition", desc: `Let's define the fundamental parameters in: "${text}".` },
          { title: "Explanation / Real-World Context", desc: "Understand how this operates practically inside scientific or structural frameworks." }
        ];
      }
    }

    this.conversations[this.currentSubject].push({
      sender: "assistant",
      text: replyText,
      steps: steps
    });

    this.renderChatMessages();
  }

  simulateOCR() {
    const ocrLine = document.getElementById("ocr-laser-line");
    if (!ocrLine) return;

    // Show scanner overlay
    ocrLine.parentElement.style.display = "block";
    
    // Simulate reading image
    setTimeout(() => {
      ocrLine.parentElement.style.display = "none";
      const input = document.getElementById("tutor-chat-input");
      if (input) {
        input.value = "What is the equivalent resistance of two 6-ohm resistors connected in parallel?";
        input.focus();
      }
      this.db.addXp(100); // XP for using OCR solver
    }, 2500);
  }

  simulatePDFUpload() {
    const listContainer = document.getElementById("extracted-questions-list");
    if (!listContainer) return;

    // Simulate loading progress
    listContainer.innerHTML = `<div style="text-align:center; padding:10px; font-size:12px; color:var(--text-muted);">Scanning worksheet.pdf...</div>`;

    setTimeout(() => {
      const mockQuestions = [
        "1. Evaluate derivative of f(x)=3x^2+5x-2 at x=2",
        "2. Find parallel resistance of two 6-ohm resistors",
        "3. Explain cell division phases during mitosis"
      ];

      listContainer.innerHTML = `
        <div style="font-size:12px; font-weight:600; margin-bottom:8px; color:var(--accent);">Extracted Questions:</div>
        ${mockQuestions.map(q => `<div class="extracted-q-item" style="padding:6px; font-size:11px; color:var(--text-main); background:rgba(255,255,255,0.02); border:1px solid var(--border-glass); border-radius:4px; margin-bottom:4px; cursor:pointer;">${q}</div>`).join("")}
      `;

      // Set click events on items
      const items = listContainer.querySelectorAll(".extracted-q-item");
      items.forEach((item, idx) => {
        item.addEventListener("click", () => {
          const input = document.getElementById("tutor-chat-input");
          if (input) {
            if (idx === 0) {
              this.switchSubject("Mathematics");
              input.value = "What is the value of the derivative of f(x) = 3x^2 + 5x - 2 at x = 2?";
            } else if (idx === 1) {
              this.switchSubject("Physics");
              input.value = "What is the equivalent resistance of two 6-ohm resistors connected in parallel?";
            } else {
              this.switchSubject("Biology");
              input.value = "Explain the cell division mitosis phases.";
            }
            input.focus();
          }
        });
      });
      this.db.addXp(150); // XP for using PDF question solver
    }, 2000);
  }

  formatMarkdown(text) {
    // Simple markdown highlighting for visual presentation
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="chat-inline-code">$1</code>');
  }
}

window.tutorComponent = new GuruJiTutor();
window.tutorComponent.init();
