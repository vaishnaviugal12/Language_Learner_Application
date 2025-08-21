// utils/topicGenerator.js
const TOPICS = [
  "Describe your hometown",
  "Favorite food and how to cook it",
  "A memorable trip",
  "Daily routine",
  "Hobbies and why you like them",
  "Dream job and why",
  "A book/movie you recommend",
  "Cultural festivals in your country",
  "Talk about your favorite childhood memory",
  "Technology that changed your life"
];

export function generateTopic() {
  const idx = Math.floor(Math.random() * TOPICS.length);
  return TOPICS[idx];
}
