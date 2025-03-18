// Color Vision Trainer Application
const ColorVisionTrainer = {
  // Current exercise state
  currentExercise: {
    mode: null,
    targetColor: null,
    userColor: null,
    shades: [],
    correctOrder: [],
    ishiharaNumber: null,
    colorName: null,
    colorOptions: [],
    selectedOption: null,
  },

  // User data structure
  userData: {
    name: "",
    sessions: 0,
    lastSession: null,
    streak: 0,
    exercisesCompleted: 0,
    colorMatching: {
      attempts: 0,
      correct: 0,
      scores: [],
    },
    shadeSorting: {
      attempts: 0,
      correct: 0,
      scores: [],
    },
    ishihara: {
      attempts: 0,
      correct: 0,
      scores: [],
    },
    colorNaming: {
      attempts: 0,
      correct: 0,
      scores: [],
    },
    settings: {
      difficulty: "medium",
      colorType: "all",
      soundEnabled: true,
    },
  },

  // Initialization method
  init: function () {
    this.loadUserData();
    this.updateSessionStats();
    this.setupEventListeners();
    this.checkStreak();
  },

  // Load saved user data from localStorage
  loadUserData: function () {
    const savedData = localStorage.getItem("colorVisionTrainerData");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        this.userData = { ...this.userData, ...parsedData };

        // Apply saved settings
        document.getElementById("difficulty").value =
          this.userData.settings.difficulty;
        document.getElementById("color-type").value =
          this.userData.settings.colorType;
        document.getElementById("sound-enabled").checked =
          this.userData.settings.soundEnabled;
      } catch (e) {
        console.error("Error loading saved data:", e);
      }
    } else {
      // First time user - show welcome modal
      this.showModal(
        "Welcome to ColorVision Trainer!",
        `<p>This app helps you practice color recognition and discrimination skills. Regular practice may help improve your ability to distinguish colors.</p>
                <p>Choose an exercise from the home screen to get started.</p>
                <p><strong>Note:</strong> This is not a medical application. If you have concerns about your vision, please consult a healthcare professional.</p>`,
        "Get Started",
        null
      );
    }
  },

  // Save user data to localStorage
  saveUserData: function () {
    try {
      localStorage.setItem(
        "colorVisionTrainerData",
        JSON.stringify(this.userData)
      );
    } catch (e) {
      console.error("Error saving data:", e);
    }
  },

  // Set up event listeners for UI interactions
  setupEventListeners: function () {
    // Navigation buttons
    document
      .getElementById("go-home")
      .addEventListener("click", () => this.showScreen("home-screen"));
    document
      .getElementById("view-progress")
      .addEventListener("click", () => this.showScreen("progress-screen"));
    document
      .getElementById("clear-data")
      .addEventListener("click", () => this.confirmReset());

    // Mode selection
    const modeCards = document.querySelectorAll(".mode-card");
    modeCards.forEach((card) => {
      card.addEventListener("click", () => {
        const mode = card.dataset.mode;
        this.startExercise(mode);
      });
    });

    // Settings change
    document.getElementById("difficulty").addEventListener("change", (e) => {
      this.userData.settings.difficulty = e.target.value;
      this.saveUserData();
    });

    document.getElementById("color-type").addEventListener("change", (e) => {
      this.userData.settings.colorType = e.target.value;
      this.saveUserData();
    });

    document.getElementById("sound-enabled").addEventListener("change", (e) => {
      this.userData.settings.soundEnabled = e.target.checked;
      this.saveUserData();
    });

    // Modal close button
    document.querySelector(".close-modal").addEventListener("click", () => {
      document.getElementById("modal").classList.remove("show");
    });

    // Color matching exercise
    document
      .getElementById("red-slider")
      .addEventListener("input", (e) => this.updateUserColor());
    document
      .getElementById("green-slider")
      .addEventListener("input", (e) => this.updateUserColor());
    document
      .getElementById("blue-slider")
      .addEventListener("input", (e) => this.updateUserColor());
    document
      .getElementById("submit-match")
      .addEventListener("click", () => this.checkColorMatch());
    document
      .getElementById("reveal-target")
      .addEventListener("click", () => this.revealTargetColor());
    document
      .getElementById("next-color")
      .addEventListener("click", () => this.startColorMatching());

    // Shade sorting exercise
    document
      .getElementById("check-order")
      .addEventListener("click", () => this.checkShadeOrder());
    document
      .getElementById("reset-shades")
      .addEventListener("click", () => this.resetShades());
    document
      .getElementById("next-shades")
      .addEventListener("click", () => this.startShadeSorting());

    // Ishihara test
    document
      .getElementById("submit-ishihara")
      .addEventListener("click", () => this.checkIshiharaAnswer());
    document
      .getElementById("reveal-ishihara")
      .addEventListener("click", () => this.revealIshiharaAnswer());
    document
      .getElementById("next-ishihara")
      .addEventListener("click", () => this.startIshiharaTest());

    // Color naming
    document
      .getElementById("submit-naming")
      .addEventListener("click", () => this.checkColorNaming());
    document
      .getElementById("reveal-naming")
      .addEventListener("click", () => this.revealColorName());
    document
      .getElementById("next-naming")
      .addEventListener("click", () => this.startColorNaming());
  },

  // Check Ishihara test answer
  checkIshiharaAnswer: function () {
    this.playSound("click");
    const userAnswer = parseInt(
      document.getElementById("ishihara-answer").value
    );
    const correctAnswer = this.currentExercise.ishiharaNumber;

    // Validate input
    if (isNaN(userAnswer)) {
      alert("Please enter a valid number.");
      return;
    }

    const success = userAnswer === correctAnswer;

    // Update user data
    this.userData.ishihara.attempts += 1;
    if (success) {
      this.userData.ishihara.correct += 1;
      this.playSound("success");
    } else {
      this.playSound("error");
    }

    this.userData.ishihara.scores.push(success ? 100 : 0);
    this.userData.exercisesCompleted += 1;
    this.saveUserData();

    // Show feedback
    const feedback = document.getElementById("ishihara-feedback");
    feedback.innerHTML = success
      ? `<p>Correct! The number was ${correctAnswer}.</p>`
      : `<p>Incorrect. The correct number was ${correctAnswer}.</p>`;

    feedback.classList.remove("hidden", "success", "error");
    feedback.classList.add(success ? "success" : "error");

    this.updateSessionStats();
  },

  // Helper function to create simple number patterns for Ishihara test
  createNumberPattern: function (number, x, y, radius, dotSize) {
    // Convert coordinates to be centered at (0,0) with radius 1
    const cx = (x - radius) / radius;
    const cy = (y - radius) / radius;

    // Number shapes (very simplified)
    switch (number) {
      case 1:
        return Math.abs(cx) < 0.05 && cy < 0.5 && cy > -0.7;
      case 2:
        return (
          (Math.abs(cx - 0.3 * Math.sin((Math.PI * (cy + 0.7)) / 1.2)) < 0.15 &&
            cy < 0.5 &&
            cy > -0.7) ||
          (Math.abs(cy - 0.5) < 0.1 && cx < 0.3 && cx > -0.3) ||
          (Math.abs(cy + 0.7) < 0.1 && cx < 0.3 && cx > -0.3)
        );
      case 3:
        return (
          (Math.abs(cy - 0.5) < 0.1 && cx < 0.3 && cx > -0.1) ||
          (Math.abs(cy) < 0.1 && cx < 0.3 && cx > -0.1) ||
          (Math.abs(cy + 0.5) < 0.1 && cx < 0.3 && cx > -0.1) ||
          (Math.abs(cx - 0.3) < 0.1 && cy < 0.6 && cy > -0.1) ||
          (Math.abs(cx - 0.3) < 0.1 && cy < 0.1 && cy > -0.6)
        );
      case 4:
        return (
          (Math.abs(cx + 0.2) < 0.1 && cy < 0.5 && cy > -0.2) ||
          (Math.abs(cy - 0) < 0.1 && cx < 0.4 && cx > -0.3) ||
          (Math.abs(cx - 0.3) < 0.1 && cy < 0.5 && cy > -0.5)
        );
      case 5:
        return (
          (Math.abs(cy - 0.5) < 0.1 && cx < 0.3 && cx > -0.3) ||
          (Math.abs(cy) < 0.1 && cx < 0.3 && cx > -0.3) ||
          (Math.abs(cy + 0.5) < 0.1 && cx < 0.3 && cx > -0.3) ||
          (Math.abs(cx - 0.3) < 0.1 && cy < 0.5 && cy > 0) ||
          (Math.abs(cx + 0.3) < 0.1 && cy < 0 && cy > -0.5)
        );
      case 6:
        return (
          (Math.abs(cx) < 0.25 &&
            Math.abs(cy - 0.15) < 0.35 &&
            !(Math.abs(cx) < 0.15 && Math.abs(cy - 0.15) < 0.25)) ||
          (Math.abs(cx + 0.15) < 0.1 && cy < 0.5 && cy > -0.5)
        );
      case 7:
        return (
          (Math.abs(cy - 0.5) < 0.1 && cx < 0.3 && cx > -0.3) ||
          (Math.abs(cx - 0.3) < 0.1 && cy < 0.5 && cy > -0.5) ||
          (Math.abs(cx) < 0.1 && cy < 0 && cy > -0.5)
        );
      case 8:
        return (
          (Math.abs(cx) < 0.25 &&
            Math.abs(cy - 0.25) < 0.25 &&
            !(Math.abs(cx) < 0.15 && Math.abs(cy - 0.25) < 0.15)) ||
          (Math.abs(cx) < 0.25 &&
            Math.abs(cy + 0.25) < 0.25 &&
            !(Math.abs(cx) < 0.15 && Math.abs(cy + 0.25) < 0.15))
        );
      case 9:
        return (
          (Math.abs(cx) < 0.25 &&
            Math.abs(cy - 0.15) < 0.35 &&
            !(Math.abs(cx) < 0.15 && Math.abs(cy - 0.15) < 0.25)) ||
          (Math.abs(cx - 0.15) < 0.1 && cy < 0.5 && cy > -0.5)
        );
      default:
        return false;
    }
  },

  // Show a specific screen
  showScreen: function (screenId) {
    const screens = document.querySelectorAll(".screen");
    screens.forEach((screen) => {
      screen.classList.remove("active");
    });
    document.getElementById(screenId).classList.add("active");
  },

  // Show modal dialog
  showModal: function (title, content, confirmText, onConfirm) {
    const modal = document.getElementById("modal");
    document.getElementById("modal-title").textContent = title;
    document.getElementById("modal-body").innerHTML = content;

    const confirmBtn = document.getElementById("modal-confirm");
    confirmBtn.textContent = confirmText || "OK";

    if (onConfirm) {
      confirmBtn.onclick = onConfirm;
      document.getElementById("modal-cancel").style.display = "block";
    } else {
      confirmBtn.onclick = () => modal.classList.remove("show");
      document.getElementById("modal-cancel").style.display = "none";
    }

    modal.classList.add("show");
  },

  // Check user streak
  checkStreak: function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!this.userData.lastSession) {
      return;
    }

    const lastSession = new Date(this.userData.lastSession);
    lastSession.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastSession.getTime() === yesterday.getTime()) {
      // Consecutive day, increment streak
      this.userData.streak += 1;
      this.userData.lastSession = today.toISOString();
      this.saveUserData();
    } else if (lastSession.getTime() < yesterday.getTime()) {
      // Streak broken
      this.userData.streak = 1;
      this.userData.lastSession = today.toISOString();
      this.saveUserData();
    }
  },

  // Update session statistics
  updateSessionStats: function () {
    // Implement logic to update various UI elements with session statistics
    document.getElementById("session-count").textContent =
      this.userData.sessions;

    // Calculate overall accuracy
    const totalAttempts =
      this.userData.colorMatching.attempts +
      this.userData.shadeSorting.attempts +
      this.userData.ishihara.attempts +
      this.userData.colorNaming.attempts;

    const totalCorrect =
      this.userData.colorMatching.correct +
      this.userData.shadeSorting.correct +
      this.userData.ishihara.correct +
      this.userData.colorNaming.correct;

    const accuracy =
      totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    document.getElementById("accuracy").textContent = `${accuracy}%`;
  },

  // Utility method to get random value
  getRandomValue: function (min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Method to reveal and hide target color
  revealTargetColorTemporarily: function (duration = 1000) {
    const targetColor = document.getElementById("target-color");

    // Show the target color
    targetColor.style.opacity = 1;

    // Disable any interaction with the color matching elements
    const matchingControls = document.querySelectorAll(
      "#color-matching-controls input, #color-matching-controls button"
    );
    matchingControls.forEach((control) => {
      control.disabled = true;
    });

    // Set a timeout to hide the color and re-enable controls
    setTimeout(() => {
      targetColor.style.opacity = 0;

      // Re-enable controls
      matchingControls.forEach((control) => {
        control.disabled = false;
      });
    }, duration);
  },

  // Modified startColorMatching method to use the new reveal method
  startColorMatching: function () {
    // Hide feedback panel
    document.getElementById("match-feedback").classList.add("hidden");

    // Reset color sliders
    document.getElementById("red-slider").value = 128;
    document.getElementById("green-slider").value = 128;
    document.getElementById("blue-slider").value = 128;

    // Update RGB value displays
    document.getElementById("red-value").textContent = 128;
    document.getElementById("green-value").textContent = 128;
    document.getElementById("blue-value").textContent = 128;

    // Generate target color based on difficulty and color type
    const colorType = this.userData.settings.colorType;
    const difficulty = this.userData.settings.difficulty;

    let r, g, b;

    // Color generation logic
    switch (colorType) {
      case "red-green":
        r = this.getRandomValue(0, 255);
        g = this.getRandomValue(0, 255);
        b = this.getRandomValue(0, 100);
        break;
      case "blue-yellow":
        r = this.getRandomValue(150, 255);
        g = this.getRandomValue(150, 255);
        b = this.getRandomValue(0, 255);
        break;
      case "monochromatic":
        const base = this.getRandomValue(0, 255);
        const variation =
          difficulty === "easy" ? 50 : difficulty === "medium" ? 30 : 15;
        r = this.getRandomValue(
          Math.max(0, base - variation),
          Math.min(255, base + variation)
        );
        g = this.getRandomValue(
          Math.max(0, base - variation),
          Math.min(255, base + variation)
        );
        b = this.getRandomValue(
          Math.max(0, base - variation),
          Math.min(255, base + variation)
        );
        break;
      default: // 'all'
        r = this.getRandomValue(0, 255);
        g = this.getRandomValue(0, 255);
        b = this.getRandomValue(0, 255);
    }

    // Store target color
    this.currentExercise.targetColor = { r, g, b };

    // Update target color display
    const targetColor = document.getElementById("target-color");
    targetColor.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
    targetColor.style.opacity = 1; // Keep target color visible

    // Update user color display
    this.updateUserColor();
  },

  startShadeSorting: function () {
    // Hide feedback panel
    document.getElementById("sorting-feedback").classList.add("hidden");

    // Clear previous shades
    const shadeContainer = document.getElementById("shade-container");
    shadeContainer.innerHTML = "";

    // Generate base color based on color type
    const colorType = this.userData.settings.colorType;
    let baseColor;

    switch (colorType) {
      case "red-green":
        baseColor = {
          r: this.getRandomValue(100, 255),
          g: this.getRandomValue(100, 255),
          b: this.getRandomValue(0, 50),
        };
        break;
      case "blue-yellow":
        baseColor = {
          r: this.getRandomValue(150, 255),
          g: this.getRandomValue(150, 255),
          b: this.getRandomValue(50, 255),
        };
        break;
      case "monochromatic":
        const value = this.getRandomValue(50, 200);
        baseColor = { r: value, g: value, b: value };
        break;
      default: // 'all'
        baseColor = {
          r: this.getRandomValue(50, 200),
          g: this.getRandomValue(50, 200),
          b: this.getRandomValue(50, 200),
        };
    }

    // Generate shades based on difficulty
    const difficulty = this.userData.settings.difficulty;
    const shadeCount =
      difficulty === "easy" ? 4 : difficulty === "medium" ? 6 : 8;

    const shades = [];
    for (let i = 0; i < shadeCount; i++) {
      // Create a shade that's slightly different from the base color
      // The amount of difference decreases with increasing difficulty
      const diffFactor =
        difficulty === "easy" ? 30 : difficulty === "medium" ? 20 : 10;

      const shade = {
        r: Math.min(
          255,
          Math.max(
            0,
            baseColor.r + this.getRandomValue(-diffFactor, diffFactor)
          )
        ),
        g: Math.min(
          255,
          Math.max(
            0,
            baseColor.g + this.getRandomValue(-diffFactor, diffFactor)
          )
        ),
        b: Math.min(
          255,
          Math.max(
            0,
            baseColor.b + this.getRandomValue(-diffFactor, diffFactor)
          )
        ),
        // Calculate brightness using relative luminance formula (simplified)
        get brightness() {
          return 0.299 * this.r + 0.587 * this.g + 0.114 * this.b;
        },
      };

      shades.push(shade);
    }

    // Sort shades by brightness to get correct order
    shades.sort((a, b) => a.brightness - b.brightness);
    this.currentExercise.correctOrder = [...shades];

    // Shuffle shades for display
    const shuffledShades = this.shuffleArray([...shades]);
    this.currentExercise.shades = shuffledShades;

    // Create shade elements
    shuffledShades.forEach((shade, index) => {
      const shadeElement = document.createElement("div");
      shadeElement.className = "shade-swatch";
      shadeElement.dataset.index = index;
      shadeElement.style.backgroundColor = `rgb(${shade.r}, ${shade.g}, ${shade.b})`;

      // Add drag functionality
      shadeElement.draggable = true;
      shadeElement.addEventListener(
        "dragstart",
        this.handleDragStart.bind(this)
      );
      shadeElement.addEventListener("dragover", this.handleDragOver.bind(this));
      shadeElement.addEventListener(
        "dragenter",
        this.handleDragEnter.bind(this)
      );
      shadeElement.addEventListener(
        "dragleave",
        this.handleDragLeave.bind(this)
      );
      shadeElement.addEventListener("drop", this.handleDrop.bind(this));
      shadeElement.addEventListener("dragend", this.handleDragEnd.bind(this));

      shadeContainer.appendChild(shadeElement);
    });
  },

  // Ishihara Test Exercise
  startIshiharaTest: function () {
    // Hide feedback panel
    document.getElementById("ishihara-feedback").classList.add("hidden");

    // Clear previous answer
    document.getElementById("ishihara-answer").value = "";

    // Generate random number for the test
    const number = this.getRandomValue(1, 9);
    this.currentExercise.ishiharaNumber = number;

    // Get color scheme based on color type setting
    const colorType = this.userData.settings.colorType;
    let foregroundColor, backgroundColor;

    switch (colorType) {
      case "red-green":
        foregroundColor = `rgb(${this.getRandomValue(
          180,
          255
        )}, ${this.getRandomValue(50, 100)}, ${this.getRandomValue(50, 100)})`;
        backgroundColor = `rgb(${this.getRandomValue(
          50,
          100
        )}, ${this.getRandomValue(180, 255)}, ${this.getRandomValue(50, 100)})`;
        break;
      case "blue-yellow":
        foregroundColor = `rgb(${this.getRandomValue(
          180,
          255
        )}, ${this.getRandomValue(180, 255)}, ${this.getRandomValue(50, 100)})`;
        backgroundColor = `rgb(${this.getRandomValue(
          50,
          100
        )}, ${this.getRandomValue(50, 100)}, ${this.getRandomValue(180, 255)})`;
        break;
      case "monochromatic":
        const fgValue = this.getRandomValue(50, 150);
        const bgValue = this.getRandomValue(fgValue + 50, 230);
        foregroundColor = `rgb(${fgValue}, ${fgValue}, ${fgValue})`;
        backgroundColor = `rgb(${bgValue}, ${bgValue}, ${bgValue})`;
        break;
      default: // 'all'
        foregroundColor = `rgb(${this.getRandomValue(
          150,
          255
        )}, ${this.getRandomValue(50, 150)}, ${this.getRandomValue(50, 150)})`;
        backgroundColor = `rgb(${this.getRandomValue(
          50,
          150
        )}, ${this.getRandomValue(150, 255)}, ${this.getRandomValue(50, 150)})`;
    }

    // Adjust difficulty by making colors more similar
    const difficulty = this.userData.settings.difficulty;
    if (difficulty === "medium" || difficulty === "hard") {
      // Parse colors to adjust them
      const fgParts = foregroundColor.match(/\d+/g).map(Number);
      const bgParts = backgroundColor.match(/\d+/g).map(Number);

      // Adjust each RGB component to be closer
      const blendFactor = difficulty === "medium" ? 0.3 : 0.5;

      const newFg = fgParts.map((val, i) => {
        return Math.round(val * (1 - blendFactor) + bgParts[i] * blendFactor);
      });

      const newBg = bgParts.map((val, i) => {
        return Math.round(val * (1 - blendFactor) + fgParts[i] * blendFactor);
      });

      foregroundColor = `rgb(${newFg[0]}, ${newFg[1]}, ${newFg[2]})`;
      backgroundColor = `rgb(${newBg[0]}, ${newBg[1]}, ${newBg[2]})`;
    }

    // Create a simple Ishihara-like plate
    const plate = document.getElementById("ishihara-plate");
    plate.innerHTML = "";
    plate.style.backgroundColor = backgroundColor;

    // Create dots
    const dotCount = 200;
    const plateSize = Math.min(plate.offsetWidth, plate.offsetHeight);
    const radius = plateSize / 2;
    const dotSize = plateSize / 30;

    // Generate points in a circle
    for (let i = 0; i < dotCount; i++) {
      const dot = document.createElement("div");
      dot.style.position = "absolute";
      dot.style.width = `${dotSize}px`;
      dot.style.height = `${dotSize}px`;
      dot.style.borderRadius = "50%";

      // Random position within circle
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * radius * 0.9; // Keep within 90% of radius

      const x = radius + Math.cos(angle) * distance;
      const y = radius + Math.sin(angle) * distance;

      dot.style.left = `${x - dotSize / 2}px`;
      dot.style.top = `${y - dotSize / 2}px`;

      // Determine if dot should be part of the number pattern
      // This is a simplified approach - real Ishihara plates use more complex patterns
      const numberPattern = this.createNumberPattern(
        number,
        x,
        y,
        radius,
        dotSize
      );

      dot.style.backgroundColor = numberPattern
        ? foregroundColor
        : backgroundColor;

      // Add some random noise dots with varying colors
      if (!numberPattern && Math.random() < 0.7) {
        // Random color variation of background
        const r = this.getRandomValue(
          Math.max(0, bgParts[0] - 40),
          Math.min(255, bgParts[0] + 40)
        );
        const g = this.getRandomValue(
          Math.max(0, bgParts[1] - 40),
          Math.min(255, bgParts[1] + 40)
        );
        const b = this.getRandomValue(
          Math.max(0, bgParts[2] - 40),
          Math.min(255, bgParts[2] + 40)
        );

        dot.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
      }

      plate.appendChild(dot);
    }
  },

  // Reset shade order to initial shuffled state
  resetShades: function () {
    this.playSound("click");
    document.getElementById("sorting-feedback").classList.add("hidden");

    // Reset borders
    const shadeElements = document.querySelectorAll(".shade-swatch");
    shadeElements.forEach((el) => {
      el.style.border = "2px solid transparent";
    });

    // Reshuffle and redraw
    this.startShadeSorting();
  },

  // Check if the shades are in the correct order
  checkShadeOrder: function () {
    this.playSound("click");
    const currentOrder = this.currentExercise.shades;
    const correctOrder = this.currentExercise.correctOrder;

    // Compare each shade's brightness
    let correctCount = 0;
    const userOrder = currentOrder.map((shade) => shade.brightness);

    // Calculate how many are in the correct position
    for (let i = 0; i < userOrder.length - 1; i++) {
      if (userOrder[i] < userOrder[i + 1]) {
        correctCount++;
      }
    }

    // Calculate score as percentage of correct positions
    const score = Math.round((correctCount / (userOrder.length - 1)) * 100);
    const success = score >= 75; // At least 75% correct

    // Update user data
    this.userData.shadeSorting.attempts += 1;
    if (success) {
      this.userData.shadeSorting.correct += 1;
      this.playSound("success");
    } else {
      this.playSound("error");
    }

    this.userData.shadeSorting.scores.push(score);
    this.userData.exercisesCompleted += 1;
    this.saveUserData();

    // Show feedback
    const feedback = document.getElementById("sorting-feedback");
    feedback.innerHTML = `
            <p>Your score: <strong>${score}</strong>/100</p>
            <p>Correctly ordered pairs: ${correctCount}/${
      userOrder.length - 1
    }</p>
        `;

    feedback.classList.remove("hidden", "success", "error");
    feedback.classList.add(success ? "success" : "error");

    // Highlight correct and incorrect positions
    const shadeElements = document.querySelectorAll(".shade-swatch");
    for (let i = 0; i < shadeElements.length - 1; i++) {
      const current = parseInt(shadeElements[i].dataset.index);
      const next = parseInt(shadeElements[i + 1].dataset.index);

      if (currentOrder[current].brightness < currentOrder[next].brightness) {
        shadeElements[i].style.border = "2px solid #2ecc71";
      } else {
        shadeElements[i].style.border = "2px solid #e74c3c";
      }
    }

    // Last element has no next to compare with
    const lastIndex = shadeElements.length - 1;
    if (lastIndex >= 0) {
      shadeElements[lastIndex].style.border = "2px solid #3498db";
    }

    this.updateSessionStats();
  },

  // Color Naming Exercise
  startColorNaming: function () {
    // Hide feedback panel
    document.getElementById("naming-feedback").classList.add("hidden");

    // Generate a color based on settings
    const colorType = this.userData.settings.colorType;
    let r, g, b;

    switch (colorType) {
      case "red-green":
        r = this.getRandomValue(0, 255);
        g = this.getRandomValue(0, 255);
        b = this.getRandomValue(0, 100);
        break;
      case "blue-yellow":
        r = this.getRandomValue(150, 255);
        g = this.getRandomValue(150, 255);
        b = this.getRandomValue(0, 255);
        break;
      case "monochromatic":
        const value = this.getRandomValue(0, 255);
        r = g = b = value;
        break;
      default: // 'all'
        r = this.getRandomValue(0, 255);
        g = this.getRandomValue(0, 255);
        b = this.getRandomValue(0, 255);
    }

    // Set the color
    const colorBox = document.getElementById("naming-color");
    colorBox.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;

    // Find the closest named color
    const colorName = this.findClosestNamedColor(r, g, b);
    this.currentExercise.colorName = colorName;

    // Generate options based on difficulty
    const difficulty = this.userData.settings.difficulty;
    const optionCount =
      difficulty === "easy" ? 4 : difficulty === "medium" ? 6 : 8;

    let options = [colorName];

    // Add similar but incorrect options
    while (options.length < optionCount) {
      // Get a random color name that's not already in options
      let randomColor = this.getRandomNamedColor();
      while (options.includes(randomColor)) {
        randomColor = this.getRandomNamedColor();
      }
      options.push(randomColor);
    }

    // Shuffle options
    options = this.shuffleArray(options);
    this.currentExercise.colorOptions = options;

    // Create option elements
    const optionsContainer = document.getElementById(
      "naming-options-container"
    );
    optionsContainer.innerHTML = "";

    options.forEach((option, index) => {
      const optionElement = document.createElement("div");
      optionElement.className = "color-option";
      optionElement.textContent = option;
      optionElement.dataset.index = index;

      optionElement.addEventListener("click", () => {
        // Deselect all options
        document.querySelectorAll(".color-option").forEach((el) => {
          el.classList.remove("selected");
        });

        // Select this option
        optionElement.classList.add("selected");
        this.currentExercise.selectedOption = option;
      });

      optionsContainer.appendChild(optionElement);
    });

    // Reset selection
    this.currentExercise.selectedOption = null;
  },

  // Reveal the Ishihara answer
  revealIshiharaAnswer: function () {
    this.playSound("click");
    const correctAnswer = this.currentExercise.ishiharaNumber;

    // Show the answer in a modal
    this.showModal(
      "Ishihara Test Answer",
      `<p>The correct number is: <strong>${correctAnswer}</strong></p>`,
      "Close"
    );
  },

  // Check color naming answer
  checkColorNaming: function () {
    this.playSound("click");
    const selectedOption = this.currentExercise.selectedOption;
    const correctAnswer = this.currentExercise.colorName;

    // Validate selection
    if (!selectedOption) {
      alert("Please select a color name.");
      return;
    }

    const success = selectedOption === correctAnswer;

    // Update user data
    this.userData.colorNaming.attempts += 1;
    if (success) {
      this.userData.colorNaming.correct += 1;
      this.playSound("success");
    } else {
      this.playSound("error");
    }

    this.userData.colorNaming.scores.push(success ? 100 : 0);
    this.userData.exercisesCompleted += 1;
    this.saveUserData();

    // Show feedback
    const feedback = document.getElementById("naming-feedback");
    feedback.innerHTML = success
      ? `<p>Correct! The color is ${correctAnswer}.</p>`
      : `<p>Incorrect. The color is ${correctAnswer}.</p>`;

    feedback.classList.remove("hidden", "success", "error");
    feedback.classList.add(success ? "success" : "error");

    // Highlight correct option
    document.querySelectorAll(".color-option").forEach((el) => {
      if (el.textContent === correctAnswer) {
        el.style.border = "2px solid #2ecc71";
      } else if (el.textContent === selectedOption && !success) {
        el.style.border = "2px solid #e74c3c";
      }
    });

    this.updateSessionStats();
  },

  handleDragStart: function (e) {
    e.target.classList.add("dragging");
    e.dataTransfer.setData("text/plain", e.target.dataset.index);
  },

  handleDragOver: function (e) {
    e.preventDefault();
  },

  handleDragEnter: function (e) {
    e.preventDefault();
    e.target.classList.add("drag-over");
  },

  handleDragLeave: function (e) {
    e.target.classList.remove("drag-over");
  },

  handleDrop: function (e) {
    e.preventDefault();
    e.target.classList.remove("drag-over");

    const sourceIndex = parseInt(e.dataTransfer.getData("text/plain"));
    const targetIndex = parseInt(e.target.dataset.index);

    if (sourceIndex === targetIndex) return;

    // Swap shades in the array
    const shades = this.currentExercise.shades;
    const temp = shades[sourceIndex];
    shades[sourceIndex] = shades[targetIndex];
    shades[targetIndex] = temp;

    // Update DOM and data-index attributes
    const shadeElements = document.querySelectorAll(".shade-swatch");
    shadeElements[sourceIndex].dataset.index = targetIndex;
    shadeElements[targetIndex].dataset.index = sourceIndex;

    // Swap elements in the DOM
    const container = document.getElementById("shade-container");
    const sourceElement = shadeElements[sourceIndex];
    const targetElement = shadeElements[targetIndex];

    const sourceNext = sourceElement.nextSibling;
    const targetNext = targetElement.nextSibling;

    if (sourceNext === targetElement) {
      container.insertBefore(targetElement, sourceElement);
    } else if (targetNext === sourceElement) {
      container.insertBefore(sourceElement, targetElement);
    } else {
      const sourceClone = sourceElement.cloneNode(true);
      const targetClone = targetElement.cloneNode(true);

      container.replaceChild(sourceClone, targetElement);
      container.replaceChild(targetClone, sourceElement);

      // Re-add event listeners
      this.addDragListeners(sourceClone);
      this.addDragListeners(targetClone);
    }
  },

  // Helper method to add drag listeners
  addDragListeners: function (element) {
    element.addEventListener("dragstart", this.handleDragStart.bind(this));
    element.addEventListener("dragover", this.handleDragOver.bind(this));
    element.addEventListener("dragenter", this.handleDragEnter.bind(this));
    element.addEventListener("dragleave", this.handleDragLeave.bind(this));
    element.addEventListener("drop", this.handleDrop.bind(this));
    element.addEventListener("dragend", this.handleDragEnd.bind(this));
  },

  handleDragEnd: function (e) {
    e.target.classList.remove("dragging");
  },

  playSound: function (type) {
    if (!this.userData.settings.soundEnabled) return;

    const sounds = {
      success: [440, 554.37, 659.25],
      error: [440, 415.3, 391.99],
      click: [600],
    };

    if (!sounds[type]) return;

    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    sounds[type].forEach((freq, i) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.value = freq;
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5
      );

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(audioContext.currentTime + i * 0.1);
      oscillator.stop(audioContext.currentTime + 0.5 + i * 0.1);
    });
  },

  shuffleArray: function (array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  generateRecommendations: function () {
    const recommendationsList = document.getElementById("recommendations-list");
    recommendationsList.innerHTML = ""; // Clear previous recommendations

    const totalExercises = this.userData.exercisesCompleted;

    if (totalExercises < 5) {
      recommendationsList.innerHTML =
        "<p>Complete more exercises to get personalized recommendations.</p>";
      return;
    }

    // Implement recommendation logic based on user performance
    // Example recommendation generation
    const accuracies = [
      {
        mode: "Color Matching",
        value: this.calculateAccuracy("colorMatching"),
      },
      { mode: "Shade Sorting", value: this.calculateAccuracy("shadeSorting") },
      { mode: "Ishihara Test", value: this.calculateAccuracy("ishihara") },
      { mode: "Color Naming", value: this.calculateAccuracy("colorNaming") },
    ];

    // Sort by lowest accuracy
    accuracies.sort((a, b) => a.value - b.value);

    let recommendations = "";

    if (accuracies[0].value < 0.7) {
      recommendations += `<p>Focus on <strong>${accuracies[0].mode}</strong> exercises to improve your weakest area.</p>`;
    }

    recommendationsList.innerHTML =
      recommendations ||
      "<p>You're doing great! Keep practicing to maintain your skills.</p>";
  },

  calculateAccuracy: function (mode) {
    const modeData = this.userData[mode];
    return modeData.attempts > 0 ? modeData.correct / modeData.attempts : 1;
  },

  confirmReset: function () {
    this.showModal(
      "Reset All Data?",
      "This will erase all your progress and settings. This action cannot be undone.",
      "Reset Data",
      () => {
        localStorage.removeItem("colorVisionTrainerData");
        this.userData = {
          name: "",
          sessions: 0,
          lastSession: null,
          streak: 0,
          exercisesCompleted: 0,
          colorMatching: { attempts: 0, correct: 0, scores: [] },
          shadeSorting: { attempts: 0, correct: 0, scores: [] },
          ishihara: { attempts: 0, correct: 0, scores: [] },
          colorNaming: { attempts: 0, correct: 0, scores: [] },
          settings: {
            difficulty: "medium",
            colorType: "all",
            soundEnabled: true,
          },
        };

        // Reset UI elements
        document.getElementById("difficulty").value = "medium";
        document.getElementById("color-type").value = "all";
        document.getElementById("sound-enabled").checked = true;

        this.updateSessionStats();
        this.showScreen("home-screen");

        alert("All data has been reset.");
      }
    );
  },

  revealTargetColor: function () {
    const target = this.currentExercise.targetColor;
    document.getElementById("target-color").style.opacity = 1;

    // Show target RGB values in a modal
    this.showModal(
      "Target Color Values",
      `<p>Red: <strong>${target.r}</strong></p>
            <p>Green: <strong>${target.g}</strong></p>
            <p>Blue: <strong>${target.b}</strong></p>`,
      "Close"
    );
  },

  updateUserColor: function () {
    const r = parseInt(document.getElementById("red-slider").value);
    const g = parseInt(document.getElementById("green-slider").value);
    const b = parseInt(document.getElementById("blue-slider").value);

    document.getElementById("red-value").textContent = r;
    document.getElementById("green-value").textContent = g;
    document.getElementById("blue-value").textContent = b;

    document.getElementById(
      "user-color"
    ).style.backgroundColor = `rgb(${r}, ${g}, ${b})`;

    this.currentExercise.userColor = { r, g, b };
  },
  // Modify event listeners to continuously check for color match
  setupColorMatchingListeners: function () {
    const redSlider = document.getElementById("red-slider");
    const greenSlider = document.getElementById("green-slider");
    const blueSlider = document.getElementById("blue-slider");

    const updateAndCheck = () => {
      this.updateUserColor();

      // Check if color is matched
      const isMatched = this.checkColorMatch();

      // If matched, you might want to trigger next color or show success
      if (isMatched) {
        // Disable sliders or show next color button
        redSlider.disabled = true;
        greenSlider.disabled = true;
        blueSlider.disabled = true;

        // Show next color button or automatically proceed
        document.getElementById("next-color").style.display = "block";
      }
    };

    // Add input listeners to sliders
    redSlider.addEventListener("input", updateAndCheck);
    greenSlider.addEventListener("input", updateAndCheck);
    blueSlider.addEventListener("input", updateAndCheck);
  },

  // Check color matching result
  checkColorMatch: function () {
    this.playSound("click");
    const target = this.currentExercise.targetColor;
    const user = this.currentExercise.userColor;

    // Show target color (ensure it's fully visible)
    document.getElementById("target-color").style.opacity = 1;

    // Calculate color difference using Euclidean distance in RGB space
    const diffR = target.r - user.r;
    const diffG = target.g - user.g;
    const diffB = target.b - user.b;

    const distance = Math.sqrt(diffR * diffR + diffG * diffG + diffB * diffB);

    // Define thresholds based on difficulty
    let threshold;
    switch (this.userData.settings.difficulty) {
      case "easy":
        threshold = 60;
        break;
      case "medium":
        threshold = 40;
        break;
      case "hard":
        threshold = 25;
        break;
      default:
        threshold = 40;
    }

    // Calculate score (0-100)
    const score = Math.max(
      0,
      100 - Math.round(distance * (100 / (threshold * 2)))
    );

    // Determine if match is successful
    const success = distance <= threshold;

    // Update user data
    this.userData.colorMatching.attempts += 1;
    if (success) {
      this.userData.colorMatching.correct += 1;
      this.playSound("success");
    } else {
      this.playSound("error");
    }

    this.userData.colorMatching.scores.push(score);
    this.userData.exercisesCompleted += 1;
    this.saveUserData();

    // Show feedback
    const feedback = document.getElementById("match-feedback");
    feedback.innerHTML = `
        <p>Your score: <strong>${score}</strong>/100</p>
        <p>Color difference: ${Math.round(distance)} units</p>
        <p>Target RGB: (${target.r}, ${target.g}, ${target.b})</p>
        <p>Your RGB: (${user.r}, ${user.g}, ${user.b})</p>
    `;

    feedback.classList.remove("hidden", "success", "error");
    feedback.classList.add(success ? "success" : "error");

    this.updateSessionStats();

    // Return success status
    return success;
  },

  // Start an exercise based on mode
  startExercise: function (mode) {
    this.currentExercise.mode = mode;

    // Increment session count if this is the first exercise of the session
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (
      !this.userData.lastSession ||
      new Date(this.userData.lastSession).setHours(0, 0, 0, 0) < today.getTime()
    ) {
      this.userData.sessions += 1;
      this.userData.lastSession = today.toISOString();
      this.saveUserData();
    }

    // Start specific exercise based on mode
    switch (mode) {
      case "color-matching":
        this.showScreen("color-matching-screen");
        this.startColorMatching();
        break;
      case "shade-sorting":
        this.showScreen("shade-sorting-screen");
        this.startShadeSorting();
        break;
      case "ishihara":
        this.showScreen("ishihara-screen");
        this.startIshiharaTest();
        break;
      case "color-naming":
        this.showScreen("color-naming-screen");
        this.startColorNaming();
        break;
    }

    this.updateSessionStats();
  },

  // Get a random named color
  getRandomNamedColor: function () {
    const colorNames = [
      "Red",
      "Green",
      "Blue",
      "Yellow",
      "Cyan",
      "Magenta",
      "White",
      "Black",
      "Gray",
      "Brown",
      "Orange",
      "Pink",
      "Purple",
      "Lime",
      "Teal",
      "Navy",
      "Maroon",
      "Olive",
      "Salmon",
      "Turquoise",
      "Indigo",
      "Gold",
      "Silver",
      "Beige",
      "Lavender",
    ];

    const randomIndex = Math.floor(Math.random() * colorNames.length);
    return colorNames[randomIndex];
  },

  // Find closest named color to RGB values
  findClosestNamedColor: function (r, g, b) {
    // Simple list of common color names with their RGB values
    const namedColors = [
      { name: "Red", r: 255, g: 0, b: 0 },
      { name: "Green", r: 0, g: 255, b: 0 },
      { name: "Blue", r: 0, g: 0, b: 255 },
      { name: "Yellow", r: 255, g: 255, b: 0 },
      { name: "Cyan", r: 0, g: 255, b: 255 },
      { name: "Magenta", r: 255, g: 0, b: 255 },
      { name: "White", r: 255, g: 255, b: 255 },
      { name: "Black", r: 0, g: 0, b: 0 },
      { name: "Gray", r: 128, g: 128, b: 128 },
      { name: "Brown", r: 165, g: 42, b: 42 },
      { name: "Orange", r: 255, g: 165, b: 0 },
      { name: "Pink", r: 255, g: 192, b: 203 },
      { name: "Purple", r: 128, g: 0, b: 128 },
      { name: "Lime", r: 50, g: 205, b: 50 },
      { name: "Teal", r: 0, g: 128, b: 128 },
      { name: "Navy", r: 0, g: 0, b: 128 },
      { name: "Maroon", r: 128, g: 0, b: 0 },
      { name: "Olive", r: 128, g: 128, b: 0 },
      { name: "Salmon", r: 250, g: 128, b: 114 },
      { name: "Turquoise", r: 64, g: 224, b: 208 },
      { name: "Indigo", r: 75, g: 0, b: 130 },
      { name: "Gold", r: 255, g: 215, b: 0 },
      { name: "Silver", r: 192, g: 192, b: 192 },
      { name: "Beige", r: 245, g: 245, b: 220 },
      { name: "Lavender", r: 230, g: 230, b: 250 },
    ];

    // Find closest color by Euclidean distance in RGB space
    let minDistance = Infinity;
    let closestColor = null;

    for (const color of namedColors) {
      const dr = color.r - r;
      const dg = color.g - g;
      const db = color.b - b;

      const distance = Math.sqrt(dr * dr + dg * dg + db * db);

      if (distance < minDistance) {
        minDistance = distance;
        closestColor = color.name;
      }
    }

    return closestColor;
  },

  // Reveal the correct color name
  revealColorName: function () {
    this.playSound("click");
    const correctAnswer = this.currentExercise.colorName;

    // Show the answer in a modal
    this.showModal(
      "Color Name",
      `<p>The color is: <strong>${correctAnswer}</strong></p>`,
      "Close"
    );

    // Highlight correct option
    document.querySelectorAll(".color-option").forEach((el) => {
      if (el.textContent === correctAnswer) {
        el.style.border = "2px solid #2ecc71";
      }
    });
  },
  // Add more methods as needed for specific functionality
};

// Initialize the app when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  ColorVisionTrainer.init();
});
