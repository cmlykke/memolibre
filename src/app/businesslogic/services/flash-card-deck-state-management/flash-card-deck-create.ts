import { FlashCardDeck } from '../../models/flashcarddeck'; // Update the path as per your application structure
import {FlashCard} from "../../models/flashcard";
import {Result} from '../../../angular/utils/types';
import {FlashCardDeckPracticeSettings} from './flash-card-deck-practice-settings';
import {FlashCardDeckAppSettings} from './flash-card-deck-app-settings'; // Update the path as per your application structure
export class FlashCardDeckCreate {
  public static createNewDeck(newDeckContent: string): [FlashCardDeck | null, Result<string, string>] {
    const lines: string[] = newDeckContent.split('\n').map(line => line.trim());
    let cards: FlashCard[] = [];
    let lineNumAfterSpace = 0;
    let cardNumber = 1;
    let backside = "";
    let frontside = "";
    let secondaryinfo: string[] = [];
    let tags: Record<string, string> = {};
    let currentTags: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const eachline = lines[i];
      const hashCount = this.countInitialHashes(eachline);
      if (eachline.trim().length !== 0 && hashCount === 0) {
        lineNumAfterSpace++;
      }

      if (hashCount > 0) {
        const excessCurrentTags = (currentTags.length - hashCount) + 1;
        if (excessCurrentTags > 0) {
          currentTags = this.removeLastXElements(currentTags, excessCurrentTags);
        }
        const headerWithoutHashtags = eachline.replace(/^#+/, "").trim();
        currentTags.push(headerWithoutHashtags);
      }

      if (hashCount === 0 && eachline.trim().length !== 0) {
        if (lineNumAfterSpace === 1) backside = eachline;
        if (lineNumAfterSpace === 2) frontside = eachline;
        if (lineNumAfterSpace > 2) secondaryinfo.push(eachline);
      }

      if ((eachline.trim().length === 0 || lines.length === i + 1) && backside.length > 0 && frontside.length > 0) {
        const flashCard: FlashCard = {
          cardNumber: cardNumber++,
          cardName: "",
          frontSide: frontside,
          backSide: backside,
          primaryInfo: "",
          secondaryInfo: secondaryinfo.join("\n"),
          notableCards: [],
          dateOfLastReview: "2000-12-31",
          repetitionValue: 0,
          repetitionHistory: [0, 0, 0, 0, 0],
          tags: [...currentTags],
        };
        cards.push(flashCard);
        currentTags.forEach(tag => {
          if (!tags[tag]) tags[tag] = tag;
        });
        lineNumAfterSpace = 0;
        backside = "";
        frontside = "";
        secondaryinfo = [];
      }
    }

    return [{
      deckName: currentTags.length > 0 ? currentTags[0] : 'My Deck',
      deckInfo: currentTags.length > 1 ? currentTags[1] : 'My Info',
      settings: {
        "practice-settings": FlashCardDeckPracticeSettings.defaultSettings(),
        "app-settings": FlashCardDeckAppSettings.defaultSettings(),
      },
      tags,
      cards,
    }, { ok: true, value: "createNewDeck successful" }];
  }

  private static countInitialHashes(str: string): number {
    const match = str.match(/^#+/);
    return match ? match[0].length : 0;
  }

  private static removeLastXElements(array: string[], x: number): string[] {
    for (let i = 0; i < x; i++) {
      if (array.length > 0) array.pop();
    }
    return array;
  }
}
