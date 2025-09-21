/*
 * WanderNow AI Prototype Script
 * This script powers the simplified itinerary generator. It does not call
 * external services and instead uses a small set of mock data to
 * demonstrate how a personalised trip planner might behave.
 */

// Mock destination data. In a real system these details would come from
// datasets stored in BigQuery or other data warehouses and be enriched
// using generative AI models via Vertex AI / Gemini.
const destinations = [
  {
    name: "Delhi",
    heritage: ["Visit Red Fort", "Explore Qutub Minar", "Stroll in Humayun's Tomb"],
    nightlife: ["Dine at Connaught Place", "Night bazaar at Chandni Chowk"],
    adventure: ["Hot air balloon ride (Delhi NCR)", "Kayaking at Yamuna"],
    costPerDay: 2500,
    baseDays: 2,
  },
  {
    name: "Jaipur",
    heritage: ["Tour the City Palace", "Admire Hawa Mahal", "Visit Amer Fort"],
    nightlife: ["Evening at Chokhi Dhani", "Lively markets of Johari Bazaar"],
    adventure: ["Camel safari", "Elephant ride at Amer"],
    costPerDay: 2000,
    baseDays: 2,
  },
  {
    name: "Goa",
    heritage: ["Old Goa churches tour", "Portuguese heritage walk"],
    nightlife: ["Beach club party", "Night market at Arpora"],
    adventure: ["Water sports at Baga", "Dudhsagar waterfall trek"],
    costPerDay: 3500,
    baseDays: 3,
  },
  {
    name: "Kerala",
    heritage: ["Fort Kochi heritage walk", "Kathakali performance"],
    nightlife: ["Houseboat stay with music", "Local food tour in Kochi"],
    adventure: ["Periyar jungle safari", "Munnar hiking trails"],
    costPerDay: 3000,
    baseDays: 3,
  },
];

// Utility to pick activities based on preferences and avoid repetition.
function pickActivities(place, prefs, days) {
  const plan = [];
  let indices = {};
  // initialise indices for each preference
  prefs.forEach((p) => (indices[p] = 0));
  for (let d = 0; d < days; d++) {
    const pref = prefs[d % prefs.length];
    const activities = place[pref] || [];
    if (activities.length === 0) {
      plan.push({ pref, activity: "Free exploration" });
      continue;
    }
    const idx = indices[pref] % activities.length;
    plan.push({ pref, activity: activities[idx] });
    indices[pref]++;
  }
  return plan;
}

function generateItinerary() {
  const destInput = document.getElementById("dest").value.trim();
  const days = parseInt(document.getElementById("days").value, 10);
  const budget = parseInt(document.getElementById("budget").value, 10);
  const prefElements = document.querySelectorAll('input[name="pref"]:checked');
  const prefs = Array.from(prefElements).map((el) => el.value);
  // Pick destination or default to first one
  let place = destinations.find((d) => d.name.toLowerCase() === destInput.toLowerCase());
  if (!place) {
    // Try partial match
    place = destinations.find((d) => d.name.toLowerCase().includes(destInput.toLowerCase()));
  }
  if (!place) {
    place = destinations[0];
  }
  const itinerary = pickActivities(place, prefs.length > 0 ? prefs : ["heritage"], days);
  // Estimate cost: base cost + 20% for each selected interest.
  const multiplier = 1 + 0.2 * (prefs.length > 0 ? prefs.length : 1);
  const estimatedCostPerDay = Math.round(place.costPerDay * multiplier);
  const totalCost = estimatedCostPerDay * days;

  // Build output HTML
  let outputHtml = `<h2>Suggested itinerary for ${place.name}</h2>`;
  outputHtml += `<p>Estimated total cost: <strong>₹${totalCost.toLocaleString()}</strong> (₹${estimatedCostPerDay.toLocaleString()} per day)</p>`;
  outputHtml += `<div class="itinerary">`;
  itinerary.forEach((day, idx) => {
    outputHtml += `
      <div class="itinerary-day">
        <h3>Day ${idx + 1}: ${day.pref.charAt(0).toUpperCase() + day.pref.slice(1)}</h3>
        <p>${day.activity}</p>
      </div>
    `;
  });
  outputHtml += `</div>`;
  outputHtml += `<div class="cost-breakdown"><p>This is a rough estimate using mock data. In a production system, costs would be fetched from live APIs (flights, hotels, experiences) and optimized using AI.</p></div>`;

  const output = document.getElementById("output");
  output.innerHTML = outputHtml;
  output.classList.remove("hidden");
}

document.getElementById("generateBtn").addEventListener("click", (e) => {
  e.preventDefault();
  generateItinerary();
});