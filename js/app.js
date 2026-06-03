// Main Application Shell & Routing Coordinator for Guru Ji Platform

class GuruJiApp {
  constructor() {
    this.activeTab = "dashboard";
    this.db = window.db;
  }

  init() {
    this.setupRouter();
    this.setupMobileMenu();
    this.syncProfileData();
    
    // Initial Render
    this.navigateTo("dashboard");
    
    console.log("Guru Ji Application coordinates loaded successfully.");
  }

  setupRouter() {
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const tabName = link.getAttribute("data-tab");
        if (tabName) {
          this.navigateTo(tabName);
          // Close mobile menu if open
          document.getElementById("sidebar-nav").classList.remove("mobile-open");
        }
      });
    });
  }

  setupMobileMenu() {
    const toggleBtn = document.getElementById("mobile-menu-toggle");
    const sidebar = document.getElementById("sidebar-nav");

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener("click", () => {
        sidebar.classList.toggle("mobile-open");
      });

      // Close sidebar if user clicks outside of it on mobile
      document.addEventListener("click", (e) => {
        if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target) && sidebar.classList.contains("mobile-open")) {
          sidebar.classList.remove("mobile-open");
        }
      });
    }
  }

  navigateTo(tabName) {
    this.activeTab = tabName;

    // Toggle active link highlights
    const navItems = document.querySelectorAll(".nav-item");
    navItems.forEach(item => {
      const link = item.querySelector(".nav-link");
      if (link && link.getAttribute("data-tab") === tabName) {
        item.classList.add("active");
      } else {
        item.classList.remove("active");
      }
    });

    // Toggle active tab sections
    const tabs = document.querySelectorAll(".page-tab");
    tabs.forEach(tab => {
      if (tab.getAttribute("id") === `tab-${tabName}`) {
        tab.classList.add("active");
      } else {
        tab.classList.remove("active");
      }
    });

    // Call subcomponent render routines
    this.triggerTabRenders(tabName);
  }

  triggerTabRenders(tabName) {
    // Header label update
    const headerTitle = document.getElementById("header-active-page-title");
    const headerSub = document.getElementById("header-active-page-sub");

    const titles = {
      dashboard: { main: "Welcome back, scholar!", sub: "Here is your progress status for today." },
      tutor: { main: "Guru Ji AI Tutor", sub: "Clear your questions instantly across 7 subjects." },
      practice: { main: "Practice Tests", sub: "Challenge yourself with interactive quizzes." },
      notes: { main: "Notes Summarizer", sub: "Ingest textbook documents and test your memory." },
      papers: { main: "Previous Year Papers", sub: "Explore actual Board & Entrance examination sets." },
      planner: { main: "Study Planner", sub: "Manage daily tasks and build custom AI targets." }
    };

    if (headerTitle && headerSub && titles[tabName]) {
      headerTitle.innerText = titles[tabName].main;
      headerSub.innerText = titles[tabName].sub;
    }

    // Call renders
    if (tabName === "dashboard" && window.dashboardComponent) {
      window.dashboardComponent.render();
    } else if (tabName === "practice" && window.practiceComponent) {
      window.practiceComponent.renderBaseline();
    } else if (tabName === "notes" && window.notesComponent) {
      window.notesComponent.loadNotesList();
    } else if (tabName === "papers" && window.papersComponent) {
      window.papersComponent.renderPapersList();
    } else if (tabName === "planner" && window.plannerComponent) {
      window.plannerComponent.renderCalendar();
      window.plannerComponent.renderChecklist();
    }
  }

  syncProfileData() {
    const user = this.db.getUser();
    
    // Header / sidebar elements
    const avatarEls = document.querySelectorAll(".user-avatar");
    avatarEls.forEach(el => el.innerText = user.avatar);

    const nameEl = document.getElementById("sidebar-username");
    if (nameEl) nameEl.innerText = user.name;

    const levelEl = document.getElementById("sidebar-user-level");
    if (levelEl) levelEl.innerText = `Lvl ${user.level} Scholar`;
  }
}

// Instantiate and initialize on DOM content load
document.addEventListener("DOMContentLoaded", () => {
  window.app = new GuruJiApp();
  window.app.init();
});
