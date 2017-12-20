import * as React from 'react';
import { compose } from 'recompose';
import { RouteComponentProps } from 'react-router';

import DisplayCreativeContent from './DisplayCreativeContent';
import withDrawer from '../../../../../components/Drawer';
import { withMcsRouter } from '../../../../Helpers';
import { createDisplayCreative } from '../../../../../formServices/CreativeServiceWrapper';
import { DrawableContentOptions, DrawableContentProps } from '../../../../../components/Drawer/index';
import { DisplayAdResource } from '../../../../../models/creative/CreativeResource';
import { RendererDataProps } from '../../../../../models/campaign/display/AdResource';
import { DataResponse } from '../../../../../services/ApiService';
import { PropertyResourceShape } from '../../../../../models/plugin';

interface CreateCreativePageProps {
  closeNextDrawer: () => void;
  openNextDrawer: <T>(component: React.ComponentClass<T & DrawableContentProps | T>, options: DrawableContentOptions<T>) => void;
}

type JoinedProps = CreateCreativePageProps & RouteComponentProps<{ organisationId: string }>;

class CreateCreativePage extends React.Component<JoinedProps> {

  state = {
    loading: false,
  };

  render() {

    const {
      match: {
        params: { organisationId },
      },
      history,
      location,
      closeNextDrawer,
      openNextDrawer,
    } = this.props;

    const onSave = (creative: DisplayAdResource, properties: PropertyResourceShape[], rendererData: RendererDataProps) => {
      this.setState({ loading: true });
      createDisplayCreative(creative, properties, organisationId, rendererData)
        .then((newCreative: DataResponse<DisplayAdResource>) => {
          this.setState({ loading: false });
          const newCreativeId = newCreative.data.id;
          history.push(`/v2/o/${organisationId}/creatives/display/edit/${newCreativeId}`);
        });
    };

    const onClose = () => (
      location.state && location.state.from
      ? history.push(location.state.from)
      : history.push(`/v2/o/${organisationId}/creatives/display`)
    );

    return (
      <DisplayCreativeContent
        closeNextDrawer={closeNextDrawer}
        onClose={onClose}
        openNextDrawer={openNextDrawer}
        save={onSave}
      />
    );
  }
}

export default compose<JoinedProps, CreateCreativePageProps>(
  withMcsRouter,
  withDrawer,
)(CreateCreativePage);
