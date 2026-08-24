import { Prisma } from "@prisma/client";

type CurrentUserForMatch = Prisma.UserGetPayload<{
  include: {
    owned_skills: { include: { skill: true } },
    wanted_skills: { include: { skill: true } }
  }
}>;

type CandidateUserForMatch = Prisma.UserGetPayload<{
  include: {
    owned_skills: { include: { skill: true } },
    wanted_skills: { include: { skill: true } }
  }
}>;

export function calculateMatchScore(currentUser: CurrentUserForMatch, candidate: CandidateUserForMatch): number {
  let score = 0;

  const currentUserOwnedIds = currentUser.owned_skills.map(s => s.skill_id);
  const currentUserWantedIds = currentUser.wanted_skills.map(s => s.skill_id);

  const candidateOwnedIds = candidate.owned_skills.map(s => s.skill_id);
  const candidateWantedIds = candidate.wanted_skills.map(s => s.skill_id);

  // Check reciprocal vs interest
  const candidateCanTeachMe = candidate.owned_skills.filter(s => currentUserWantedIds.includes(s.skill_id));
  const iCanTeachCandidate = currentUser.owned_skills.filter(s => candidateWantedIds.includes(s.skill_id));

  const isReciprocal = candidateCanTeachMe.length > 0 && iCanTeachCandidate.length > 0;
  const isOneWay = candidateCanTeachMe.length > 0 || iCanTeachCandidate.length > 0;

  if (isReciprocal) {
    score += 40;
  } else if (isOneWay) {
    score += 30;
  }

  // Check proficiency of what candidate can teach me (Max 15)
  // If they can teach multiple, we take the highest proficiency score
  let maxProficiencyScore = 0;
  for (const skill of candidateCanTeachMe) {
    let profScore = 0;
    if (skill.proficiency === "ADVANCED") profScore = 15;
    else if (skill.proficiency === "INTERMEDIATE") profScore = 10;
    else if (skill.proficiency === "BEGINNER") profScore = 5;

    if (profScore > maxProficiencyScore) {
      maxProficiencyScore = profScore;
    }
  }
  score += maxProficiencyScore;

  // Trust score points (Max 15)
  // E.g. Trust Score 80 = 80/100 * 15 = 12
  const trustScore = candidate.trust_score || 0;
  // Prevent division by zero or negative just in case
  const normalizedTrustScore = Math.max(0, Math.min(100, trustScore));
  const trustScorePoints = (normalizedTrustScore / 100) * 15;
  score += trustScorePoints;

  // Final score out of 100
  return Math.round(Math.min(100, Math.max(0, score)));
}
