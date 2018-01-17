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
import Loading from '../../../../components/Loading';

interface State {
  loading: boolean;
}

interface MapStateProps {
  notifyError: (err: any) => void;
}

type Props = RouteComponentProps<EditDisplayCreativeRouteMatchParams> & MapStateProps;

class EditDisplayCreativePage extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      loading: false,
    };
  }

  redirect = () => {
    const { history, location, match: { params: { organisationId } } } = this.props;
    
    const url = location.state && location.state.from
      ? location.state.from
      : `/v2/o/${organisationId}/creatives/display`

    history.push(url);
  };

  onSave = (creativeData: DisplayCreativeFormData) => {
    const { match: { params: { organisationId } } } = this.props;

    this.setState({
      loading: true,
    });

    DisplayCreativeFormService.saveDisplayCreative(
      organisationId,
      creativeData,
    ).then(() => {
      this.redirect();
    }).catch(err => {
      this.props.notifyError(err)
      this.setState({
        loading: false,
      });
    });
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

    if (this.state.loading) {
      return <Loading className="loading-full-screen" />;
    }

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
