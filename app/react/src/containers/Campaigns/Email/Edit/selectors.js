const getEmailEditorFormInitialValues = state => {
  const { editEmailPage: { emailCampaign } } = state;
  return {
    campaign: emailCampaign
  };
};

const getEmailBlastEditorFormInitialValues = state => blastId => {
  const {
    editEmailPage: {
      emailEditorState: {
        blastList: { byId }
      }
    }
  } = state;
  return byId[blastId];
};

export {
  getEmailEditorFormInitialValues,
  getEmailBlastEditorFormInitialValues
};
