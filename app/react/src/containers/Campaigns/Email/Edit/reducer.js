import { combineReducers } from 'redux';
import { omit } from 'lodash';

import { normalizeArrayOfObject } from '../../../../utils/Normalizer';

import {
  CAMPAIGN_EMAIL_CREATE,
  EMAIL_EDITOR_INITIALIZE,
  EMAIL_EDITOR_NEW_BLAST_CREATED,
  EMAIL_EDITOR_NEW_BLAST_DELETED,
  EMAIL_EDITOR_NEW_BLAST_EDITED,
  EMAIL_EDITOR_EXISTING_BLAST_EDITED,
  EMAIL_EDITOR_EXISTING_BLAST_DELETED,
  EMAIL_EDITOR_RESET
} from '../../../../state/action-types';

const defaultCreateEmailPageState = {
  isSaving: false,
  error: null
};

const createEmailPage = (state = defaultCreateEmailPageState, action) => {
  switch (action.type) {
    case CAMPAIGN_EMAIL_CREATE.REQUEST:
      return {
        ...state,
        isSaving: true
      };
    case CAMPAIGN_EMAIL_CREATE.SUCCESS:
      return {
        ...state,
        isSaving: false
      };
    case CAMPAIGN_EMAIL_CREATE.FAILURE:
      return {
        ...state,
        isSaving: false,
        error: { ...action.payload }
      };
    default:
      return state;
  }
};

const defaultEditEmailPageState = {
  isUpdating: false,
  error: null
};

// const editEmailPage = (state = defaultEditEmailPageState, action) => {
//   switch (action.type) {
//     case CAMPAIGN_EMAIL_UPDATE.REQUEST:
//       return {
//         ...state,
//         isUpdating: true
//       };
//     case CAMPAIGN_EMAIL_UPDATE.SUCCESS:
//       return {
//         ...state,
//         isUpdating: false
//       };
//     case CAMPAIGN_EMAIL_UPDATE.FAILURE:
//       return {
//         ...state,
//         isUpdating: false,
//         error: { ...action.payload }
//       };
//     default:
//       return state;
//   }
// };

// const defaultCreateBlastPageState = {
//   isSaving: false,
//   error: null
// };

// const createBlastPage = (state = defaultCreateBlastPageState, action) => {
//   switch (action.type) {
//     case CAMPAIGN_EMAIL_BLAST_SAVE.REQUEST:
//       return {
//         ...state,
//         isSaving: true
//       };
//     case CAMPAIGN_EMAIL_BLAST_SAVE.SUCCESS:
//       return {
//         ...state,
//         isSaving: false
//       };
//     case CAMPAIGN_EMAIL_BLAST_SAVE.FAILURE:
//       return {
//         ...state,
//         isSaving: false,
//         error: { ...action.payload }
//       };
//     default:
//       return state;
//   }
// };

// const defaultEditBlastPageState = {
//   isUpdating: false,
//   error: null
// };

// const editBlastPage = (state = defaultEditBlastPageState, action) => {
//   switch (action.type) {
//     case CAMPAIGN_EMAIL_UPDATE.REQUEST:
//       return {
//         ...state,
//         isUpdating: true
//       };
//     case CAMPAIGN_EMAIL_UPDATE.SUCCESS:
//       return {
//         ...state,
//         isUpdating: false
//       };
//     case CAMPAIGN_EMAIL_UPDATE.FAILURE:
//       return {
//         ...state,
//         isUpdating: false,
//         error: { ...action.payload }
//       };
//     default:
//       return state;
//   }
// };

const blastsById = (state = {}, action) => {
  switch (action.type) {
    // case EMAIL_EDITOR_FETCH_BLASTS_SUCCESS:
    //   return action.payload;
    case EMAIL_EDITOR_NEW_BLAST_CREATED:
    case EMAIL_EDITOR_NEW_BLAST_EDITED:
    case EMAIL_EDITOR_EXISTING_BLAST_EDITED:
      return {
        ...state,
        [action.payload.blastId]: action.payload.blast
      };
    case EMAIL_EDITOR_NEW_BLAST_DELETED:
    case EMAIL_EDITOR_EXISTING_BLAST_DELETED:
      return omit(state, [action.payload]);
    case EMAIL_EDITOR_RESET:
      return {};
    default:
      return state;
  }
};

const allBlasts = (state = [], action) => {
  switch (action.type) {
    case EMAIL_EDITOR_NEW_BLAST_CREATED:
      return state.concat(action.payload.blastId);
    case EMAIL_EDITOR_NEW_BLAST_DELETED:
    case EMAIL_EDITOR_EXISTING_BLAST_DELETED:
      return state.filter(blastId => blastId !== action.payload);
    case EMAIL_EDITOR_RESET:
      return [];
    default:
      return state;
  }
};

const removedBlastById = (state = [], action) => {
  switch (action.type) {
    case EMAIL_EDITOR_EXISTING_BLAST_DELETED:
      return state.concat(action.payload);
    case EMAIL_EDITOR_RESET:
      return [];
    default:
      return state;
  }
};

const editedBlastById = (state = [], action) => {
  switch (action.type) {
    case EMAIL_EDITOR_EXISTING_BLAST_EDITED:
      return state.concat(action.payload.blastId);
    case EMAIL_EDITOR_RESET:
      return [];
    default:
      return state;
  }
};

const newBlastsId = (state = [], action) => {
  switch (action.type) {
    case EMAIL_EDITOR_NEW_BLAST_CREATED:
      return state.concat(action.payload.blastId);
    case EMAIL_EDITOR_RESET:
      return [];
    default:
      return state;
  }
};

const hasEmailEditionChanges = (state = false, action) => {
  switch (action.type) {
    case EMAIL_EDITOR_NEW_BLAST_CREATED:
    case EMAIL_EDITOR_EXISTING_BLAST_EDITED:
    case EMAIL_EDITOR_EXISTING_BLAST_DELETED:
      return true;
    case EMAIL_EDITOR_RESET:
      return false;
    default:
      return state;
  }
};

const blastList = combineReducers({
  byId: blastsById,
  allIds: allBlasts,
  editedIds: editedBlastById,
  removedIds: removedBlastById,
  newIds: newBlastsId
});

const emailEditorState = combineReducers({
  blastList,
  hasChanges: hasEmailEditionChanges
});


// const defaultBlastEditor = {
//   blast: null,
//   existingEmailTemplateSelectionList: {},
//   removedEmailTemplateSelectionIdList: [],
//   newEmailTemplateSelectionList: {}
// };

// const blastEditor = (state = defaultBlastEditor, action) => {
//   switch (action.type) {
//     case BLAST_EDITOR_NEW_EMAIL_TEMPLATE_SELECTION_CREATED:
//       return state;
//     case BLAST_EDITOR_NEW_EMAIL_TEMPLATE_SELECTION_CREATED:
//       return state;
//     case BLAST_EDITOR_RESET:
//       return defaultBlastEditor;
//     default:
//       return state;
//   }
// };

const campaignEmailEdit = combineReducers({
  createEmailPage,
  // createBlastPage,
  // editEmailPage,
  // editBlastPage,
  emailEditorState
  // blastEditor
});

export default { campaignEmailEdit };
