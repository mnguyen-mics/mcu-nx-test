import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { RouteComponentProps } from 'react-router';

import * as actions from '../../../../../state/Notifications/actions';
import { withMcsRouter } from '../../../../Helpers';
import EditDisplayCreativeContent from './EditDisplayCreativeContent';
import withDrawer, { DrawableContentProps, DrawableContentOptions } from '../../../../../components/Drawer';
import { updateDisplayCreative } from '../../../../../formServices/CreativeServiceWrapper';
import { DisplayAdResource } from '../../../../../models/creative/CreativeResource';
import { PropertyResourceShape } from '../../../../../models/plugin';

interface EditDisplayCreativePageProps {
  closeNextDrawer: () => void;
  openNextDrawer: <T>(component: React.ComponentClass<T & DrawableContentProps | T>, options: DrawableContentOptions<T>) => void;
}

interface RouteProps {
  organisationId: string;
  creativeId: string;
}

type JoinedProps = EditDisplayCreativePageProps & InjectedIntlProps & RouteComponentProps<RouteProps>;

class EditDisplayCreativePage extends React.Component<JoinedProps> {

  onClose = () => {
    const {
      history,
      match: {
        params: {
          organisationId,
        },
      },
    } = this.props;
    history.push(`/v2/o/${organisationId}/creatives/display`);
  }

  save = (creative: DisplayAdResource, properties: PropertyResourceShape[]) => {
    const {
      history,
      match: {
        params: {
          organisationId,
        },
      },
    } = this.props;
    updateDisplayCreative(organisationId, creative, properties);
    history.push(`/v2/o/${organisationId}/creatives/display`);
  }

  render() {

    const {
      openNextDrawer,
      closeNextDrawer,
      match,
    } = this.props;

    return (
      <EditDisplayCreativeContent
        closeNextDrawer={closeNextDrawer}
        onClose={this.onClose}
        save={this.save}
        openNextDrawer={openNextDrawer}
        creativeId={match.params.creativeId}
      />
    );
  }
}

export default compose<JoinedProps, EditDisplayCreativePageProps>(
  withMcsRouter,
  injectIntl,
  withDrawer,
  connect(
    undefined,
    { notifyError: actions.notifyError },
  ),
)(EditDisplayCreativePage);
