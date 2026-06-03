// Previous Year Papers Browser & Whiteboard Simulator for Guru Ji

class GuruJiPapers {
  constructor() {
    this.containerId = "tab-papers";
    this.db = window.db;

    this.activeVideo = null;
    this.videoInterval = null;
    this.videoStep = 0;
    this.videoPlaying = false;

    // Steps to simulate whiteboard video drawing
    this.explanationVideos = {
      "p-jee-2025": [
        { formula: "y = A sin(kx - ωt)", text: "Define the general sinusoidal wave equation moving in positive x-direction." },
        { formula: "v = dy/dt = -ωA cos(kx - ωt)", text: "Differentiate with respect to time to solve particle velocity." },
        { formula: "a = dv/dt = -ω²A sin(kx - ωt)", text: "Differentiate again to determine particle acceleration. Notice it is proportional to negative displacement." },
        { formula: "a_max = ω²A", text: "Isolate maximum particle acceleration. Substitute numerical bounds given in the question: 5 m/s²." }
      ],
      "p-neet-2025": [
        { formula: "6CO₂ + 6H₂O -> C₆H₁₂O₆ + 6O₂", text: "Core photosynthesis equation. Notice light energy converts inorganic carbon into organic glucose." },
        { formula: "ATP + NADPH (Light reactions)", text: "Adenosine Triphosphate and NADPH are produced inside thylakoid membranes to drive dark cycle (Calvin Cycle)." },
        { formula: "Rubisco enzyme fixation", text: "Carbon dioxide attaches to RuBP molecule via Rubisco catalysis. This is the rate-limiting step of plant productivity." }
      ]
    };
  }

  init() {
    this.setupListeners();
    this.renderPapersList();
  }

  setupListeners() {
    // Search & Filter changes
    const search = document.getElementById("papers-search-input");
    const diff = document.getElementById("papers-diff-select");

    if (search) search.addEventListener("input", () => this.renderPapersList());
    if (diff) diff.addEventListener("change", () => this.renderPapersList());

    // Whiteboard modal controls
    const closeBtn = document.getElementById("whiteboard-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeWhiteboard());
    }

    const playBtn = document.getElementById("whiteboard-play-btn");
    if (playBtn) {
      playBtn.addEventListener("click", () => this.toggleVideoPlay());
    }

    const prevBtn = document.getElementById("whiteboard-step-prev");
    if (prevBtn) {
      prevBtn.addEventListener("click", () => this.stepVideo(-1));
    }

    const nextBtn = document.getElementById("whiteboard-step-next");
    if (nextBtn) {
      nextBtn.addEventListener("click", () => this.stepVideo(1));
    }
  }

  renderPapersList() {
    const list = document.getElementById("papers-cards-grid");
    if (!list) return;

    const query = document.getElementById("papers-search-input").value.toLowerCase();
    const diffFilter = document.getElementById("papers-diff-select").value;

    const all = this.db.getPapers();

    const filtered = all.filter(p => {
      const matchQuery = p.exam.toLowerCase().includes(query) || p.subject.toLowerCase().includes(query);
      const matchDiff = diffFilter === "All" || p.difficulty === diffFilter;
      return matchQuery && matchDiff;
    });

    if (filtered.length === 0) {
      list.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-muted);">No papers match your filters.</div>`;
      return;
    }

    list.innerHTML = filtered.map(p => `
      <div class="paper-card glass-panel">
        <div class="paper-header">
          <span class="exam-tag">${p.exam}</span>
          <span class="difficulty-badge ${p.difficulty}">${p.difficulty}</span>
        </div>
        <h3 class="paper-title">${p.subject} (${p.year})</h3>
        <p class="paper-desc">${p.details}</p>
        <div class="paper-meta">
          <div class="meta-item">
            <span>📊</span> ${p.questionsCount} Qs
          </div>
          <div class="meta-item">
            <span>📥</span> ${p.downloads} Downloads
          </div>
        </div>
        <div class="paper-actions">
          <button class="glow-btn download-paper-action" data-id="${p.id}" style="font-size:12px; padding:10px 16px;">Download PDF</button>
          ${this.explanationVideos[p.id] ? `
            <button class="glow-btn glow-btn-accent watch-paper-action" data-id="${p.id}" style="font-size:12px; padding:10px 16px;">Watch AI Solve</button>
          ` : ''}
        </div>
      </div>
    `).join("");

    // Set actions
    list.querySelectorAll(".download-paper-action").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        this.simulateDownload(id, btn);
      });
    });

    list.querySelectorAll(".watch-paper-action").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        this.openWhiteboard(id);
      });
    });
  }

  simulateDownload(id, btn) {
    const originalText = btn.innerText;
    btn.innerText = "Downloading...";
    btn.disabled = true;

    setTimeout(() => {
      btn.innerText = "Downloaded ✓";
      btn.style.background = "var(--success)";
      btn.style.borderColor = "var(--success)";
      
      this.db.addXp(100); // Gained XP
      
      // Update count
      const all = this.db.getPapers();
      const paper = all.find(p => p.id === id);
      if (paper) paper.downloads++;

      setTimeout(() => {
        btn.innerText = originalText;
        btn.disabled = false;
        btn.style.background = "";
        btn.style.borderColor = "";
        this.renderPapersList();
      }, 2000);
    }, 1500);
  }

  openWhiteboard(paperId) {
    const modal = document.getElementById("whiteboard-modal-overlay");
    if (!modal) return;

    this.activeVideo = this.explanationVideos[paperId];
    this.videoStep = 0;
    this.videoPlaying = false;

    modal.classList.add("active");
    this.renderVideoStep();
  }

  closeWhiteboard() {
    const modal = document.getElementById("whiteboard-modal-overlay");
    if (modal) {
      modal.classList.remove("active");
    }
    clearInterval(this.videoInterval);
    this.videoPlaying = false;
    this.activeVideo = null;
  }

  renderVideoStep() {
    if (!this.activeVideo) return;

    const step = this.activeVideo[this.videoStep];
    const formulaEl = document.getElementById("sketch-formula-board");
    const textEl = document.getElementById("sketch-text-board");
    const fill = document.getElementById("video-progress-line-fill");

    if (formulaEl && textEl && fill) {
      // Animate transition
      formulaEl.classList.remove("show");
      textEl.classList.remove("show");

      setTimeout(() => {
        formulaEl.innerText = step.formula;
        textEl.innerText = step.text;

        formulaEl.classList.add("show");
        textEl.classList.add("show");
      }, 200);

      // Progress bar percentage
      const percent = ((this.videoStep + 1) / this.activeVideo.length) * 100;
      fill.style.width = `${percent}%`;
    }

    // Play/Pause button text
    const playBtn = document.getElementById("whiteboard-play-btn");
    if (playBtn) {
      playBtn.innerText = this.videoPlaying ? "Pause Solve" : "Play Solve";
    }
  }

  toggleVideoPlay() {
    if (this.videoPlaying) {
      clearInterval(this.videoInterval);
      this.videoPlaying = false;
      this.renderVideoStep();
    } else {
      this.videoPlaying = true;
      this.renderVideoStep();

      this.videoInterval = setInterval(() => {
        if (this.videoStep < this.activeVideo.length - 1) {
          this.videoStep++;
          this.renderVideoStep();
        } else {
          // Loop or stop
          clearInterval(this.videoInterval);
          this.videoPlaying = false;
          this.renderVideoStep();
        }
      }, 4000); // 4 seconds per step
    }
  }

  stepVideo(direction) {
    clearInterval(this.videoInterval);
    this.videoPlaying = false;
    
    if (!this.activeVideo) return;

    this.videoStep = (this.videoStep + direction + this.activeVideo.length) % this.activeVideo.length;
    this.renderVideoStep();
  }
}

window.papersComponent = new GuruJiPapers();
window.papersComponent.init();
