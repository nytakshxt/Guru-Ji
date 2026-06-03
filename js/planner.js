// Study Planner & AI Scheduler Component for Guru Ji

class GuruJiPlanner {
  constructor() {
    this.containerId = "tab-planner";
    this.db = window.db;

    this.selectedDate = new Date().toISOString().split('T')[0];
    this.currentMonth = new Date();
  }

  init() {
    this.setupListeners();
    this.renderCalendar();
    this.renderChecklist();
  }

  setupListeners() {
    // Quick Add Task Form
    const addBtn = document.getElementById("planner-add-task-btn");
    const taskInput = document.getElementById("planner-task-input");
    const subjectSelect = document.getElementById("planner-subject-select");

    if (addBtn && taskInput && subjectSelect) {
      addBtn.addEventListener("click", () => {
        const text = taskInput.value.trim();
        const subject = subjectSelect.value;
        if (!text) return;

        this.db.addPlannerTask(text, subject, this.selectedDate);
        taskInput.value = "";
        
        // Re-render
        this.renderCalendar();
        this.renderChecklist();
        if (window.dashboardComponent) window.dashboardComponent.render();
      });
    }

    // AI Schedule Wizard
    const genBtn = document.getElementById("ai-generate-schedule-btn");
    if (genBtn) {
      genBtn.addEventListener("click", () => this.generateAISchedule());
    }

    // Month navigation
    const prevMonth = document.getElementById("calendar-prev-month");
    const nextMonth = document.getElementById("calendar-next-month");

    if (prevMonth && nextMonth) {
      prevMonth.addEventListener("click", () => {
        this.currentMonth.setMonth(this.currentMonth.getMonth() - 1);
        this.renderCalendar();
      });
      nextMonth.addEventListener("click", () => {
        this.currentMonth.setMonth(this.currentMonth.getMonth() + 1);
        this.renderCalendar();
      });
    }
  }

  renderCalendar() {
    const calendarMonthTitle = document.getElementById("calendar-month-year");
    const daysGrid = document.getElementById("calendar-days-grid");
    if (!calendarMonthTitle || !daysGrid) return;

    // Render Month Name
    const options = { month: 'long', year: 'numeric' };
    calendarMonthTitle.innerText = this.currentMonth.toLocaleDateString('en-US', options);

    daysGrid.innerHTML = "";

    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();

    // First day of current month
    const firstDay = new Date(year, month, 1).getDay();
    // Number of days in current month
    const numDays = new Date(year, month + 1, 0).getDate();
    // Number of days in previous month
    const prevNumDays = new Date(year, month, 0).getDate();

    const plannerTasks = this.db.getPlanner();

    // Render days from previous month
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = prevNumDays - i;
      const cellDate = new Date(year, month - 1, day);
      this.createDayCell(cellDate, false, daysGrid, plannerTasks);
    }

    // Render days of current month
    for (let day = 1; day <= numDays; day++) {
      const cellDate = new Date(year, month, day);
      this.createDayCell(cellDate, true, daysGrid, plannerTasks);
    }

    // Render days of next month to fill grid (multiple of 7)
    const totalCells = daysGrid.children.length;
    const remaining = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let day = 1; day <= remaining; day++) {
      const cellDate = new Date(year, month + 1, day);
      this.createDayCell(cellDate, false, daysGrid, plannerTasks);
    }
  }

  createDayCell(date, isCurrentMonth, gridElement, plannerTasks) {
    const dateStr = date.toISOString().split('T')[0];
    const dayTasks = plannerTasks.filter(t => t.date === dateStr);

    const cell = document.createElement("div");
    cell.className = `calendar-day-cell ${isCurrentMonth ? '' : 'other-month'} ${dateStr === this.selectedDate ? 'today' : ''}`;
    cell.setAttribute("data-date", dateStr);

    // Filter categories for dots
    const dots = [...new Set(dayTasks.map(t => t.subject))].slice(0, 3);
    const dotsHTML = dots.map(sub => `<div class="day-dot ${sub}"></div>`).join("");

    cell.innerHTML = `
      <span class="day-number">${date.getDate()}</span>
      <div class="day-indicators">${dotsHTML}</div>
    `;

    cell.addEventListener("click", () => {
      // Set selected date
      this.selectedDate = dateStr;
      
      // Update cell styling
      const cells = gridElement.querySelectorAll(".calendar-day-cell");
      cells.forEach(c => c.classList.remove("today"));
      cell.classList.add("today");

      this.renderChecklist();
    });

    gridElement.appendChild(cell);
  }

  renderChecklist() {
    const list = document.getElementById("planner-todo-list");
    const dateTitle = document.getElementById("active-planner-date");
    if (!list || !dateTitle) return;

    // Format selected date title
    const d = new Date(this.selectedDate);
    dateTitle.innerText = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    const plannerTasks = this.db.getPlanner();
    const dayTasks = plannerTasks.filter(t => t.date === this.selectedDate);

    if (dayTasks.length === 0) {
      list.innerHTML = `<p style="font-size:13px; text-align:center; padding:20px; color:var(--text-dark);">No tasks scheduled for this day.</p>`;
      return;
    }

    list.innerHTML = dayTasks.map(task => `
      <div class="todo-item ${task.done ? 'done' : ''}" data-id="${task.id}">
        <div class="todo-checkbox-wrapper">
          <svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
        </div>
        <div class="todo-content">
          <div class="todo-text">${task.text}</div>
          <span class="todo-tag ${task.subject}">${task.subject}</span>
        </div>
      </div>
    `).join("");

    // Hook click toggles
    list.querySelectorAll(".todo-item").forEach(item => {
      item.addEventListener("click", () => {
        const id = item.getAttribute("data-id");
        this.db.togglePlannerTask(id);
        
        // Audio sound mock click feedback
        this.playTickSound();

        this.renderCalendar();
        this.renderChecklist();

        // Update dashboard
        if (window.dashboardComponent) window.dashboardComponent.render();
      });
    });
  }

  generateAISchedule() {
    const exam = document.getElementById("ai-exam-select").value;
    const hours = parseInt(document.getElementById("ai-hours-select").value, 10);
    const dateInput = document.getElementById("ai-exam-date").value;

    const summaryText = document.getElementById("ai-schedule-summary");
    if (summaryText) {
      summaryText.innerText = "Analyzing exam parameters. Creating study checklist...";
    }

    setTimeout(() => {
      // Generate mock checklist for the next 4 days starting today
      const start = new Date(this.selectedDate);
      const scheduleTasks = {
        "IIT-JEE Advanced": [
          { text: "Differentiate complex trigonometric matrices", subject: "Mathematics" },
          { text: "Solve Faraday's Law magnetic field equations", subject: "Physics" },
          { text: "Write carbon chain mechanism for Aldol condensation", subject: "Chemistry" },
          { text: "Practice coordinate geometry mock sheet", subject: "Mathematics" }
        ],
        "NEET Exam": [
          { text: "Memorize DNA double helix structural bonds", subject: "Biology" },
          { text: "Understand Gibbs Free Energy chemical reaction scales", subject: "Chemistry" },
          { text: "Identify cell division telophase microscope slides", subject: "Biology" },
          { text: "Solve electrical current Kirchhoff laws", subject: "Physics" }
        ],
        "SAT Digital": [
          { text: "Read two structural literature argument summaries", subject: "English" },
          { text: "Complete linear equations systems math grid", subject: "Mathematics" },
          { text: "Practice relative clauses vocabulary tests", subject: "English" },
          { text: "Solve quadratic formulas worksheets", subject: "Mathematics" }
        ]
      };

      const tasks = scheduleTasks[exam] || scheduleTasks["SAT Digital"];

      tasks.forEach((t, index) => {
        const targetDate = new Date(start);
        targetDate.setDate(start.getDate() + index);
        const dateStr = targetDate.toISOString().split('T')[0];
        
        this.db.addPlannerTask(t.text, t.subject, dateStr);
      });

      if (summaryText) {
        summaryText.innerHTML = `<span style="color:var(--success); font-weight:bold;">Success!</span> Generated checklist study milestones. Check your calendar!`;
      }

      this.renderCalendar();
      this.renderChecklist();
      if (window.dashboardComponent) window.dashboardComponent.render();
    }, 1500);
  }

  playTickSound() {
    // Simple Web Audio synthesizer click sound so the app has haptic feel!
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch(e) {
      console.log("Audio feedback not supported in this environment:", e);
    }
  }
}

window.plannerComponent = new GuruJiPlanner();
window.plannerComponent.init();
