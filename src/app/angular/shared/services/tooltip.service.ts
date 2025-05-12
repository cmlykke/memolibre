// src/app/angular/shared/services/tooltip.service.ts

import { Injectable } from '@angular/core';

export enum TooltipKey {
  CIRCULATION_INCREASE =
    "Increase the repetition value for this card, " +
    "making it show up less frequently in future practice sessions",
  CIRCULATION_DECREASE =
    "Decrease the repetition value for this card, " +
    "making it show up more frequently in future practice sessions",
  CIRCULATION_TITLE =
    "In this page, you can adjust how often a card appears in " +
    "your practice sessions by modifying its circulation value",
  CIRCULATION_NUMBER =
    "This number shows the current circulation value of the card - " +
    "higher values mean the card will appear less frequently",
  CIRCULATION_LIST = "View and manage all cards with their circulation values",
  ADDREMOVE_UPDATE = "Save changes made to this card",
  ADDREMOVE_CLEAR = "Clear all input fields and reset the form",
  ADDREMOVE_TITLE =
    "In this page, you can add new flashcards or delete existing ones in your deck",
  CREATEDECk_TITLE =
    "In this page, you can create new flashcard decks " +
    "to organize different subjects or topics",
  CREATEDECk_NEWNAMEBUTTON = "Click to rename your current deck",
  CREATEDECK_NEWNAMEFIELD = "Enter a new name for your deck",
  CREATEDECK_CREATEDECKBUTTON = "Click to create a new deck with the specified name",
  CREATEDECK_CREATEDECKFIELD =
    "You can create a new deck here, by pasting the front sides and backsides." +
    "You must use this format:\n" +
    "\n" +
    "Card 1 front side" +
    "\n" +
    "Card 1 back side" +
    "\n" +
    "(Optional) Card 1 comment" +
    "\n" +
    "\n" +
    "Card 2 front side" +
    "\n" +
    "Card 2 back side" +
    "\n" +
    "(Optional) Card 2 comment" +
    "\n" +
    "\n" +
    "Card 3 front side" +
    "\n" +
    "Card 3 back side" +
    "\n" +
    "(Optional) Card 3 comment" +
    "\n" +
    "\n" +
    "" +
    "...",

  LOADDATA_TITLE =
    "In this page, you can import flashcard decks from your device " +
    "or download them from external sources",
  LOADDATA_SELECTBUTTON = "Browse your device to select a deck file to import",
  LOADDATA_DOWNLOADBUTTON = "Download your current deck to save or share with others",
  LOADDATA_DRAGANDDROP = "Drag and drop a deck file here to quickly import it",
  LOADDATA_GOTOPRACTICE = "Start practicing with the currently loaded deck",
  PRACTICE_UNLOCKTAGS =
    "Toggle the ability to modify tags during practice - " +
    "unlock to add or edit tags as you study",
  PRACTICE_UNDO = "Undo your last action or card rating",
  PRACTICE_REDO = "Redo an action that was previously undone",
  PRACTICE_COUNTERALL = "Total number of cards you've practiced in this session",
  PRACTICE_COUNTERPOSITIVE = "Number of cards you've rated positively in this session",
  SEARCH_TITLE =
    "In this page, you can search through your flashcards " +
    "using various criteria to find specific cards",
  SEARCH_UNLOCKTAGS =
    "Toggle the ability to modify tags while searching - " +
    "unlock to edit tags on found cards",
  SEARCH_CLEAR = "Clear all search filters and start a new search",
  SEARCH_CARDNUMBERFIELD = "Enter a specific card number to find that exact card",
  SEARCH_FRONTSIDEREGEXFIELD =
    "Search for text on the front side of cards using regular expressions",
  SEARCH_BACKSIDEREGEXFIELD =
    "Search for text on the back side of cards using regular expressions",
  SEARCH_TAGREGEXFIELD = "Search for cards with specific tags using regular expressions",
  TAG_TITLE =
    "In this page, you can view, create, edit, and organize tags for all your flashcards",
  TAG_UNLOCKTAGS = "Toggle the ability to modify tags - unlock to add, edit, or delete tags",
  TAG_SORTBUTTON = "Change the sorting order of tags between alphabetical and frequency-based",
  TAG_ADDTAG = "Create a new tag to categorize your flashcards",
  TAG_SEARCHFIELD = "Filter tags by name using regular expressions to find specific tags",
  PRACTICESETTINGS_TITLE =
    "In this page, you can customize your practice experience with font sizes, " +
    "display options, and study behavior",
  PRACTICESETTINGS_SAVE = "Save all your practice settings changes",
  APPSETTINGS_TITLE =
    "In this page, you can configure general application settings and preferences",
  APPSETTINGS_SAVE = "Save all application setting changes",

}



@Injectable({
  providedIn: 'root'
})
export class TooltipService {

  getTooltip(key: TooltipKey | string): string {
    return key;
  }

}

