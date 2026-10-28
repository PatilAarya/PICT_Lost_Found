// Builds the list of claims waiting at the desk.
import { Claim } from '../../../shared/models/Claim.js';
import { FoundItem } from '../../../shared/models/FoundItem.js';
import { User } from '../../../shared/models/User.js';
import { privatePhotos } from './privatePhotos.js';
import { publicItem } from './views.js';

function compareAnswers(claim, item) {
  return item.hiddenDetails.map((detail) => {
    const given = claim.answers.find((answer) => answer.promptKey === detail.promptKey);
    const scored = claim.scores.find((score) => score.promptKey === detail.promptKey);
    return {
      promptKey: detail.promptKey,
      promptText: detail.promptText,
      given: given ? given.text : '',
      expected: detail.answer,
      score: scored ? scored.score : 0,
    };
  });
}

function deskEntry(claim, item, claimant) {
  return {
    id: claim._id,
    serial: claim.serial,
    createdAt: claim.createdAt,
    score: claim.score,
    claimant: claimant
      ? {
          name: claimant.name,
          email: claimant.email,
          department: claimant.department,
          year: claimant.year,
          flagged: claimant.flagged,
        }
      : null,
    item: publicItem(item),
    comparisons: compareAnswers(claim, item),
    photos: privatePhotos(item.images),
  };
}

export async function buildDeskQueue() {
  const claims = await Claim.find({ status: 'awaiting_handler' }).sort({ createdAt: 1 });
  const items = await FoundItem.find({
    _id: { $in: claims.map((claim) => claim.foundItemId) },
  }).select('+hiddenDetails.answer');
  const people = await User.find({ _id: { $in: claims.map((claim) => claim.claimantId) } });
  const itemById = new Map(items.map((item) => [String(item._id), item]));
  const personById = new Map(people.map((person) => [String(person._id), person]));
  return claims.map((claim) =>
    deskEntry(
      claim,
      itemById.get(String(claim.foundItemId)),
      personById.get(String(claim.claimantId))
    )
  );
}

export async function buildReleaseList() {
  const claims = await Claim.find({ status: 'approved', handoverUsedAt: null }).sort({
    createdAt: 1,
  });
  const items = await FoundItem.find({
    _id: { $in: claims.map((claim) => claim.foundItemId) },
    'custody.type': 'desk',
  });
  const people = await User.find({ _id: { $in: claims.map((claim) => claim.claimantId) } }).select(
    'name'
  );
  const itemById = new Map(items.map((item) => [String(item._id), item]));
  const nameById = new Map(people.map((person) => [String(person._id), person.name]));
  return claims
    .filter((claim) => itemById.has(String(claim.foundItemId)))
    .map((claim) => ({
      id: claim._id,
      serial: claim.serial,
      claimantName: nameById.get(String(claim.claimantId)),
      item: publicItem(itemById.get(String(claim.foundItemId))),
      expiresAt: claim.handoverExpiresAt,
    }));
}
