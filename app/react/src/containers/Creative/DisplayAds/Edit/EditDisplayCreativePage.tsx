import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';

import * as actions from '../../../../state/Notifications/actions';
import DisplayCreativeFormLoader from './DisplayCreativeFormLoader';
import { DisplayCreativeCreator } from './index';
import messages from './messages';
import {
  DisplayCreativeFormData,
  EditDisplayCreativeRouteMatchParams,
} from './domain';
import DisplayCreativeFormService from './DisplayCreativeFormService';

interface MapStateProps {
  notifyError: (err: any) => void;
}

type Props = RouteComponentProps<EditDisplayCreativeRouteMatchParams> & MapStateProps;

class EditDisplayCreativePage extends React.Component<Props> {
  redirect = () => {
    const { history, match: { params: { organisationId } } } = this.props;
    history.push(`/v2/o/${organisationId}/creatives/display`);
  };

  onSave = (creativeData: DisplayCreativeFormData) => {
    const { match: { params: { organisationId } } } = this.props;
    DisplayCreativeFormService.saveDisplayCreative(
      organisationId,
      creativeData,
    ).then(() => {
      this.redirect();
    }).catch(err => this.props.notifyError(err));
  };

  render() {
    const { match: { params: { creativeId } } } = this.props;

    const actionBarButtonText = messages.creativeCreationSaveButton;

    const breadCrumbPaths = [
      {
        name: creativeId
          ? messages.creativeEditionBreadCrumb
          : messages.creativeCreationBreadCrumb,
      },
    ];

    const props = {
      close: this.redirect,
      onSubmit: this.onSave,
      actionBarButtonText: actionBarButtonText,
      breadCrumbPaths: breadCrumbPaths,
    };

    return creativeId ? (
      <DisplayCreativeFormLoader {...props} creativeId={creativeId} />
    ) : (
      <DisplayCreativeCreator {...props} />
    );
  }
}

export default compose<Props, {}>(
  withRouter,
  connect(undefined, { notifyError: actions.notifyError }),
)(EditDisplayCreativePage);
