import type { PictureCard, CardType } from "@/types";

// Helper to create card objects
function createCard(
  id: string,
  label: string,
  cardType: CardType,
  categoryIds: string[]
): PictureCard {
  return {
    id,
    label,
    imageUrl: `/cards/${id}.svg`,
    ttsEnabled: true,
    isSystem: true,
    isPublic: true,
    cardType,
    categoryIds,
    createdAt: new Date().toISOString(),
  };
}

// Food cards
export const FOOD_CARDS: PictureCard[] = [
  createCard("cookie", "Cookie", "noun", ["food"]),
  createCard("juice", "Juice", "noun", ["food", "drinks"]),
  createCard("apple", "Apple", "noun", ["food", "fruit"]),
  createCard("banana", "Banana", "noun", ["food", "fruit"]),
  createCard("milk", "Milk", "noun", ["food", "drinks"]),
  createCard("water", "Water", "noun", ["food", "drinks"]),
  createCard("sandwich", "Sandwich", "noun", ["food"]),
  createCard("chips", "Chips", "noun", ["food", "snacks"]),
  createCard("crackers", "Crackers", "noun", ["food", "snacks"]),
  createCard("pizza", "Pizza", "noun", ["food"]),
  createCard("icecream", "Ice Cream", "noun", ["food", "snacks"]),
  createCard("grapes", "Grapes", "noun", ["food", "fruit"]),
  createCard("cheese", "Cheese", "noun", ["food"]),
  createCard("yogurt", "Yogurt", "noun", ["food", "snacks"]),
  createCard("cereal", "Cereal", "noun", ["food"]),
];

// Toy cards
export const TOY_CARDS: PictureCard[] = [
  createCard("ball", "Ball", "noun", ["toys"]),
  createCard("book", "Book", "noun", ["toys", "learning"]),
  createCard("blocks", "Blocks", "noun", ["toys"]),
  createCard("bubbles", "Bubbles", "noun", ["toys"]),
  createCard("car", "Car", "noun", ["toys"]),
  createCard("train", "Train", "noun", ["toys"]),
  createCard("teddy", "Teddy Bear", "noun", ["toys"]),
  createCard("puzzle", "Puzzle", "noun", ["toys", "learning"]),
  createCard("crayons", "Crayons", "noun", ["toys", "art"]),
  createCard("swing", "Swing", "noun", ["toys", "outside"]),
  createCard("doll", "Doll", "noun", ["toys"]),
  createCard("playdough", "Play Dough", "noun", ["toys", "art"]),
];

// Action cards
export const ACTION_CARDS: PictureCard[] = [
  createCard("eat", "Eat", "verb", ["actions"]),
  createCard("drink", "Drink", "verb", ["actions"]),
  createCard("play", "Play", "verb", ["actions"]),
  createCard("help", "Help", "verb", ["actions"]),
  createCard("more", "More", "verb", ["actions"]),
  createCard("stop", "Stop", "verb", ["actions"]),
  createCard("go", "Go", "verb", ["actions"]),
  createCard("open", "Open", "verb", ["actions"]),
  createCard("read", "Read", "verb", ["actions"]),
  createCard("hug", "Hug", "verb", ["actions", "social"]),
  createCard("walk", "Walk", "verb", ["actions"]),
  createCard("jump", "Jump", "verb", ["actions"]),
];

// People cards
export const PEOPLE_CARDS: PictureCard[] = [
  createCard("mom", "Mom", "noun", ["people", "family"]),
  createCard("dad", "Dad", "noun", ["people", "family"]),
  createCard("teacher", "Teacher", "noun", ["people", "school"]),
  createCard("friend", "Friend", "noun", ["people", "social"]),
  createCard("grandma", "Grandma", "noun", ["people", "family"]),
  createCard("grandpa", "Grandpa", "noun", ["people", "family"]),
];

// Feelings cards
export const FEELING_CARDS: PictureCard[] = [
  createCard("happy", "Happy", "adjective", ["feelings"]),
  createCard("sad", "Sad", "adjective", ["feelings"]),
  createCard("hungry", "Hungry", "adjective", ["feelings"]),
  createCard("thirsty", "Thirsty", "adjective", ["feelings"]),
  createCard("tired", "Tired", "adjective", ["feelings"]),
  createCard("hurt", "Hurt", "adjective", ["feelings"]),
];

// Place cards
export const PLACE_CARDS: PictureCard[] = [
  createCard("home", "Home", "noun", ["places"]),
  createCard("school", "School", "noun", ["places"]),
  createCard("park", "Park", "noun", ["places", "outside"]),
  createCard("bathroom", "Bathroom", "noun", ["places"]),
  createCard("outside", "Outside", "noun", ["places"]),
];

// Sentence starter cards
export const STARTER_CARDS: PictureCard[] = [
  createCard("i-want", "I want", "sentence_starter", ["starters"]),
  createCard("i-see", "I see", "sentence_starter", ["starters"]),
  createCard("i-hear", "I hear", "sentence_starter", ["starters"]),
  createCard("i-feel", "I feel", "sentence_starter", ["starters"]),
  createCard("help-me", "Help me", "sentence_starter", ["starters"]),
  createCard("more-please", "More please", "sentence_starter", ["starters"]),
];

// All noun cards (for general selection)
export const ALL_NOUN_CARDS: PictureCard[] = [
  ...FOOD_CARDS,
  ...TOY_CARDS,
  ...PEOPLE_CARDS,
  ...PLACE_CARDS,
];

// All cards combined
export const ALL_CARDS: PictureCard[] = [
  ...FOOD_CARDS,
  ...TOY_CARDS,
  ...ACTION_CARDS,
  ...PEOPLE_CARDS,
  ...FEELING_CARDS,
  ...PLACE_CARDS,
  ...STARTER_CARDS,
];

// Get cards by category
export function getCardsByCategory(categoryId: string): PictureCard[] {
  return ALL_CARDS.filter((card) => card.categoryIds.includes(categoryId));
}

// Get random cards from a set
export function getRandomCards(cards: PictureCard[], count: number): PictureCard[] {
  const shuffled = [...cards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Get a random card
export function getRandomCard(cards: PictureCard[]): PictureCard {
  return cards[Math.floor(Math.random() * cards.length)];
}

// Card categories for UI
export const CARD_CATEGORIES = [
  { id: "food", name: "Food & Drinks", icon: "🍎", color: "#f44336" },
  { id: "toys", name: "Toys & Play", icon: "🧸", color: "#9c27b0" },
  { id: "actions", name: "Actions", icon: "🏃", color: "#2196f3" },
  { id: "people", name: "People", icon: "👨‍👩‍👧", color: "#4caf50" },
  { id: "feelings", name: "Feelings", icon: "😊", color: "#ff9800" },
  { id: "places", name: "Places", icon: "🏠", color: "#795548" },
  { id: "starters", name: "Sentence Starters", icon: "💬", color: "#607d8b" },
];
