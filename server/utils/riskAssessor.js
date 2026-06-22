/**
 * Calculates safety risk score and reason codes based on rule matrix.
 * Rules:
 * - Night Time (6 PM - 6 AM): +20
 * - Battery Below 20%: +20
 * - Active Emergency: +50
 * - No Movement for 20 Minutes: +10
 * 
 * Max score: 100
 */
const calculateRiskScore = (batteryLevel, isEmergencyActive, lastMovementTimestamp) => {
  let score = 0;
  const reasons = [];

  // Rule 1: Night time check (6 PM to 6 AM)
  const currentHour = new Date().getHours();
  if (currentHour >= 18 || currentHour < 6) {
    score += 20;
    reasons.push('Night Time Zone (+20)');
  }

  // Rule 2: Low Battery check (below 20%)
  if (batteryLevel < 20) {
    score += 20;
    reasons.push('Critical Battery Below 20% (+20)');
  }

  // Rule 3: Active Emergency Check
  if (isEmergencyActive) {
    score += 50;
    reasons.push('SOS Alert Triggered (+50)');
  }

  // Rule 4: Stationary for 20+ minutes
  if (lastMovementTimestamp) {
    const elapsedMinutes = (Date.now() - new Date(lastMovementTimestamp).getTime()) / (1000 * 60);
    if (elapsedMinutes >= 20) {
      score += 10;
      reasons.push('Stationary/No Movement for 20+ Minutes (+10)');
    }
  }

  // Cap at 100
  score = Math.min(score, 100);

  // Categories
  let level = 'Safe';
  let badgeColor = 'green'; // Tailwind matching styles

  if (score > 60) {
    level = 'High Risk';
    badgeColor = 'red';
  } else if (score > 30) {
    level = 'Moderate';
    badgeColor = 'yellow';
  }

  return {
    score,
    level,
    badgeColor,
    reasons,
  };
};

module.exports = { calculateRiskScore };
