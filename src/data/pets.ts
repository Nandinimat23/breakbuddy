import type { PetDefinition } from "../types";
import buddyImage from "../assets/pets/buddy.jpg";
import mittensImage from "../assets/pets/mittens.jpg";

/**
 * Pet catalogue. Adding a third pet later is just adding another
 * entry here — nothing else in the app needs to change.
 */
export const PETS: PetDefinition[] = [
  {
    id: "dog",
    name: "Buddy",
    emoji: "🐶",
    image: buddyImage,
    tagline: "The energetic pup",
    personality: ["Cheerful", "Energetic", "Encouraging"],
    messages: {
      intro: [
        "Hey! Break time! 🐾",
        "Your body called. It wants a tiny break.",
        "30 seconds. That's all I need!",
        "Come on, let's move!",
      ],
      completion: [
        "Yay! We did it! 🎉",
        "Nice work!",
        "Break complete!",
        "That was quick!",
        "Your future self says thanks.",
      ],
    },
  },
  {
    id: "cat",
    name: "Mittens",
    emoji: "🐱",
    image: mittensImage,
    tagline: "The playful cat",
    personality: ["Playful", "Slightly sarcastic", "Cute"],
    messages: {
      intro: [
        "Break time, hooman. 🐾",
        "Even I stretch more than you.",
        "30 seconds. Try to keep up.",
        "Let's make it fun.",
      ],
      completion: [
        "Not bad, hooman.",
        "Okay, that was actually fun.",
        "Break complete. You may return to your screen.",
        "Purr-fect.",
      ],
    },
  },
];

export function getPet(id: string | null | undefined): PetDefinition {
  return PETS.find((p) => p.id === id) ?? PETS[0];
}

export function randomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}
