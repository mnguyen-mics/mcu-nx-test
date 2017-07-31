import { createAction } from 'redux-actions';
import { generateFakeId, isFakeId } from '../../../../utils/FakeIdHelper';
import {
  EMAIL_EDITOR_NEW_BLAST_CREATED,
  EMAIL_EDITOR_NEW_BLAST_DELETED,
  EMAIL_EDITOR_NEW_BLAST_EDITED,
  EMAIL_EDITOR_EXISTING_BLAST_EDITED,
  EMAIL_EDITOR_EXISTING_BLAST_DELETED
} from '../../../../state/action-types';

const addBlast = (blast, emailTemplateIds = []) => {
  const fakeId = generateFakeId();
  const playload = {
    blastId: fakeId,
    blast: {
      ...blast,
      id: fakeId
    },
    emailTemplateIds
  };
  return createAction(EMAIL_EDITOR_NEW_BLAST_CREATED)(playload);
};

const editBlast = (blast, emailTemplateIds = []) => {
  if (blast.id) {

    const payload = {
      blastId: blast.id,
      blast: {
        ...blast
      },
      emailTemplateIds
    };

    return isFakeId(blast.id) ?
      createAction(EMAIL_EDITOR_NEW_BLAST_EDITED)(payload) :
      createAction(EMAIL_EDITOR_EXISTING_BLAST_EDITED)(payload);

  }
  return null;
};

const removeBlast = (blastId) => {
  return isFakeId(blastId) ?
    createAction(EMAIL_EDITOR_NEW_BLAST_DELETED)(blastId) :
    createAction(EMAIL_EDITOR_EXISTING_BLAST_DELETED)(blastId);
};

// const createEmail = {
//   request: (organisationId, emailCampaign) => {

//     return createAction(CAMPAIGN_EMAIL_CREATE.REQUEST);
//   },
//   success: createAction(CAMPAIGN_EMAIL_CREATE.SUCCESS),
//   failure: createAction(CAMPAIGN_EMAIL_CREATE.FAILURE)
// };

export { addBlast, editBlast, removeBlast };
