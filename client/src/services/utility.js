export const getRoommateCompatibility = async (userProfile, roommateProfile) => {
  // Simulate a delay for "AI" feel
  await new Promise(resolve => setTimeout(resolve, 800));

  // Simple heuristic: check for common keywords or just generate a plausible score
  const profiles = (userProfile + roommateProfile).toLowerCase();
  let score = 75; // Base score

  if (profiles.includes("quiet") && profiles.includes("study")) score += 15;
  if (profiles.includes("clean") && profiles.includes("organized")) score += 10;
  if (profiles.includes("party") && profiles.includes("quiet")) score -= 20;
  
  score = Math.min(100, Math.max(0, score));

  return {
    score,
    reasoning: `Based on your shared preferences for ${profiles.includes("quiet") ? "a quiet environment" : "lifestyle habits"}, you have a ${score > 85 ? "very high" : "solid"} compatibility rating.`,
    tips: "Consider discussing guest policies and cleaning schedules early on to maintain this high sync score."
  };
};

export const getApartmentSummary = async (apartmentDetails) => {
  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 600));

  const details = apartmentDetails.toLowerCase();
  let summary = "This property offers a great balance of location and value. ";

  if (details.includes("gym")) {
    summary += "The premium amenities like the gym make it perfect for staying active between classes. ";
  }
  if (details.includes("pool")) {
    summary += "The resort-style pool area provides a perfect spot for relaxation and socializing. ";
  }
  if (details.includes("campus") || details.includes("mi to")) {
    summary += "Its close proximity to campus is a major time-saver for busy students. ";
  }
  if (details.includes("wifi") || details.includes("furnished")) {
    summary += "Being student-ready with essential utilities makes for a stress-free move-in. ";
  }

  summary += "Overall, a top-tier choice for student living.";

  return summary;
};
