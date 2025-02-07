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
    var primaryinfo = "";
    var secondaryinfo = "";
    //tags.someKey = "someValue"; // Adds the key "someKey" with the value "someValue"
    var tags: Record<string, string> = {};
    var currentHashtags: string[] = []

    for (const eachline of lines) {
      // handle chapter headings
      if ((eachline.trim().length === 0) &&  backside.length > 0 && frontside.length > 0) {
        const flashCard: FlashCard = {
          cardNumber: cardNumber,
          cardName: "",
          frontSide: frontside,
          backSide: backside,
          primaryInfo: primaryinfo,
          secondaryInfo: secondaryinfo,
          notableCards: [], // Assuming 2 and 3 are related card numbers
          dateOfLastReview: "2000-12-31",
          repetitionValue: 0, // Could represent how many repetitions are required for mastery
          repetitionHistory: [0,0,0,0,0], // Tracks review sessions
          tags: currentHashtags
        };
        cards.push(flashCard);
        for (const eachtag of currentHashtags) {
          if (tags[eachtag] == undefined) {
            tags[eachtag] = eachtag;
          }
        }
        cardNumber++;
      }
      if (eachline.trim().length === 0) {
        lineNumAfterSpace = 0;
        backside = "";
        frontside = "";
        primaryinfo = "";
        secondaryinfo = "";
      }else {
        lineNumAfterSpace++;
      }

      const hashCount = this.countInitialHashes(eachline);
      if ((hashCount > 0) && (hashCount > currentHashtags.length+1)) {
        //chapter headings is written with hashtags.
        //if your last chapter heading is 4 hashtags, the next heading has to be 5 or less hashtags
        //lower amount means a more general heading (like a section), a higher amount means a more specific heading
        //(like a chapter)
        return [null, { ok: false, error: "Error: A chapter heading (#) has to be only one greater or less than you" +
            "previous heading. Please check your input." }];
      } else if ((hashCount > 0) && (hashCount <= currentHashtags.length+1)) {
        const toSubtract: number = (currentHashtags.length + 1) - hashCount;
        currentHashtags = this.removeLastXElements(currentHashtags, toSubtract);
        const headerWithoutHashtags = eachline.replace(/^#+/, "").trim();
        currentHashtags.push(headerWithoutHashtags);
      }

      // write logic for adding frontside, backside, and primaryinfo
      if ((hashCount === 0) && (lineNumAfterSpace == 1)) {
        backside = eachline;
      }
      if ((hashCount === 0) && (lineNumAfterSpace == 2)) {
        frontside = eachline;
      }
      if ((hashCount === 0) && (lineNumAfterSpace == 3)) {
        primaryinfo = eachline;
      }
      if ((hashCount === 0) && (lineNumAfterSpace == 4)) {
        secondaryinfo = eachline;
      }
    }

    return [{
      deckName: currentHashtags.length > 0 ? currentHashtags[0] : 'My Deck',
      deckInfo: currentHashtags.length > 1 ? currentHashtags[1] : 'My Info',
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
