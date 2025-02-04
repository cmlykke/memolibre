export interface FlashCard {
    cardNumber: number;
    cardName: string;
    frontSide: string;
    backSide: string;
    primaryInfo: string;
    secondaryInfo: string;
    notableCards: number[];
    dateOfLastReview: string;
    repetitionValue: number;
    repetitionHistory: number[];
    tags: string[];
}