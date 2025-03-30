// renderer.js - Handles UI and timer logic

// Get elements from DOM
const timeDisplay = document.getElementById('time');
const modeDisplay = document.getElementById('mode');
const startBtn = document.getElementById('start-btn');
const pauseBtn = document.getElementById('pause-btn');
const resetBtn = document.getElementById('reset-btn');
const closeBtn = document.getElementById('close-btn');
const workTimeInput = document.getElementById('work-time');
const breakTimeInput = document.getElementById('break-time');
const sessionCountDisplay = document.getElementById('session-count');
const analogTimer = document.getElementById('analog-timer');
const startTimeDisplay = document.getElementById('start-time');
const endTimeDisplay = document.getElementById('end-time');

// Timer variables
let timer;
let timeLeft = 25 * 60; // Default: 25 minutes in seconds
let isRunning = false;
let isWorkMode = true;
let sessionCount = 0;
let totalTime = 25 * 60; // For analog clock calculation
let startDateTime = null;
let endDateTime = null;

// Draw analog clock
function drawAnalogClock() {
  const ctx = analogTimer.getContext('2d');
  const width = analogTimer.width;
  const height = analogTimer.height;
  const radius = Math.min(width, height) / 2 * 0.9;
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height);
  
  // Draw clock face
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.stroke();
  
  // Draw clock center
  ctx.beginPath();
  ctx.arc(centerX, centerY, 1, 0, 2 * Math.PI);
  ctx.fillStyle = '#fff';
  ctx.fill();
  
  // Draw only the 4 main marks at 12, 3, 6, 9 for smaller clock
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI / 2);
    
    const startX = centerX + radius * 0.9 * Math.sin(angle);
    const startY = centerY - radius * 0.9 * Math.cos(angle);
    
    const endX = centerX + radius * Math.sin(angle);
    const endY = centerY - radius * Math.cos(angle);
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  
  // Draw minute hand to represent remaining time
  const progress = 1 - (timeLeft / totalTime);
  const minuteAngle = progress * 2 * Math.PI - Math.PI / 2;
  
  // Minute hand
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(
    centerX + radius * 0.8 * Math.cos(minuteAngle),
    centerY + radius * 0.8 * Math.sin(minuteAngle)
  );
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 1;
  ctx.stroke();
}

// Update time display
function updateDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  modeDisplay.textContent = isWorkMode ? 'WORK' : 'BREAK';
  
  // Update start and end time displays
  if (startDateTime) {
    const formattedStartTime = formatDateTime(startDateTime);
    startTimeDisplay.textContent = formattedStartTime;
  } else {
    startTimeDisplay.textContent = "--:--:--";
  }
  
  if (endDateTime) {
    const formattedEndTime = formatDateTime(endDateTime);
    endTimeDisplay.textContent = formattedEndTime;
  } else {
    endTimeDisplay.textContent = "--:--:--";
  }
  
  drawAnalogClock();
}

// Format date to HH:MM:SS
function formatDateTime(date) {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

// Start timer
function startTimer() {
  if (isRunning) return;
  
  // Set start time if this is a fresh start
  if (!isRunning && !startDateTime) {
    startDateTime = new Date();
    
    // Calculate end time
    endDateTime = new Date(startDateTime.getTime() + (timeLeft * 1000));
  } else if (!isRunning) {
    // Recalculate end time when resuming
    endDateTime = new Date(Date.now() + (timeLeft * 1000));
  }
  
  isRunning = true;
  timer = setInterval(() => {
    timeLeft--;
    updateDisplay();
    
    if (timeLeft <= 0) {
      clearInterval(timer);
      isRunning = false;
      
      // Toggle mode and reset timer
      if (isWorkMode) {
        // Work period completed
        isWorkMode = false;
        sessionCount++;
        sessionCountDisplay.textContent = sessionCount;
        timeLeft = breakTimeInput.value * 60;
        totalTime = timeLeft;
        window.electronAPI.timerComplete('work');
        // Add visual and audio cues
        document.body.style.backgroundColor = '#fff';
        document.body.style.color = '#000';
        setTimeout(() => {
          document.body.style.backgroundColor = '#000';
          document.body.style.color = '#fff';
        }, 500);
      } else {
        // Break period completed
        isWorkMode = true;
        timeLeft = workTimeInput.value * 60;
        totalTime = timeLeft;
        window.electronAPI.timerComplete('break');
        // Add visual and audio cues
        document.body.style.backgroundColor = '#fff';
        document.body.style.color = '#000';
        setTimeout(() => {
          document.body.style.backgroundColor = '#000';
          document.body.style.color = '#fff';
        }, 500);
      }
      
      // Reset times for next session
      startDateTime = new Date();
      endDateTime = new Date(startDateTime.getTime() + (timeLeft * 1000));
      
      updateDisplay();
      startTimer(); // Automatically start next timer
    }
  }, 1000);
}

// Pause timer
function pauseTimer() {
  clearInterval(timer);
  isRunning = false;
  // We don't reset start/end times when pausing, just stop the countdown
}

// Reset timer
function resetTimer() {
  clearInterval(timer);
  isRunning = false;
  isWorkMode = true;
  timeLeft = workTimeInput.value * 60;
  totalTime = timeLeft;
  startDateTime = null;
  endDateTime = null;
  updateDisplay();
}

// Event listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', pauseTimer);
resetBtn.addEventListener('click', resetTimer);
closeBtn.addEventListener('click', () => window.electronAPI.closeApp());

// Settings change events
workTimeInput.addEventListener('change', () => {
  if (isWorkMode && !isRunning) {
    timeLeft = workTimeInput.value * 60;
    totalTime = timeLeft;
    updateDisplay();
  }
});

breakTimeInput.addEventListener('change', () => {
  if (!isWorkMode && !isRunning) {
    timeLeft = breakTimeInput.value * 60;
    totalTime = timeLeft;
    updateDisplay();
  }
});

// Initialize display and analog clock
totalTime = workTimeInput.value * 60;
updateDisplay();