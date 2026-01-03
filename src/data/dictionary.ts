const WORDS = [
  "apple",
  "brave",
  "candy",
  "daisy",
  "eagle",
  "flame",
  "grape",
  "house",
  "ivory",
  "joker",
];

export function getRandomWord(): string {
  const index = Math.floor(Math.random() * WORDS.length);
  return WORDS[index];
}
