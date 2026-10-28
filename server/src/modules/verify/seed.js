// Adds demo items, claims and custody logs.
import { FoundItem } from '../../shared/models/FoundItem.js';
import { Claim } from '../../shared/models/Claim.js';
import { User } from '../../shared/models/User.js';
import { Flag } from './models/Flag.js';
import { appendEntry } from './services/custodyChain.js';
import { codeExpiry, hashCode } from './services/handoverCode.js';
import { DEMO_CODE, ITEM_COUNT, STATUS_BY_STORY, custodySteps, itemPlan } from './seedData.js';

const HOUR_MS = 60 * 60 * 1000;
const CLAIM_STATUS_BY_STORY = {
  released: 'released',
  awaiting: 'awaiting_handler',
  approved: 'approved',
  rejected: 'rejected',
};

async function loadPeople() {
  const students = await User.find({ role: 'student' }).sort({ email: 1 });
  const handler = await User.findOne({ role: 'handler' }).sort({ email: 1 });
  return { students, handler };
}

function addStep(plan, action, hours, actor) {
  const ts = new Date(plan.createdAt.getTime() + hours * HOUR_MS);
  return appendEntry({
    itemId: plan.itemId,
    action,
    actorId: actor._id,
    actorRole: actor.role,
    ts,
  });
}

async function seedItem(plan, finder, handler) {
  const item = await FoundItem.create({
    serial: plan.serial,
    finderId: finder._id,
    category: plan.category,
    title: plan.title,
    location: plan.location,
    foundAt: plan.foundAt,
    custody: {
      type: plan.custodyType,
      deskId: plan.custodyType === 'desk' ? 'security-main-gate' : undefined,
    },
    hiddenDetails: plan.hiddenDetails,
    status: STATUS_BY_STORY[plan.story],
  });
  await FoundItem.collection.updateOne({ _id: item._id }, { $set: { createdAt: plan.createdAt } });
  plan.itemId = item._id;
  for (const [action, hours] of custodySteps(plan.story)) {
    const actor = ['POSTED', 'DROPPED_AT_DESK'].includes(action) ? finder : handler;
    await addStep(plan, action, hours, actor);
  }
}

async function seedClaim(plan, claimant, handler) {
  const status = CLAIM_STATUS_BY_STORY[plan.story];
  const serial = `PICT-C-${String(900000 + plan.index)}`;
  const answers = plan.hiddenDetails.map((detail) => ({
    promptKey: detail.promptKey,
    text: detail.answer,
  }));
  const claim = {
    serial,
    foundItemId: plan.itemId,
    claimantId: claimant._id,
    status,
    answers,
    attemptsUsed: 1,
    score: status === 'rejected' ? 0.74 : 1,
    scores: answers.map((answer) => ({ promptKey: answer.promptKey, score: 1 })),
    itemStatusBefore: 'in_custody',
  };
  if (status !== 'awaiting_handler') {
    Object.assign(claim, {
      decidedBy: handler._id,
      decisionNote: status === 'rejected' ? 'Could not describe the photo inside' : 'Answers match',
    });
  }
  if (status === 'approved') {
    Object.assign(claim, {
      handoverCodeHash: hashCode(DEMO_CODE),
      handoverCodePlain: DEMO_CODE,
      handoverExpiresAt: codeExpiry(),
    });
  }
  if (status === 'released') {
    Object.assign(claim, {
      handoverUsedAt: new Date(plan.createdAt.getTime() + 30 * HOUR_MS),
      releasedAt: new Date(plan.createdAt.getTime() + 30 * HOUR_MS),
    });
  }
  await Claim.create(claim);
  await addStep(plan, 'CLAIM_SUBMITTED', 3, claimant);
  await addStep(plan, 'VERIFICATION_PASSED', 3.1, claimant);
  if (status === 'approved' || status === 'released') await addStep(plan, 'APPROVED', 5, handler);
  if (status === 'rejected') await addStep(plan, 'REJECTED', 5, handler);
  if (status === 'released') await addStep(plan, 'RELEASED', 30, handler);
}

async function seedFlag(student) {
  if (!(await Flag.exists({ userId: student._id }))) {
    await Flag.create({
      userId: student._id,
      reason: 'failed_checks',
      details: '4 failed owner checks in 7 days',
    });
    await User.updateOne({ _id: student._id }, { $set: { flagged: true } });
  }
}

export default async function seed() {
  const { students, handler } = await loadPeople();
  if (students.length < 3 || !handler) return;
  const now = new Date();
  for (let index = 1; index <= ITEM_COUNT; index++) {
    const plan = itemPlan(index, now);
    if (await FoundItem.exists({ serial: plan.serial })) continue;
    const finder = students[index % students.length];
    const claimant = students[(index + 1) % students.length];
    await seedItem(plan, finder, handler);
    if (CLAIM_STATUS_BY_STORY[plan.story]) await seedClaim(plan, claimant, handler);
  }
  await seedFlag(students[students.length - 1]);
}
