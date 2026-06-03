// AI Note Summarizer & Flashcards Component for Guru Ji

class GuruJiNotes {
  constructor() {
    this.containerId = "tab-notes";
    this.db = window.db;

    this.activeNote = null;
    this.activeCardIndex = 0;
  }

  init() {
    this.setupListeners();
    this.loadNotesList();
  }

  setupListeners() {
    // Summarize button click
    const sumBtn = document.getElementById("summarize-action-btn");
    const notesText = document.getElementById("notes-raw-input");

    if (sumBtn) {
      sumBtn.addEventListener("click", () => this.handleSummarize());
    }

    // Drag and drop event listeners on dropzone
    const dropzone = document.getElementById("notes-file-dropzone");
    if (dropzone) {
      dropzone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropzone.classList.add("dragover");
      });

      dropzone.addEventListener("dragleave", () => {
        dropzone.classList.remove("dragover");
      });

      dropzone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropzone.classList.remove("dragover");
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
          this.simulateDropIngest(files[0]);
        }
      });

      dropzone.addEventListener("click", () => {
        // Mock browse files
        this.simulateDropIngest({ name: "lecture_slides.pdf", size: 4120000 });
      });
    }
  }

  loadNotesList() {
    const list = document.getElementById("saved-notes-list");
    if (!list) return;

    const notes = this.db.getNotes();
    if (notes.length === 0) {
      list.innerHTML = `<p style="font-size:12px; color:var(--text-muted); text-align:center; padding:10px;">No saved notes yet.</p>`;
      return;
    }

    list.innerHTML = notes.map(nt => `
      <div class="saved-note-item glass-card" data-id="${nt.id}" style="padding:12px; margin-bottom:8px; cursor:pointer; font-size:13px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <strong style="color:var(--text-main); display:block; text-overflow:ellipsis; overflow:hidden; white-space:nowrap; max-width:180px;">${nt.title}</strong>
          <span style="font-size:10px; color:var(--text-muted);">${nt.subject}</span>
        </div>
        <span style="font-size:10px; padding:2px 6px; background:rgba(0, 240, 255, 0.1); border-radius:4px; color:var(--accent); font-weight:bold;">${nt.flashcards.length} Cards</span>
      </div>
    `).join("");

    // Click note item
    const items = list.querySelectorAll(".saved-note-item");
    items.forEach(item => {
      item.addEventListener("click", () => {
        const noteId = item.getAttribute("data-id");
        const found = notes.find(n => n.id === noteId);
        if (found) {
          this.viewNote(found);
        }
      });
    });

    // Default load first note if none active
    if (!this.activeNote && notes.length > 0) {
      this.viewNote(notes[0]);
    }
  }

  viewNote(note) {
    this.activeNote = note;
    this.activeCardIndex = 0;

    // Display summary HTML
    const sumTitle = document.getElementById("active-summary-title");
    const sumContent = document.getElementById("active-summary-markdown");
    
    if (sumTitle) sumTitle.innerText = note.title;
    if (sumContent) {
      sumContent.innerHTML = this.renderMarkdown(note.summary);
    }

    // Render Flashcard
    this.renderFlashcard();
  }

  handleSummarize() {
    const textInput = document.getElementById("notes-raw-input");
    const subject = document.getElementById("notes-subject-select").value;
    
    if (!textInput || !textInput.value.trim()) return;

    const rawText = textInput.value;
    textInput.value = "";

    // Show simulated loading states
    const outViewer = document.getElementById("active-summary-markdown");
    if (outViewer) {
      outViewer.innerHTML = `<div style="text-align:center; padding:40px;"><div style="width:24px; height:24px; border:2px solid var(--accent); border-top-color:transparent; border-radius:50%; animation: spin 1s linear infinite; margin:0 auto 12px;"></div>Scanning notes through Guru Ji AI...</div>`;
    }

    setTimeout(() => {
      // Formulate mock output depending on subject
      const title = `AI Note Summary: ${rawText.substring(0, 24)}...`;
      const summary = `### Core Subject Outline\n- Summarized outline of the provided text in **${subject}**.\n\n### Core Equations & Concepts\n- **Primary Formula**: V_1 * P_1 = V_2 * P_2 (ideal constraints).\n- **Secondary Formula**: e = m*c^2 (relativity relations).\n\n### Critical Factoids\n- First discovered around mid-19th century.\n- Subject to environment temperatures and thermodynamic properties.`;
      
      const flashcards = [
        { front: "What is the primary formula related to this summary?", back: "V_1 * P_1 = V_2 * P_2" },
        { front: "Which physical constant governs the limits?", back: "The speed of light constant (c)" },
        { front: "Name the core subject analyzed.", back: `${subject}` }
      ];

      const newNote = this.db.addNote(title, subject, summary, flashcards);
      
      // Update UI
      this.loadNotesList();
      this.viewNote(newNote);
      
      // Update dashboard if exists
      if (window.dashboardComponent) {
        window.dashboardComponent.render();
      }
    }, 1800);
  }

  simulateDropIngest(file) {
    const textInput = document.getElementById("notes-raw-input");
    if (textInput) {
      textInput.value = `Analyzing worksheet document: "${file.name}" (${Math.round(file.size / 1024)} KB).\n\nExtracting textbook concepts...`;
    }
  }

  renderFlashcard() {
    const deckBox = document.getElementById("active-flashcard-box");
    if (!deckBox || !this.activeNote || this.activeNote.flashcards.length === 0) {
      if (deckBox) deckBox.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted);">No flashcards for this summary.</div>`;
      return;
    }

    const cards = this.activeNote.flashcards;
    const card = cards[this.activeCardIndex];

    deckBox.innerHTML = `
      <div class="flashcard-wrapper" id="flashcard-interactive-wrapper">
        <div class="flashcard-inner">
          <div class="flashcard-face flashcard-front">
            <div class="flashcard-text">${card.front}</div>
            <div class="card-hint">Tap to Flip</div>
          </div>
          <div class="flashcard-face flashcard-back">
            <div class="flashcard-text">${card.back}</div>
            <div class="card-hint">Tap to Flip</div>
          </div>
        </div>
      </div>
      
      <div class="flashcard-controls">
        <button id="card-swipe-prev" class="swipe-btn prev">◀</button>
        <span class="deck-progress">Card <span id="card-current-num">${this.activeCardIndex + 1}</span> of ${cards.length}</span>
        <button id="card-swipe-know" class="swipe-btn know">✓</button>
        <button id="card-swipe-next" class="swipe-btn next">▶</button>
      </div>
    `;

    // Flip action
    const wrapper = document.getElementById("flashcard-interactive-wrapper");
    if (wrapper) {
      wrapper.addEventListener("click", () => {
        wrapper.classList.toggle("flipped");
      });
    }

    // Swipe buttons listeners
    document.getElementById("card-swipe-prev").addEventListener("click", () => this.navigateCard(-1));
    document.getElementById("card-swipe-next").addEventListener("click", () => this.navigateCard(1));
    
    document.getElementById("card-swipe-know").addEventListener("click", () => {
      // Add XP for knowing card
      this.db.addXp(50);
      
      // Visual feedback and skip to next
      const inner = wrapper.querySelector(".flashcard-inner");
      inner.style.border = "2px solid var(--success)";
      
      setTimeout(() => {
        this.navigateCard(1);
      }, 400);
    });
  }

  navigateCard(direction) {
    if (!this.activeNote) return;
    const count = this.activeNote.flashcards.length;
    this.activeCardIndex = (this.activeCardIndex + direction + count) % count;
    this.renderFlashcard();
  }

  renderMarkdown(text) {
    // Simple markdown renderer
    return text
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^\- (.*$)/gim, '<li>$1</li>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '<br/>')
      .replace(/<\/li><br\/>/g, '</li>');
  }
}

// Add CSS spinning animations to variables/layout if needed
window.notesComponent = new GuruJiNotes();
window.notesComponent.init();
