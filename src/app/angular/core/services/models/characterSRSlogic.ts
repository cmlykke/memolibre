import {FlashCard} from "./flashcard";
import {FlashCardDeck} from "./flashcarddeck";

export default interface characterSRSlogic {
    characterSRS: FlashCardDeck;
    currentContent: FlashCard | undefined;
    mostRecentContentObjects: FlashCard[];
    notEnoughCharacters: boolean
}
