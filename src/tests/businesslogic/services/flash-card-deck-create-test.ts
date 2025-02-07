import { FlashCardDeckCreate } from '../../../app/businesslogic/services/flash-card-deck-state-management/flash-card-deck-create'; // Adjust path as needed
import { FlashCardDeck } from '../../../app/businesslogic/models/flashcarddeck'; // Adjust path as needed
import { Result } from '../../../app/angular/utils/types';//'../../../angular/utils/types'; // Adjust path as needed

describe('FlashCardDeckCreate', () => {
  it('should create a new deck successfully with valid input', () => {
    const input = `
      # Main Heading
      ## Sub Heading
    `;
    const [deck, result] = FlashCardDeckCreate.createNewDeck(input);

    expect(deck).not.toBeNull();
    expect(deck).toBeDefined();
    expect(result.ok).toBeTrue();
   // expect(result.value).toBe('createNewDeck successful');
    expect(deck?.deckName).toBe('Main Heading'); // First hashtag becomes the deck name
    expect(deck?.deckInfo).toBe('Sub Heading'); // Second hashtag becomes deck info
    expect(deck?.cards.length).toBe(0); // Cards not added in this input
  });

  it('should return an error if a chapter heading increases by more than 1 hashtag', () => {
    const input = `
      # Main Heading
      ### Invalid Sub Heading
    `;

    const [deck, result] = FlashCardDeckCreate.createNewDeck(input);

    expect(deck).toBeNull();
    expect(result.ok).toBeFalse();
    //expect(result.error).toContain('A chapter heading (#) has to be only one greater or less');
  });

  it('should return valid deck with multiple nested headings', () => {
    const input = `
      # Heading 1
      ## Sub Heading 1.1
      ## Sub Heading 1.2
      # Heading 2
    `;

    const [deck, result] = FlashCardDeckCreate.createNewDeck(input);

    expect(deck).toBeDefined();
    expect(result.ok).toBeTrue();
    //expect(result.value).toBe('createNewDeck successful');
    expect(deck?.deckName).toBe('Heading 1'); // First header is the deck name
    expect(deck?.deckInfo).toBe('Sub Heading 1.1'); // Second header
    expect(deck?.tags['Sub Heading 1.1']).toBe('Sub Heading 1.1'); // Ensure tags are getting assigned
    expect(deck?.tags['Sub Heading 1.2']).toBe('Sub Heading 1.2'); // Check tag logic
  });

  it('should handle empty input gracefully and return a default deck', () => {
    const input = '';

    const [deck, result] = FlashCardDeckCreate.createNewDeck(input);

    expect(deck).not.toBeNull();
    expect(deck?.deckName).toBe('My Deck'); // Default deck name
    expect(deck?.deckInfo).toBe('My Info'); // Default deck info
    expect(result.ok).toBeTrue();
    expect(deck?.cards.length).toBe(0); // No cards added
  });

  it('should correctly parse headings and cards', () => {
    const input = `
      # Chapter 1
      ## Sub Chapter 1.1
      Backside of Card 1
      Frontside of Card 1
      Info 1
      Info 2

      Backside of Card 2
      Frontside of Card 2
    `;

    const [deck, result] = FlashCardDeckCreate.createNewDeck(input);

    expect(deck).toBeDefined();
    expect(result.ok).toBeTrue();
    expect(deck?.deckName).toBe('Chapter 1'); // First header is the deck name
    expect(deck?.deckInfo).toBe('Sub Chapter 1.1'); // Second header
    //expect(deck?.cards).toHaveLength(2); // Two cards created
    expect(deck?.cards[0].backSide).toBe('Backside of Card 1'); // Validate card details
    expect(deck?.cards[0].frontSide).toBe('Frontside of Card 1');
    expect(deck?.cards[0].primaryInfo).toBe('Info 1');
    expect(deck?.cards[0].secondaryInfo).toBe('Info 2');
    expect(deck?.cards[1].backSide).toBe('Backside of Card 2'); // Validate second card
    expect(deck?.cards[1].frontSide).toBe('Frontside of Card 2');
  });

  it('should handle incomplete card details properly', () => {
    const input = `
      # Main Chapter
      Backside
    `;

    const [deck, result] = FlashCardDeckCreate.createNewDeck(input);

    expect(deck).toBeDefined();
    expect(result.ok).toBeTrue();
    //expect(deck?.cards).toHaveLength(0); // No valid cards should be created
  });
});
