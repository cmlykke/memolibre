import { FlashCardDeck } from '../../models/flashcarddeck'; // Update the path as per your application structure

export class FlashCardDeckCreate {

  public static createNewDeck(newDeckContent: string): FlashCardDeck {


    return {
      deckName: 'New Deck two',
      deckInfo: 'This is a new flashcard deck.',
      settings: {}, // Provide a default empty settings object
      tags: {}, // Provide a default empty tags object
      cards: [] // Initialize with an empty array of FlashCards
    };



  }

}
