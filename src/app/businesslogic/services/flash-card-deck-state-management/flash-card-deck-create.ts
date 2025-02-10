import { FlashCardDeck } from '../../models/flashcarddeck'; // Update the path as per your application structure
import {FlashCard} from "../../models/flashcard";
import {Result} from '../../../angular/utils/types'; // Update the path as per your application structure

export class FlashCardDeckCreate {

  public static createNewDeck(newDeckContent: string):
    [FlashCardDeck | null, Result<string, string>] {
    const lines: string[] =
      newDeckContent.split('\n').map(line => line.trim());

    var cards: FlashCard[] = [];
    var lineNumAfterSpace = 0;
    var cardNumber = 1;

    var backside = "";
    var frontside = "";
    var secondaryinfo: string[] = [];
    // var primaryinfo = ""; should not be used, because its about personal notes
    var tags: Record<string, string> = {};
    var currentTags: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const eachline = lines[i];
      if (cards.length == 26) {
        const string = ""
      }
      const hashCount = this.countInitialHashes(eachline);
      if (eachline.trim().length !== 0 && hashCount == 0) {
        lineNumAfterSpace++;
      }

      if (hashCount > 0) {
        const excessCurrentTags = (currentTags.length - hashCount)+1;
        if (excessCurrentTags > 0) {
          currentTags = this.removeLastXElements(currentTags, excessCurrentTags);
        }
        const headerWithoutHashtags = eachline.replace(/^#+/, "").trim();
        currentTags.push(headerWithoutHashtags);
      }

      // write logic for adding frontside, backside, and primaryinfo
      if ((hashCount === 0) && (eachline.trim().length != 0) && (lineNumAfterSpace == 1)) {
        backside = eachline;
      }
      if ((hashCount === 0) && (eachline.trim().length != 0) && (lineNumAfterSpace == 2)) {
        frontside = eachline;
      }
      if ((hashCount === 0) && (eachline.trim().length != 0) && (lineNumAfterSpace > 2)) {
        secondaryinfo.push(eachline);
      }


      // handle chapter headings
      if ((eachline.trim().length === 0 || lines.length == i+1)
        && backside.length > 0 && frontside.length > 0) {
        const flashCard: FlashCard = {
          cardNumber: cardNumber,
          cardName: "",
          frontSide: frontside,
          backSide: backside,
          primaryInfo: "",
          secondaryInfo: [...secondaryinfo].join("\n"),
          notableCards: [], // Assuming 2 and 3 are related card numbers
          dateOfLastReview: "2000-12-31",
          repetitionValue: 0, // Could represent how many repetitions are required for mastery
          repetitionHistory: [0,0,0,0,0], // Tracks review sessions
          tags: [...currentTags]
        };
        cards.push(flashCard);
        for (const eachtag of currentTags) {
          if (tags[eachtag] == undefined) {
            tags[eachtag] = eachtag;
          }
        }
        cardNumber++;
      }

      if (eachline.trim().length === 0 || hashCount > 0) {
        lineNumAfterSpace = 0;
        backside = "";
        frontside = "";
        secondaryinfo = [];
      }
    }

    return [{
      deckName: currentTags.length > 0 ? currentTags[0] : 'My Deck',
      deckInfo: currentTags.length > 1 ? currentTags[1] : 'My Info',
      settings:  { filtercardsbytag: {}, }, // Provide a default empty settings object
      tags: tags, // Provide a default empty tags object
      cards: cards // Initialize with an empty array of FlashCards
    }, { ok: true, value: "createNewDeck successful" }];
  }

  private static countInitialHashes(str: string): number {
    const match = str.match(/^#+/); // Match # characters at the start
    return match ? match[0].length : 0; // Return length of the match or 0 if no match
  }

  private static removeLastXElements(array: string[], x: number): string[] {
    for (let i = 0; i < x; i++) {
      if (array.length > 0) {
        array.pop(); // Remove the last element
      }
    }
    return array; // Return the modified array if needed
  }


}
