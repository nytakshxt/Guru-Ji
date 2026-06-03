// Local Storage Database Manager for Guru Ji Platform

const INITIAL_DB = {
  user: {
    name: "Ishaan Sharma",
    avatar: "IS",
    level: 12,
    xp: 8450,
    nextLevelXp: 10000,
    streak: 8,
    lastActiveDate: "2026-06-02",
    completedTopicsCount: 28,
    studyHoursThisWeek: 14.5,
    streakHistory: ["2026-05-27", "2026-05-28", "2026-05-29", "2026-05-30", "2026-05-31", "2026-06-01", "2026-06-02", "2026-06-03"],
    subjectProgress: {
      Mathematics: 75,
      Physics: 60,
      Chemistry: 45,
      Biology: 80,
      "Computer Science": 90,
      English: 85,
      "General Knowledge": 70
    }
  },
  
  questions: {
    Mathematics: [
      {
        id: "m1",
        difficulty: "Easy",
        question: "What is the value of the derivative of f(x) = 3x^2 + 5x - 2 at x = 2?",
        options: ["11", "17", "12", "15"],
        answer: 1, // index 1 = "17"
        explanation: [
          "Find the general derivative f'(x) using the power rule: d/dx(x^n) = n*x^(n-1).",
          "f'(x) = d/dx(3x^2) + d/dx(5x) - d/dx(2) = 6x + 5.",
          "Substitute x = 2 into f'(x): f'(2) = 6(2) + 5 = 12 + 5 = 17.",
          "Hence, the correct answer is 17."
        ]
      },
      {
        id: "m2",
        difficulty: "Medium",
        question: "If a matrix A has dimensions 3x4 and matrix B has dimensions 4x2, what are the dimensions of the product matrix AB?",
        options: ["4x4", "3x2", "2x3", "Cannot be multiplied"],
        answer: 1, // "3x2"
        explanation: [
          "Matrix multiplication between A (m x n) and B (p x q) is defined only if n = p.",
          "Here, n (columns of A) = 4, and p (rows of B) = 4. Since 4 = 4, they can be multiplied.",
          "The dimensions of the product matrix AB will be m x q, which represents (rows of A) x (columns of B).",
          "Thus, the dimensions are 3x2."
        ]
      },
      {
        id: "m3",
        difficulty: "Hard",
        question: "Evaluate the integral: ∫ (0 to 1) xe^(x^2) dx.",
        options: ["e - 1", "(e - 1)/2", "e/2", "2e - 1"],
        answer: 1, // "(e - 1)/2"
        explanation: [
          "Use the method of u-substitution. Let u = x^2. Thus, du = 2x dx, which means x dx = du / 2.",
          "Change the limits of integration: when x = 0, u = 0. When x = 1, u = 1^2 = 1.",
          "Rewrite the integral in terms of u: ∫ (0 to 1) e^u * (du / 2) = 0.5 * ∫ (0 to 1) e^u du.",
          "Integrate e^u: 0.5 * [e^u] from 0 to 1 = 0.5 * (e^1 - e^0) = 0.5 * (e - 1).",
          "This equals (e - 1)/2."
        ]
      }
    ],
    Physics: [
      {
        id: "p1",
        difficulty: "Easy",
        question: "A car accelerates uniformly from rest to a speed of 20 m/s in 5 seconds. What is the acceleration of the car?",
        options: ["2 m/s^2", "4 m/s^2", "10 m/s^2", "100 m/s^2"],
        answer: 1, // "4 m/s^2"
        explanation: [
          "Use the first kinematic equation: v = u + at, where v is final velocity, u is initial velocity, a is acceleration, and t is time.",
          "Substitute the given variables: v = 20 m/s, u = 0 m/s (from rest), t = 5 s.",
          "20 = 0 + a(5) => 5a = 20.",
          "Solving for acceleration yields a = 4 m/s^2."
        ]
      },
      {
        id: "p2",
        difficulty: "Medium",
        question: "What is the equivalent resistance of two 6-ohm resistors connected in parallel?",
        options: ["12 Ω", "6 Ω", "3 Ω", "1.5 Ω"],
        answer: 2, // "3 Ω"
        explanation: [
          "For parallel resistors, the formula is: 1/R_eq = 1/R_1 + 1/R_2.",
          "Substitute values: 1/R_eq = 1/6 + 1/6 = 2/6 = 1/3.",
          "Invert the fraction to find R_eq: R_eq = 3 Ω.",
          "Alternative rule: When two identical resistors are in parallel, their equivalent resistance is exactly half of the individual value (6 / 2 = 3 Ω)."
        ]
      }
    ],
    Chemistry: [
      {
        id: "c1",
        difficulty: "Medium",
        question: "Which of the following compounds is formed during the addition of HBr to propene in the presence of organic peroxides (anti-Markovnikov's rule)?",
        options: ["1-Bromopropane", "2-Bromopropane", "1,2-Dibromopropane", "Cyclopropane"],
        answer: 0, // "1-Bromopropane"
        explanation: [
          "Normally, addition of HBr to an unsymmetrical alkene follows Markovnikov's rule (Br adds to the carbon with fewer hydrogens).",
          "However, the presence of peroxides changes the mechanism to free-radical addition.",
          "This yields anti-Markovnikov addition, where the bromine radical attacks the terminal carbon to form a more stable secondary carbon radical.",
          "Therefore, H adds to the middle carbon and Br adds to the end carbon, forming 1-bromopropane."
        ]
      }
    ],
    Biology: [
      {
        id: "b1",
        difficulty: "Easy",
        question: "Which organelle is known as the powerhouse of the cell?",
        options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi Apparatus"],
        answer: 2, // "Mitochondria"
        explanation: [
          "Mitochondria are membrane-bound organelles that generate most of the chemical energy needed to power the cell's biochemical reactions.",
          "This chemical energy is stored in a small molecule called adenosine triphosphate (ATP).",
          "Because of their role in ATP synthesis, mitochondria are nicknamed the 'powerhouses' of cells."
        ]
      }
    ],
    "Computer Science": [
      {
        id: "cs1",
        difficulty: "Medium",
        question: "What is the time complexity of searching for an element in a balanced Binary Search Tree (BST) of size N in the worst case?",
        options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
        answer: 1, // "O(log N)"
        explanation: [
          "In a balanced BST, the height of the tree is bounded by log_2(N).",
          "At each node comparison during search, we discard half of the remaining nodes.",
          "Hence, the maximum number of comparisons needed is proportional to the height of the tree, which is O(log N).",
          "If the tree were unbalanced (skewed), the worst-case search complexity would be O(N)."
        ]
      }
    ],
    English: [
      {
        id: "e1",
        difficulty: "Easy",
        question: "Identify the correct word to fill in the blank: 'Neither the teacher nor the students ____ present at the seminar.'",
        options: ["was", "were", "is", "has been"],
        answer: 1, // "were"
        explanation: [
          "When two subjects are joined by 'neither... nor', the verb must agree with the subject closest to it.",
          "The subject closest to the blank is 'students', which is plural.",
          "Therefore, the verb must also be plural. 'were' fits the past tense plural context correctly."
        ]
      }
    ],
    "General Knowledge": [
      {
        id: "g1",
        difficulty: "Medium",
        question: "Which country is known as the Land of the Rising Sun?",
        options: ["China", "Japan", "South Korea", "Thailand"],
        answer: 1, // "Japan"
        explanation: [
          "Japan is located to the east of China (the direction from which the sun rises).",
          "The Japanese name for Japan is 'Nihon' or 'Nippon', which literally translates to 'origin of the sun'.",
          "Hence, it is globally referred to as the 'Land of the Rising Sun'."
        ]
      }
    ]
  },
  
  papers: [
    {
      id: "p-jee-2025",
      exam: "IIT-JEE Advanced",
      subject: "Physics & Chemistry",
      year: "2025",
      difficulty: "Hard",
      downloads: 4120,
      questionsCount: 54,
      details: "Official IIT-JEE Advanced Paper 1 containing high-level conceptual mechanics, electrodynamics, organic reaction cascades, and thermodynamics questions."
    },
    {
      id: "p-neet-2025",
      exam: "NEET",
      subject: "Biology & Chemistry",
      year: "2025",
      difficulty: "Medium",
      downloads: 6850,
      questionsCount: 180,
      details: "Complete National Eligibility cum Entrance Test question bank targeting plant physiology, human genetics, organic chemistry kinetics, and basic physical equations."
    },
    {
      id: "p-sat-2024",
      exam: "SAT",
      subject: "Mathematics & English",
      year: "2024",
      difficulty: "Medium",
      downloads: 3200,
      questionsCount: 98,
      details: "Digital SAT mock test simulating the official format. Includes linear equations, quadratic word problems, context-based vocabulary, and argument analysis."
    },
    {
      id: "p-cbse-12-2025",
      exam: "CBSE Class 12 Boards",
      subject: "Mathematics",
      year: "2025",
      difficulty: "Medium",
      downloads: 5120,
      questionsCount: 38,
      details: "Class 12 Board examinations physics and mathematics papers including calculus proofs, vector geometry, three-dimensional spaces, and probability distributions."
    }
  ],
  
  planner: [
    { id: "task-1", text: "Revise electrodynamics formulas", done: true, subject: "Physics", date: "2026-06-03" },
    { id: "task-2", text: "Solve 5 calculus integration questions", done: false, subject: "Mathematics", date: "2026-06-03" },
    { id: "task-3", text: "Read plant kingdom summary notes", done: false, subject: "Biology", date: "2026-06-03" },
    { id: "task-4", text: "Complete BST search complexity quiz", done: true, subject: "Computer Science", date: "2026-06-02" },
    { id: "task-5", text: "Practice English concord questions", done: true, subject: "English", date: "2026-06-02" }
  ],

  notes: [
    {
      id: "n-1",
      title: "Newtonian Mechanics Core Formulas",
      subject: "Physics",
      summary: "Summary of force equations, kinematics, momentum conservation, and mechanical energy theorems.\n\n### Key Concepts\n- **Newton's Second Law**: F = ma (Force is rate of change of momentum).\n- **Work-Energy Theorem**: W_net = ΔK (Work done equals change in kinetic energy).\n- **Conservation of Linear Momentum**: In the absence of external forces, total momentum remains constant.\n\n### Core Equations\n1. Kinematics: v = u + at, s = ut + 0.5at^2, v^2 = u^2 + 2as\n2. Friction: f_max = μ * N (where N is normal force)\n3. Work: W = F * d * cos(θ)\n4. Kinetic Energy: K = 0.5 * m * v^2\n5. Potential Energy: U = m * g * h",
      flashcards: [
        { front: "What is Newton's Second Law?", back: "F = ma (Force equals mass times acceleration)" },
        { front: "State the Work-Energy Theorem.", back: "The net work done on an object equals its change in kinetic energy (W = ΔK)" },
        { front: "Formula for centripetal acceleration?", back: "a_c = v^2 / r" }
      ]
    },
    {
      id: "n-2",
      title: "Cell Division & Mitosis Phases",
      subject: "Biology",
      summary: "Overview of cell cycle stages, chromatin condensation, spindle formation, chromosome alignment, and cytokinesis.\n\n### Phases of Mitosis\n1. **Prophase**: Chromatin condenses into visible chromosomes. Nucleolus and nuclear envelope disappear. Mitotic spindle starts forming.\n2. **Metaphase**: Chromosomes line up along the equatorial plate (metaphase plate). Spindle fibers attach to kinetochores.\n3. **Anaphase**: Sister chromatids are pulled apart by spindle fibers toward opposite poles of the cell.\n4. **Telophase**: Chromosomes arrive at poles and decondense. Nuclear envelopes re-form around each set of chromosomes.",
      flashcards: [
        { front: "In which phase do sister chromatids separate?", back: "Anaphase" },
        { front: "What happens during Metaphase?", back: "Chromosomes line up along the center (metaphase plate) of the cell" },
        { front: "Name the four main phases of Mitosis.", back: "Prophase, Metaphase, Anaphase, Telophase (PMAT)" }
      ]
    }
  ]
};

class GuruJiDB {
  constructor() {
    this.key = "guruji_dashboard_db";
    this.init();
  }

  init() {
    if (!localStorage.getItem(this.key)) {
      localStorage.setItem(this.key, JSON.stringify(INITIAL_DB));
    }
  }

  getData() {
    return JSON.parse(localStorage.getItem(this.key)) || INITIAL_DB;
  }

  saveData(data) {
    localStorage.setItem(this.key, JSON.stringify(data));
    // Trigger storage event manually to keep open contexts in sync
    window.dispatchEvent(new Event('storage'));
  }

  getUser() {
    return this.getData().user;
  }

  updateUser(updates) {
    const data = this.getData();
    data.user = { ...data.user, ...updates };
    this.saveData(data);
    return data.user;
  }

  addXp(amount) {
    const data = this.getData();
    let user = data.user;
    user.xp += amount;
    
    // Level up check
    while (user.xp >= user.nextLevelXp) {
      user.level += 1;
      user.xp -= user.nextLevelXp;
      user.nextLevelXp = Math.floor(user.nextLevelXp * 1.25);
    }
    
    this.saveData(data);
    return user;
  }

  getQuestions(subject) {
    const all = this.getData().questions;
    return all[subject] || [];
  }

  getPapers() {
    return this.getData().papers;
  }

  getPlanner() {
    return this.getData().planner;
  }

  togglePlannerTask(taskId) {
    const data = this.getData();
    const task = data.planner.find(t => t.id === taskId);
    if (task) {
      task.done = !task.done;
      this.saveData(data);
      // Give XP on task completion
      if (task.done) {
        this.addXp(150);
      } else {
        this.addXp(-150); // deduct if unchecked
      }
    }
    return data.planner;
  }

  addPlannerTask(text, subject, date) {
    const data = this.getData();
    const newTask = {
      id: "task-" + Date.now(),
      text,
      done: false,
      subject,
      date: date || new Date().toISOString().split('T')[0]
    };
    data.planner.push(newTask);
    this.saveData(data);
    this.addXp(50); // XP for setting up planner
    return newTask;
  }

  getNotes() {
    return this.getData().notes;
  }

  addNote(title, subject, summary, flashcards) {
    const data = this.getData();
    const newNote = {
      id: "n-" + Date.now(),
      title,
      subject,
      summary,
      flashcards: flashcards || []
    };
    data.notes.push(newNote);
    this.saveData(data);
    this.addXp(300); // Higher XP for creating notes/summaries
    return newNote;
  }
}

// Export a singleton instance globally
window.db = new GuruJiDB();
console.log("Guru Ji Mock DB initialized successfully.");
