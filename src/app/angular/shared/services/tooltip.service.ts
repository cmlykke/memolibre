// src/app/angular/shared/services/tooltip.service.ts

import { Injectable } from '@angular/core';

export enum TooltipKey {
  CIRCULATION_INCREASE = 'circulation.increase',
  CIRCULATION_DECREASE = 'circulation.decrease',
  CIRCULATION_MANAGE = 'circulation.manage',
  CIRCULATION_NUMBER = 'circulation.number',
  CIRCULATION_LIST = 'circulation.list',
  ADDREMOVE_UPDATE = 'addremove.update',
  ADDREMOVE_CLEAR = 'addremove.clear',
  ADDREMOVE_TITLE = 'addremove.title',
  CREATEDECk_TITLE = 'createdeck.title',
  CREATEDECk_NEWNAMEBUTTON = 'createdeck.newnamebutton',
  CREATEDECK_NEWNAMEFIELD = 'createdeck.newnamefield',
  CREATEDECK_CREATEDECKBUTTON = 'createdeck.createdeckbutton',
  CREATEDECK_CREATEDECKFIELD = 'createdeck.createdeckfield',
  LOADDATA_TITLE = 'loaddata.title',
  LOADDATA_SELECTBUTTON = 'loaddata.selectbutton',
  LOADDATA_DOWNLOADBUTTON = 'loaddata.downloadbutton',
  LOADDATA_DRAGANDDROP = 'loaddata.draganddrop',
  PRACTICE_UNLOCKTAGS = 'practice.unlocktags',
  PRACTICE_UNDO = 'practice.undo',
  PRACTICE_REDO = 'practice.redo',
  PRACTICE_COUNTERALL = 'practice.counterall',
  PRACTICE_COUNTERPOSITIVE = 'practice.counterpositive',
  SEARCH_TITLE = 'search.title',
  SEARCH_UNLOCKTAGS = 'search.unlocktags',
  SEARCH_CLEAR = 'search.clear',
  SEARCH_CARDNUMBERFIELD = 'search.cardnumberfield',
  SEARCH_FRONTSIDEREGEXFIELD = 'search.frontsideregexfield',
  SEARCH_BACKSIDEREGEXFIELD = 'search.backsideregexfield',
  SEARCH_TAGREGEXFIELD = 'search.tagregexfield',
  TAG_TITLE = 'tag.title',
  TAG_UNLOCKTAGS = 'tag.locktags',
  TAG_SORTBUTTON = 'tag.sort',
  TAG_ADDTAG = 'tag.addtag',
  TAG_SEARCHFIELD = 'tag.searchfield',
  PRACTICESETTINGS_TITLE = 'practicesettings.title',
  APPSETTINGS_TITLE = 'appsettings.title',

}



@Injectable({
  providedIn: 'root'
})
export class TooltipService {

  getTooltip(key: TooltipKey | string): string {
    return key;
  }

}

