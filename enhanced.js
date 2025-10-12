
// enhanced.js — Add-on for ULTRA leaderboard

document.addEventListener("DOMContentLoaded", () => {
  const TEAMS = ["ULTRA1", "ULTRA2", "ULTRA3"];
  const TARGET_PER_HOUR = 4000;
  const START_TIME = new Date();
  START_TIME.setHours(9, 0, 0, 0);

  let logs = JSON.parse(localStorage.getItem("enhancedLogs") || "{}");
  if (Object.keys(logs).length === 0) {
    TEAMS.forEach(team => logs[team] = []);
  }

  const updateDisplay = () => {
    const now = new Date();
    const elapsedMs = now - START_TIME;
    const elapsedHours = Math.max(elapsedMs / (1000 * 60 * 60), 0);
    const targetParts = elapsedHours * TARGET_PER_HOUR;
    const totalTarget = TARGET_PER_HOUR * 9;

    TEAMS.forEach(team => {
      const partsInput = document.getElementById(team + "-parts");
      const parts = parseFloat(partsInput?.value || 0);
      const status = document.getElementById(team + "-status");
      const progress = document.getElementById(team + "-progress");

      if (!status || !progress) return;

      const difference = parts - targetParts;
      const diffText = difference >= 0
        ? `${difference.toFixed(0)} parts ahead`
        : `${Math.abs(difference).toFixed(0)} parts behind`;
      const diffMinutes = Math.abs(difference / TARGET_PER_HOUR * 60);
      const timeDiffText = difference >= 0
        ? `${diffMinutes.toFixed(0)} minutes ahead`
        : `${diffMinutes.toFixed(0)} minutes behind`;

      status.textContent = `(${diffText}, ${timeDiffText})`;
      status.style.color = difference >= 0 ? "green" : "red";

      // Animated progress bar fill
      const progressPercent = Math.min((parts / totalTarget) * 100, 100);
      progress.style.transition = "width 1s ease";
      progress.style.width = progressPercent + "%";
      progress.style.backgroundColor = difference >= 0 ? "#4CAF50" : "#f44336";

      // Log tracking
      const nowTime = now.toLocaleTimeString([], {hour: "2-digit", minute: "2-digit"});
      const teamLogs = logs[team] || [];
      const lastEntry = teamLogs[teamLogs.length - 1];
      const lastParts = lastEntry ? lastEntry.parts : 0;
      const lastTime = lastEntry ? lastEntry.time : nowTime;

      if (parts !== lastParts) {
        const hoursSinceLast = ((now - new Date(`1970-01-01T${lastTime}:00`)) / (1000 * 60 * 60)) || 1;
        const speed = (parts - lastParts) / hoursSinceLast;
        let trend = "→";
        let color = "black";
        if (lastEntry && speed > lastEntry.speed) { trend = "↑"; color = "green"; }
        else if (lastEntry && speed < lastEntry.speed) { trend = "↓"; color = "red"; }

        teamLogs.push({time: nowTime, parts, speed, trend, color});
        if (teamLogs.length > 3) teamLogs.shift();
        logs[team] = teamLogs;
        localStorage.setItem("enhancedLogs", JSON.stringify(logs));

        // Update visible log
        const logContainer = document.getElementById(team + "-log");
        if (logContainer) {
          logContainer.innerHTML = "";
          teamLogs.slice(-3).forEach(entry => {
            const line = document.createElement("div");
            line.innerHTML = `${entry.time}: ${entry.parts} parts (${entry.speed.toFixed(0)} p/h) <span style='color:${entry.color}'>${entry.trend}</span>`;
            logContainer.appendChild(line);
          });
        }
      }
    });
  };

  // Auto-refresh every 30 seconds
  setInterval(updateDisplay, 30000);
  updateDisplay();

  // Daily reset confirmation
  const now = new Date();
  if (now.getHours() === 9 && now.getMinutes() < 5) {
    if (confirm("New day detected. Reset all production logs?")) {
      localStorage.removeItem("enhancedLogs");
      logs = {};
      TEAMS.forEach(team => logs[team] = []);
      alert("Logs have been reset for a new production day.");
    }
  }
});
