// The secret questions asked about a found item, grouped by category.
// A finder answers these when posting; later a claimant answers them
// blind (without seeing the photos) during the owner check in Verify.
// getHiddenDetailPrompts is registered as a shared service in index.js,
// so Verify can call services.getHiddenDetailPrompts(category) without
// importing this file directly.

const PROMPTS_BY_CATEGORY = {
  id_card: [
    { promptKey: 'name_spelling', promptText: 'How is the name on the card spelt, first and last?' },
    { promptKey: 'photo_detail', promptText: 'Describe one detail of the photo on the card.' },
  ],
  phone: [
    { promptKey: 'wallpaper', promptText: 'Describe the lock-screen wallpaper.' },
    { promptKey: 'case', promptText: 'Describe the phone case, if there is one.' },
    { promptKey: 'mark', promptText: 'Describe any crack, scratch or sticker on the phone.' },
  ],
  laptop: [
    { promptKey: 'stickers', promptText: 'Describe any stickers on the laptop lid.' },
    { promptKey: 'wallpaper', promptText: 'Describe the desktop wallpaper, if visible.' },
    { promptKey: 'case', promptText: 'Describe the laptop bag or sleeve, if there is one.' },
  ],
  wallet: [
    { promptKey: 'contents', promptText: 'Name one card or item inside, without stating an exact number.' },
    { promptKey: 'material', promptText: 'Describe the wallet material and colour in detail.' },
  ],
  keys: [
    { promptKey: 'keychain', promptText: 'Describe the keychain or any charm on the keys.' },
    { promptKey: 'count', promptText: 'How many keys are on the ring, and what kind are they?' },
  ],
  bottle: [
    { promptKey: 'mark', promptText: 'Describe any sticker, dent or mark on the bottle.' },
    { promptKey: 'cap', promptText: 'What colour is the cap, if different from the body?' },
  ],
  bag: [
    { promptKey: 'tag', promptText: 'Describe any sticker, tag or keychain attached to the bag.' },
    { promptKey: 'contents', promptText: 'Name one item inside the bag, without naming anything valuable in detail.' },
  ],
  earbuds: [
    { promptKey: 'case_mark', promptText: 'Describe any mark, sticker or scratch on the charging case.' },
    { promptKey: 'brand', promptText: 'What brand or model are they, if known?' },
  ],
  books: [
    { promptKey: 'name_mark', promptText: 'Is there a name, roll number or mark written inside?' },
    { promptKey: 'cover', promptText: 'Describe the cover or any bookmark left inside.' },
  ],
  other: [
    { promptKey: 'mark', promptText: 'Describe one distinguishing mark or feature of the item.' },
    { promptKey: 'carried', promptText: 'Describe how or where it was normally carried.' },
  ],
};

// Returns the question list for a category, or the generic list if the
// category is not recognised, so this function never returns nothing.
export function getHiddenDetailPrompts(category) {
  return PROMPTS_BY_CATEGORY[category] || PROMPTS_BY_CATEGORY.other;
}