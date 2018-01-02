import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { RouteComponentProps } from 'react-router';
import { ConfigProps, Omit } from 'redux-form';

import * as actions from '../../../../state/Notifications/actions';
import { withMcsRouter } from '../../../Helpers';
import withDrawer, {
  DrawableContentProps,
} from '../../../../components/Drawer';
import { PropertyResourceShape } from '../../../../models/plugin';
import DisplayCreativeRendererSelector from './DisplayCreativeRendererSelector';
import PluginService from '../../../../services/PluginService';
import CreativeService from '../../../../services/CreativeService';
import { AdRendererProps } from '../../../../models/campaign/display/AdResource';
import log from '../../../../utils/Logger';
import { DisplayCreativeForm } from './index';
import messages from './messages';
import { DisplayCreativeFormData } from './domain';

export interface DisplayCreativeCreatorProps
  extends DrawableContentProps,
    Omit<ConfigProps<DisplayCreativeFormData>, 'form'> {
  save: (creativeData: DisplayCreativeFormData) => void;
  close: () => void;
  actionBarButtonText: FormattedMessage.MessageDescriptor;
}

interface DisplayCreativeCreatorState {
  adRenderer: AdRendererProps;
  isLoading: boolean;
  rendererProperties: PropertyResourceShape[];
  formats: string[];
}

interface RouteProps {
  organisationId: string;
  creativeId?: string;
}

type JoinedProps = DisplayCreativeCreatorProps &
  InjectedIntlProps &
  RouteComponentProps<RouteProps>;

class DisplayCreativeCreator extends React.Component<
  JoinedProps,
  DisplayCreativeCreatorState
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

  onSelect = (adRenderer: string) => {
    const { match: { params: { organisationId } } } = this.props;
    this.setState({ isLoading: true });
    PluginService.getPluginVersions(adRenderer).then(res => {
        const lastVersion = res.data[res.data.length - 1];

        Promise.all([
          PluginService.getPluginVersionProperty(adRenderer,lastVersion.id),
          CreativeService.getCreativeFormats(organisationId).then(resp => resp.data)],
        ).then(([pluginVersionProperties, creativeFormats]) => {
            const rendererPropertiesApiRes = pluginVersionProperties.sort(a => {
              return a.writable === false ? -1 : 1;
            });
            const formatsApiRes = creativeFormats.filter(item => {
              return item.type === 'DISPLAY_AD';
            }).sort((a, b) => {
              return a.width - b.width;
            }).map(item => {
              return `${item.width}x${item.height}`;
            });
            this.setState({
              adRenderer: {
                id: adRenderer,
                version_id: lastVersion.id,
                artifact_id: lastVersion.artifact_id,
                group_id: lastVersion.group_id,
              },
              rendererProperties: rendererPropertiesApiRes,
              formats: formatsApiRes,
              isLoading: false,
            });
          }).catch(err => {
            actions.notifyError(err);
            this.setState(() => {
              return { isLoading: false };
            });
          });
      }).catch((err) => {
        log.debug(err);
        actions.notifyError(err);
        this.setState(() => {
          return { isLoading: false };
        });
      });
    };

  render() {
    const { openNextDrawer, closeNextDrawer, close, save } = this.props;

    const breadCrumbPaths = [
      {
        name: messages.creativeCreationBreadCrumb,
      },
    ];

    const { adRenderer, rendererProperties } = this.state;


    return adRenderer.id && adRenderer.version_id ? (
      <DisplayCreativeForm
        save={save}
        close={close}
        breadCrumbPaths={breadCrumbPaths}
        closeNextDrawer={closeNextDrawer}
        openNextDrawer={openNextDrawer}
        rendererVersionId={adRenderer.version_id}
        actionBarButtonText={this.props.actionBarButtonText}
        rendererProperties={rendererProperties}
        
      />
    ) : (
      <DisplayCreativeRendererSelector onSelect={this.onSelect} close={close} />
    );
  }
}

export default compose<JoinedProps, DisplayCreativeCreatorProps>(
  withMcsRouter,
  injectIntl,
  withDrawer,
  connect(undefined, { notifyError: actions.notifyError }),
)(DisplayCreativeCreator);
