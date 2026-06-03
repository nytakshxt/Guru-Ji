// Practice Test Quiz Engine for Guru Ji

class GuruJiPractice {
  constructor() {
    this.containerId = "tab-practice";
    this.db = window.db;

    this.activeQuiz = null;
    this.timerInterval = null;
  }

  init() {
    this.setupListeners();
  }

  setupListeners() {
    const startBtn = document.getElementById("start-quiz-btn");
    if (startBtn) {
      startBtn.addEventListener("click", () => this.generateQuiz());
    }
  }

  generateQuiz() {
    const subject = document.getElementById("quiz-subject-select").value;
    const difficulty = document.getElementById("quiz-diff-select").value;
    const qCount = parseInt(document.getElementById("quiz-count-select").value, 10);

    // Get questions from database
    let pool = this.db.getQuestions(subject);
    
    // Fallbacks if pool is empty
    if (pool.length === 0) {
      pool = [
        {
          id: "fallback-1",
          difficulty: "Easy",
          question: `What is the primary unit of measurement for force under standard physics equations?`,
          options: ["Newton", "Joule", "Pascal", "Watt"],
          answer: 0,
          explanation: ["Force is measured in Newtons (N) in SI units, named after Isaac Newton.", "F = mass * acceleration."]
        },
        {
          id: "fallback-2",
          difficulty: "Medium",
          question: `Explain what happens when an element undergoes oxidation in chemical bonding.`,
          options: ["It gains electrons", "It loses electrons", "It shares neutrons", "It decays radioactively"],
          answer: 1,
          explanation: ["Oxidation involves the loss of electrons during a reaction by a molecule, atom, or ion.", "Remember OIL RIG: Oxidation Is Loss, Reduction Is Gain."]
        }
      ];
    }

    // Filter by difficulty if needed, otherwise use full pool
    let filtered = pool.filter(q => q.difficulty === difficulty);
    if (filtered.length === 0) filtered = pool; // fallback

    // Slice to count requested
    const quizQuestions = filtered.slice(0, qCount);

    this.activeQuiz = {
      subject,
      difficulty,
      questions: quizQuestions,
      answers: new Array(quizQuestions.length).fill(null), // stores selected option index
      currentIndex: 0,
      timeRemaining: quizQuestions.length * 60, // 60 seconds per question
      totalQuestions: quizQuestions.length
    };

    this.renderQuizEnvironment();
    this.startTimer();
  }

  renderQuizEnvironment() {
    const grid = document.getElementById("practice-main-grid");
    if (!grid) return;

    grid.innerHTML = `
      <div class="quiz-container glass-panel" style="grid-column: 1 / -1;">
        <div class="quiz-header">
          <div class="quiz-title-box">
            <h3>${this.activeQuiz.subject} Assessment</h3>
            <p style="font-size:12px; color:var(--text-muted);">${this.activeQuiz.difficulty} Level • ${this.activeQuiz.totalQuestions} Questions</p>
          </div>
          <div class="timer-box">
            <span class="timer-icon">⏱️</span>
            <span id="quiz-timer-clock">00:00</span>
          </div>
        </div>

        <div class="quiz-progress-wrapper">
          <div style="display:flex; justify-content:space-between; font-size:12px; margin-bottom:8px; color:var(--text-muted);">
            <span>Question <span id="current-q-num">1</span> of ${this.activeQuiz.totalQuestions}</span>
            <span id="progress-percent-text">0% Done</span>
          </div>
          <div class="progress-track">
            <div id="quiz-progress-fill" class="progress-fill"></div>
          </div>
        </div>

        <div class="quiz-question-box" id="quiz-active-q-box">
          <!-- Active question gets rendered here -->
        </div>

        <div class="quiz-footer">
          <button id="quiz-prev-btn" class="glow-btn" style="background:rgba(255,255,255,0.03); border:1px solid var(--border-glass);">Previous</button>
          <button id="quiz-next-btn" class="glow-btn">Next</button>
          <button id="quiz-submit-btn" class="glow-btn glow-btn-accent" style="display:none;">Submit Test</button>
        </div>
      </div>
    `;

    this.renderActiveQuestion();

    // Set buttons
    document.getElementById("quiz-prev-btn").addEventListener("click", () => this.navigateQuestion(-1));
    document.getElementById("quiz-next-btn").addEventListener("click", () => this.navigateQuestion(1));
    document.getElementById("quiz-submit-btn").addEventListener("click", () => this.endQuiz());
  }

  renderActiveQuestion() {
    const qBox = document.getElementById("quiz-active-q-box");
    if (!qBox) return;

    const qIdx = this.activeQuiz.currentIndex;
    const q = this.activeQuiz.questions[qIdx];
    const selectedAnswer = this.activeQuiz.answers[qIdx];

    document.getElementById("current-q-num").innerText = qIdx + 1;
    
    // Update progress bar
    const percentage = ((qIdx) / this.activeQuiz.totalQuestions) * 100;
    document.getElementById("quiz-progress-fill").style.width = `${percentage}%`;
    document.getElementById("progress-percent-text").innerText = `${Math.round(percentage)}% Done`;

    // Render options
    const optionLabels = ["A", "B", "C", "D"];
    const optionsHTML = q.options.map((opt, idx) => `
      <div class="option-item ${selectedAnswer === idx ? 'selected' : ''}" data-idx="${idx}">
        <div class="option-badge">${optionLabels[idx]}</div>
        <div class="option-text">${opt}</div>
      </div>
    `).join("");

    qBox.innerHTML = `
      <div class="question-text">${q.question}</div>
      <div class="options-list">${optionsHTML}</div>
    `;

    // Options selection listener
    const optionElements = qBox.querySelectorAll(".option-item");
    optionElements.forEach(elem => {
      elem.addEventListener("click", () => {
        const idx = parseInt(elem.getAttribute("data-idx"), 10);
        this.activeQuiz.answers[qIdx] = idx;
        
        // Toggle selected styling
        optionElements.forEach(el => el.classList.remove("selected"));
        elem.classList.add("selected");
      });
    });

    // Control buttons display
    const prevBtn = document.getElementById("quiz-prev-btn");
    const nextBtn = document.getElementById("quiz-next-btn");
    const submitBtn = document.getElementById("quiz-submit-btn");

    if (qIdx === 0) {
      prevBtn.style.visibility = "hidden";
    } else {
      prevBtn.style.visibility = "visible";
    }

    if (qIdx === this.activeQuiz.totalQuestions - 1) {
      nextBtn.style.display = "none";
      submitBtn.style.display = "block";
    } else {
      nextBtn.style.display = "block";
      submitBtn.style.display = "none";
    }
  }

  navigateQuestion(direction) {
    this.activeQuiz.currentIndex += direction;
    this.renderActiveQuestion();
  }

  startTimer() {
    clearInterval(this.timerInterval);
    const clock = document.getElementById("quiz-timer-clock");
    
    const updateClock = () => {
      if (!this.activeQuiz) return;
      const mins = Math.floor(this.activeQuiz.timeRemaining / 60);
      const secs = this.activeQuiz.timeRemaining % 60;
      if (clock) {
        clock.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }

      if (this.activeQuiz.timeRemaining <= 0) {
        clearInterval(this.timerInterval);
        this.endQuiz(true); // timeout submission
      }

      this.activeQuiz.timeRemaining--;
    };

    updateClock();
    this.timerInterval = setInterval(updateClock, 1000);
  }

  endQuiz(isTimeout = false) {
    clearInterval(this.timerInterval);
    if (!this.activeQuiz) return;

    let correctCount = 0;
    let incorrectCount = 0;
    let skippedCount = 0;

    const reviewItemsHTML = this.activeQuiz.questions.map((q, idx) => {
      const selected = this.activeQuiz.answers[idx];
      const isCorrect = selected === q.answer;
      
      if (selected === null) {
        skippedCount++;
      } else if (isCorrect) {
        correctCount++;
      } else {
        incorrectCount++;
      }

      const optionLabels = ["A", "B", "C", "D"];
      const selectedText = selected !== null ? q.options[selected] : "No Answer Selected";
      const correctText = q.options[q.answer];

      const expls = q.explanation.map(step => `<li>${step}</li>`).join("");

      return `
        <div class="review-item ${isCorrect ? 'correct' : 'incorrect'}">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div class="review-status-badge ${isCorrect ? 'correct' : 'incorrect'}">
              ${selected === null ? 'SKIPPED' : isCorrect ? 'CORRECT' : 'INCORRECT'}
            </div>
            <span style="font-size:11px; color:var(--text-dark);">${q.difficulty}</span>
          </div>
          <div style="font-weight:600; font-size:14px; margin-bottom:12px; color:var(--text-main);">${q.question}</div>
          <div style="font-size:13px; margin-bottom:8px;">
            <span style="color:var(--text-muted)">Your Choice:</span> 
            <span style="color:${isCorrect ? 'var(--success)' : 'var(--error)'}; font-weight:500;">${selectedText}</span>
          </div>
          ${!isCorrect ? `
            <div style="font-size:13px; margin-bottom:12px;">
              <span style="color:var(--text-muted)">Correct Option:</span> 
              <span style="color:var(--success); font-weight:500;">${correctText}</span>
            </div>
          ` : ''}
          <div style="margin-top:14px; background:rgba(255,255,255,0.01); padding:12px; border-radius:6px; border:1px dashed var(--border-glass);">
            <div style="font-size:11px; text-transform:uppercase; color:var(--accent); font-weight:700; margin-bottom:6px;">Step-by-Step Explanation:</div>
            <ol style="margin-left:14px; font-size:12px; color:var(--text-muted); line-height:1.5;">
              ${expls}
            </ol>
          </div>
        </div>
      `;
    }).join("");

    const scorePercentage = Math.round((correctCount / this.activeQuiz.totalQuestions) * 100);
    const xpGained = correctCount * 100;
    
    // Add XP to database
    this.db.addXp(xpGained);

    // Refresh streak active date
    const user = this.db.getUser();
    const todayStr = new Date().toISOString().split('T')[0];
    if (!user.streakHistory.includes(todayStr)) {
      user.streakHistory.push(todayStr);
      user.streak += 1;
      this.db.updateUser({ streak: user.streak, streakHistory: user.streakHistory });
    }

    const grid = document.getElementById("practice-main-grid");
    if (!grid) return;

    grid.innerHTML = `
      <div class="results-card glass-panel" style="grid-column: 1 / -1;">
        <div class="score-circle">
          <div class="score-num">${scorePercentage}%</div>
          <div class="score-label">${correctCount}/${this.activeQuiz.totalQuestions} Correct</div>
        </div>

        <h3 style="font-size:22px; margin-bottom:8px;">${isTimeout ? "Time's Up!" : "Assessment Complete!"}</h3>
        <p style="font-size:14px; color:var(--text-muted); max-width:400px; margin: 0 auto 20px;">
          You earned <strong style="color:var(--accent);">${xpGained} XP</strong> and completed this study target in ${this.activeQuiz.subject}.
        </p>

        <div class="performance-details">
          <div class="metric-stat">
            <div class="metric-val" style="color:var(--success);">${correctCount}</div>
            <div class="metric-lbl">Correct Answers</div>
          </div>
          <div class="metric-stat">
            <div class="metric-val" style="color:var(--error);">${incorrectCount}</div>
            <div class="metric-lbl">Wrong Answers</div>
          </div>
          <div class="metric-stat">
            <div class="metric-val">${skippedCount}</div>
            <div class="metric-lbl">Skipped Questions</div>
          </div>
        </div>

        <button id="quiz-restart-btn" class="glow-btn">Start Another Quiz</button>

        <div class="review-section">
          <h4 style="font-size:16px; margin-bottom:20px; font-family:var(--font-display);">Question Diagnostics & Solutions</h4>
          ${reviewItemsHTML}
        </div>
      </div>
    `;

    document.getElementById("quiz-restart-btn").addEventListener("click", () => {
      // Re-render baseline layout
      this.renderBaseline();
    });

    this.activeQuiz = null;

    // Trigger dashboard update if instantiated
    if (window.dashboardComponent) {
      window.dashboardComponent.render();
    }
  }

  renderBaseline() {
    const grid = document.getElementById("practice-main-grid");
    if (!grid) return;

    grid.innerHTML = `
      <div class="generator-card glass-panel">
        <h3 style="font-size:18px; margin-bottom:16px; font-family:var(--font-display);">Custom Quiz Setup</h3>
        
        <div class="form-group">
          <label class="form-label">Subject Topic</label>
          <select class="form-select" id="quiz-subject-select">
            <option value="Mathematics">Mathematics</option>
            <option value="Physics">Physics</option>
            <option value="Chemistry">Chemistry</option>
            <option value="Biology">Biology</option>
            <option value="Computer Science">Computer Science</option>
            <option value="English">English</option>
            <option value="General Knowledge">General Knowledge</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Difficulty</label>
          <select class="form-select" id="quiz-diff-select">
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Number of Questions</label>
          <select class="form-select" id="quiz-count-select">
            <option value="5">5 Questions</option>
            <option value="10">10 Questions</option>
            <option value="15">15 Questions</option>
          </select>
        </div>

        <button id="start-quiz-btn" class="glow-btn" style="width:100%; justify-content:center;">Generate Practice Test</button>
      </div>

      <div class="practice-rules-card glass-panel" style="padding:24px;">
        <h3 style="font-size:18px; margin-bottom:16px; font-family:var(--font-display);">Exam Guidelines</h3>
        <ul style="margin-left:20px; font-size:14px; color:var(--text-muted); line-height:1.7; display:flex; flex-direction:column; gap:10px;">
          <li>Each generated test incorporates tailored questions matching your school/college level.</li>
          <li>A countdown timer triggers based on length: <strong>60 seconds per question</strong>.</li>
          <li>Completing tests increments subject mastery stats on the dashboard.</li>
          <li>Receive detailed step-by-step diagnostic solutions for every incorrect answer.</li>
        </ul>
      </div>
    `;

    this.setupListeners();
  }
}

window.practiceComponent = new GuruJiPractice();
window.practiceComponent.init();
