import {FlashCard} from "./flashcard";

export interface FlashCardDeck {
    deckName: string;
    deckInfo: string;
    settings: Record<string, Record<string, string>>;
    tags:  Record<string, string>;
    cards: FlashCard[];
}