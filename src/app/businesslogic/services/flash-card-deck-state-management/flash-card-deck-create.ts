import { FlashCardDeck } from '../../models/flashcarddeck'; // Update the path as per your application structure
import {FlashCard} from "../../models/flashcard"; // Update the path as per your application structure

export class FlashCardDeckCreate {

  public static createNewDeck(newDeckContent: string): FlashCardDeck {
    const lines: string[] =
      newDeckContent.split('\n').map(line => line.trim());

    var cards: FlashCard[] = [];
    //tags.someKey = "someValue"; // Adds the key "someKey" with the value "someValue"
    var tags: Record<string, string> = {};

    var temptags: string[] = []

    for (const eachline of lines) {
      const hashCOunt = this.countHashes(eachline);
      if (hashCOunt > temptags.length-1) {

      }
    }

    //export interface FlashCard {
    //     cardNumber: number;
    //     cardName: string;
    //     frontSide: string;
    //     backSide: string;
    //     primaryInfo: string;
    //     secondaryInfo: string;
    //     notableCards: number[];
    //     dateOfLastReview: string;
    //     repetitionValue: number;
    //     repetitionHistory: number[];
    //     tags: string[];
    // }

/*
switch (true) {
    case /^# /.test(eachline): // Matches lines starting with "# "
      console.log("This line starts with '# ': ", eachline);
      break;
    case /^## /.test(eachline): // Matches lines starting with "## "
      console.log("This line starts with '## ': ", eachline);
      break;
    default:
      console.log("No special prefix: ", eachline);
  }
*/

    //"filtercardsbytag":{}
    return {
      deckName: 'New Deck',
      deckInfo: 'This is a new flashcard deck.',
      settings:  { filtercardsbytag: {}, }, // Provide a default empty settings object
      tags: {}, // Provide a default empty tags object
      cards: [] // Initialize with an empty array of FlashCards
    };



  }

  private static countHashes(str: string): number {
    const match = str.match(/^#+/); // Match # characters at the start
    return match ? match[0].length : 0; // Return length of the match or 0 if no match
  }


}
