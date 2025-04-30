

import { FlashCardDeck } from '../../models/flashcarddeck';


export class FlashCardDeckUpdate {
  public static editDeckName(deckName: string,
                      currentState: FlashCardDeck): FlashCardDeck {
    // Construct a new FlashCardDeck object with the updated name, using the rest of the properties from currentState
    const updatedDeck: FlashCardDeck = {
      ...currentState, // Spread the existing properties of the current state
      deckName: deckName, // Override the `deckName` field with the new value
    };

    return updatedDeck; // Return the updated object
  }



}
