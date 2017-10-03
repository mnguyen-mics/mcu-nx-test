import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';

import { withMcsRouter } from '../../../Helpers';
import { EditContentLayout } from '../../../../components/Layout';
import EmailBlastForm from './EmailBlastForm';
import messages from './messages';

function EmailBlastContent({
  blast,
  breadcrumbPaths,
  handlers: {
    closeNextDrawer,
    openNextDrawer,
    redirect,
    save,
  },
  match: { url },
}) {

  const { segments, ...blastMetadata } = blast;
  const formId = 'emailBlastForm';
  const initialValues = { blast: blastMetadata };

  const sidebarItems = {
    general: messages.emailBlastEditorStepperGeneralInformation,
    blast: messages.emailBlastEditorStepperBlastInformation,
    template: messages.emailBlastEditorStepperTemplateSelection,
    segments: messages.emailBlastEditorStepperSegmentSelection,
  };

  const buttonMetadata = {
    formId,
    message: messages.emailEditorSave,
    onClose: redirect,
  };

  return (
    <EditContentLayout
      breadcrumbPaths={breadcrumbPaths}
      sidebarItems={sidebarItems}
      buttonMetadata={buttonMetadata}
      url={url}
    >
      <EmailBlastForm
        blastName={blastMetadata.blast_name}
        closeNextDrawer={closeNextDrawer}
        formId={formId}
        initialValues={initialValues}
        openNextDrawer={openNextDrawer}
        segments={segments}
        save={save}
      />
    </EditContentLayout>
  );
}

EmailBlastContent.defaultProps = {
  blast: {},
};

EmailBlastContent.propTypes = {
  blast: PropTypes.shape({
    blast_name: PropTypes.string,
    segments: PropTypes.arrayOf(PropTypes.shape()),
  }),

  breadcrumbPaths: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
    url: PropTypes.string,
  })).isRequired,

  handlers: PropTypes.shape({
    closeNextDrawer: PropTypes.func.isRequired,
    openNextDrawer: PropTypes.func.isRequired,
    redirect: PropTypes.func.isRequired,
    save: PropTypes.func.isRequired,
  }).isRequired,

  match: PropTypes.shape({
    url: PropTypes.string.isRequired,
  }).isRequired,
};

export default compose(
  withMcsRouter,
)(EmailBlastContent);
