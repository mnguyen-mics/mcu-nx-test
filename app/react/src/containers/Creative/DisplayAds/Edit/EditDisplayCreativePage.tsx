import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { RouteComponentProps } from 'react-router';
import { ConfigProps, Omit } from 'redux-form';

import * as actions from '../../../../state/Notifications/actions';
import { withMcsRouter } from '../../../Helpers';
import { PropertyResourceShape } from '../../../../models/plugin';
import DisplayCreativeFormLoader from './DisplayCreativeFormLoader';
import {  DisplayCreativeCreator } from './index';
import Loading from '../../../../components/Loading';
import { AdRendererProps } from '../../../../models/campaign/display/AdResource';
import messages from './messages';
import { DrawableContentProps } from '../../../../components/Drawer/index';
import { DisplayCreativeFormData } from './domain';

interface EditDisplayCreativePageProps extends DrawableContentProps,
Omit<ConfigProps<DisplayCreativeFormData>, 'form'> {

}

interface EditDisplayCreativePageState {
  adRenderer: AdRendererProps;
  isLoading: boolean;
  rendererProperties: PropertyResourceShape[];
  formats: string[];
}

interface RouteProps {
  organisationId: string;
  creativeId?: string;
}

type JoinedProps = EditDisplayCreativePageProps &
  InjectedIntlProps &
  RouteComponentProps<RouteProps>;

class EditDisplayCreativePage extends React.Component<
  JoinedProps,
  EditDisplayCreativePageState
> {
  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      adRenderer: {
        id: '',
        version_id: '',
        artifact_id: '',
        group_id: '',
      },
      isLoading: false,
      rendererProperties: [],
      formats: [],
    };
  }

  onClose = () => {
    const { history, match: { params: { organisationId } } } = this.props;
    history.push(`/v2/o/${organisationId}/creatives/display`);
  };

  onSave = (creativeData: DisplayCreativeFormData) => {
		const { history, match: { params: { organisationId } } } = this.props;
		// if creativeId -> update sinon create
    // updateDisplayCreative(organisationId, creative, properties);
    // updateDisplayCreative(organisationId, creative);
    history.push(`/v2/o/${organisationId}/creatives/display`);
  };

  render() {
		const { match: { params: { creativeId } } } = this.props;
		
    const { isLoading } = this.state;
    
    const actionBarButtonText = messages.creativeCreationSaveButton;
  
    const breadCrumbPaths = [{
      name: creativeId ? messages.creativeEditionBreadCrumb : messages.creativeCreationBreadCrumb,
    }];

    return isLoading ? (
			<div style={{ display: 'flex', flex: 1 }}>
				<Loading className="loading-full-screen" />
      </div>
    ) : creativeId ? (
      <DisplayCreativeFormLoader
        close={this.onClose}
        save={this.onSave}
        creativeId={creativeId}
        actionBarButtonText={actionBarButtonText}
        openNextDrawer={this.props.openNextDrawer}
        closeNextDrawer={this.props.closeNextDrawer}
        breadCrumbPaths={breadCrumbPaths}
      />
    ) : <DisplayCreativeCreator
          close={this.onClose}
          save={this.onSave}
          openNextDrawer={this.props.openNextDrawer}
          closeNextDrawer={this.props.closeNextDrawer}
          actionBarButtonText={actionBarButtonText}
        /> ;
  }
}

export default compose<JoinedProps, EditDisplayCreativePageProps>(
  withMcsRouter,
  injectIntl,
  connect(undefined, { notifyError: actions.notifyError }),
)(EditDisplayCreativePage);
