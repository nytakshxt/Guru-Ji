// Dashboard Component Logic for Guru Ji

class GuruJiDashboard {
  constructor() {
    this.containerId = "tab-dashboard";
    this.db = window.db;
  }

  render() {
    const user = this.db.getUser();
    
    // Update top header XP metrics & streaks
    this.updateHeaderProgress(user);

    // Render Stats Cards
    document.getElementById("dash-level-val").innerText = `Level ${user.level}`;
    document.getElementById("dash-streak-val").innerText = `${user.streak} Days`;
    document.getElementById("dash-hours-val").innerText = `${user.studyHoursThisWeek}h`;
    document.getElementById("dash-topics-val").innerText = user.completedTopicsCount;

    // Render Streak Flames calendar
    this.renderStreakCalendar(user);

    // Render SVG Charts
    this.renderHoursChart();
    this.renderSubjectWheels(user);

    // Render Activity Feed
    this.renderActivityFeed();
  }

  updateHeaderProgress(user) {
    const levelBadge = document.getElementById("header-level");
    const streakBadge = document.querySelector(".streak-badge span");
    const xpBadge = document.querySelector(".xp-badge span");
    const progressFill = document.getElementById("header-xp-fill");

    if (levelBadge) levelBadge.innerText = `Lvl ${user.level}`;
    if (streakBadge) streakBadge.innerText = `${user.streak} Days`;
    if (xpBadge) xpBadge.innerText = `${user.xp} / ${user.nextLevelXp} XP`;
    
    if (progressFill) {
      const percentage = (user.xp / user.nextLevelXp) * 100;
      progressFill.style.width = `${percentage}%`;
    }
  }

  renderStreakCalendar(user) {
    const calendarContainer = document.getElementById("streak-calendar-days");
    if (!calendarContainer) return;
    calendarContainer.innerHTML = "";

    const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    
    // Generate the last 7 days of dates
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      dates.push(d);
    }

    dates.forEach(date => {
      const dateStr = date.toISOString().split('T')[0];
      const hasActive = user.streakHistory.includes(dateStr);
      const dayName = daysOfWeek[date.getDay()];
      const isToday = dateStr === today.toISOString().split('T')[0];

      const dayElement = document.createElement("div");
      dayElement.className = `streak-day-node ${hasActive ? 'active' : ''} ${isToday ? 'today' : ''}`;
      dayElement.innerHTML = `
        <div class="streak-day-lbl">${dayName}</div>
        <div class="streak-flame-circle">
          ${hasActive ? '🔥' : '•'}
        </div>
        <div class="streak-day-num">${date.getDate()}</div>
      `;
      calendarContainer.appendChild(dayElement);
    });
  }

  renderHoursChart() {
    const container = document.getElementById("hours-chart-container");
    if (!container) return;

    // Daily study minutes for past 7 days
    const dailyMins = [45, 90, 120, 60, 45, 110, 75];
    const labels = ["Thu", "Fri", "Sat", "Sun", "Mon", "Tue", "Today"];
    
    const width = container.clientWidth || 500;
    const height = 180;
    const padding = 30;

    const maxVal = Math.max(...dailyMins) + 20;

    // Create points coordinates
    const points = dailyMins.map((val, idx) => {
      const x = padding + (idx * (width - padding * 2)) / (dailyMins.length - 1);
      const y = height - padding - (val * (height - padding * 2)) / maxVal;
      return { x, y, val };
    });

    // Make SVG Path
    let pathString = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      // Control points for cubic bezier curves
      const cpX1 = points[i-1].x + (points[i].x - points[i-1].x) / 2;
      const cpY1 = points[i-1].y;
      const cpX2 = points[i-1].x + (points[i].x - points[i-1].x) / 2;
      const cpY2 = points[i].y;
      pathString += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${points[i].x} ${points[i].y}`;
    }

    // Make filled path string
    const filledPathString = `${pathString} L ${points[points.length-1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`;

    let gridLines = "";
    // Draw Y grid guides
    for (let i = 0; i <= 3; i++) {
      const val = Math.round((maxVal / 3) * i);
      const y = height - padding - (val * (height - padding * 2)) / maxVal;
      gridLines += `
        <line x1="${padding}" y1="${y}" x2="${width - padding}" y2="${y}" stroke="rgba(255, 255, 255, 0.03)" stroke-width="1" />
        <text x="${padding - 5}" y="${y + 4}" fill="#5c5970" font-size="10" text-anchor="end">${val}m</text>
      `;
    }

    // Draw X labels
    const labelTexts = points.map((p, i) => `
      <text x="${p.x}" y="${height - 10}" fill="#a09cb0" font-size="11" text-anchor="middle">${labels[i]}</text>
    `).join("");

    // Draw interactive nodes
    const nodeDots = points.map((p, i) => `
      <circle cx="${p.x}" cy="${p.y}" r="4" fill="#00f0ff" stroke="#06050c" stroke-width="2" class="chart-dot-trigger" data-val="${p.val} mins" />
      <g class="chart-tooltip" style="opacity: 0; pointer-events: none; transition: opacity 0.2s;">
        <rect x="${p.x - 30}" y="${p.y - 32}" width="60" height="22" rx="4" fill="#121020" stroke="rgba(0, 240, 255, 0.2)" stroke-width="1" />
        <text x="${p.x}" y="${p.y - 17}" fill="#fff" font-size="10" font-weight="bold" text-anchor="middle">${p.val}m</text>
      </g>
    `).join("");

    container.innerHTML = `
      <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow: visible;">
        <defs>
          <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgba(0, 240, 255, 0.25)" />
            <stop offset="100%" stop-color="rgba(0, 240, 255, 0)" />
          </linearGradient>
          <linearGradient id="chartStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#9d4edd" />
            <stop offset="100%" stop-color="#00f0ff" />
          </linearGradient>
        </defs>
        ${gridLines}
        <path d="${filledPathString}" fill="url(#chartGlow)" />
        <path d="${pathString}" fill="none" stroke="url(#chartStroke)" stroke-width="3" stroke-linecap="round" />
        ${labelTexts}
        ${nodeDots}
      </svg>
    `;

    // Tooltip hover interactions
    const dots = container.querySelectorAll(".chart-dot-trigger");
    dots.forEach((dot, idx) => {
      const tooltip = container.querySelectorAll(".chart-tooltip")[idx];
      dot.addEventListener("mouseenter", () => {
        tooltip.style.opacity = "1";
        dot.setAttribute("r", "6");
      });
      dot.addEventListener("mouseleave", () => {
        tooltip.style.opacity = "0";
        dot.setAttribute("r", "4");
      });
    });
  }

  renderSubjectWheels(user) {
    const grid = document.getElementById("subjects-progress-grid");
    if (!grid) return;
    grid.innerHTML = "";

    const subjects = Object.keys(user.subjectProgress);
    const colors = {
      Mathematics: "--primary",
      Physics: "--accent",
      Chemistry: "--neon-pink",
      Biology: "--success",
      "Computer Science": "--primary",
      English: "--accent",
      "General Knowledge": "--neon-pink"
    };

    subjects.forEach(subject => {
      const progress = user.subjectProgress[subject];
      const colVar = colors[subject] || "--primary";
      const card = document.createElement("div");
      card.className = "subject-progress-card glass-card";
      
      // Compute SVGs Circle variables
      const radius = 28;
      const circumference = 2 * Math.PI * radius;
      const strokeOffset = circumference - (progress / 100) * circumference;

      card.innerHTML = `
        <div class="subject-progress-left">
          <h4>${subject}</h4>
          <div class="progress-percent-lbl">${progress}% Mastery</div>
        </div>
        <div class="subject-progress-wheel-box">
          <svg class="progress-wheel" width="68" height="68" viewBox="0 0 68 68">
            <circle cx="34" cy="34" r="${radius}" class="wheel-track" />
            <circle cx="34" cy="34" r="${radius}" class="wheel-fill" 
                    style="stroke: var(${colVar}); stroke-dasharray: ${circumference}; stroke-dashoffset: ${strokeOffset};" />
          </svg>
          <div class="wheel-percentage" style="color: var(${colVar})">${progress}%</div>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  renderActivityFeed() {
    const list = document.getElementById("dash-activity-list");
    if (!list) return;

    const activities = [
      { text: "Solved Newtonian Mechanics doubt in AI Tutor", xp: "+150 XP", date: "Just now", type: "tutor" },
      { text: "Completed 'Matrices & Determinants' Practice Test (Score: 80%)", xp: "+450 XP", date: "2 hours ago", type: "quiz" },
      { text: "Summarized notes for Cellular Mitosis Biology topic", xp: "+300 XP", date: "Yesterday", type: "notes" },
      { text: "Checked off 'Revise thermodynamics formulae' in Study Planner", xp: "+150 XP", date: "Yesterday", type: "planner" }
    ];

    list.innerHTML = activities.map(act => `
      <div class="activity-feed-item">
        <div class="activity-node-icon ${act.type}">
          ${act.type === 'tutor' ? '💬' : act.type === 'quiz' ? '🏆' : act.type === 'notes' ? '📝' : '📅'}
        </div>
        <div class="activity-feed-details">
          <div class="activity-feed-text">${act.text}</div>
          <div class="activity-feed-time">${act.date}</div>
        </div>
        <div class="activity-feed-xp">${act.xp}</div>
      </div>
    `).join("");
  }
}

window.dashboardComponent = new GuruJiDashboard();
