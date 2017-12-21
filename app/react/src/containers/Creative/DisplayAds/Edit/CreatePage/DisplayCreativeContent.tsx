import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { RouteComponentProps } from 'react-router';

import { withMcsRouter } from '../../../../Helpers';
import DisplayCreativeCreationEditor from './DisplayCreativeCreationEditor';
import DisplayCreativeTypePicker from './DisplayCreativeTypePicker';
import CreativeService from '../../../../../services/CreativeService';
import PluginService from '../../../../../services/PluginService';
import * as actions from '../../../../../state/Notifications/actions';
import log from '../../../../../utils/Logger';
import Loading from '../../../../../components/Loading';
import { EditContentLayout } from '../../../../../components/Layout/';
import { DrawableContentProps, DrawableContentOptions } from '../../../../../components/Drawer';
import messages from '../messages';
import { RendererDataProps, AdRendererProps } from '../../../../../models/campaign/display/AdResource';
import { DisplayAdResource } from '../../../../../models/creative/CreativeResource';
import { PropertyResourceShape } from '../../../../../models/plugin';

const formId = 'creativeEditor';

interface DisplayCreativeContentProps {
  closeNextDrawer: () => void;
  openNextDrawer: <T>(component: React.ComponentClass<T & DrawableContentProps | T>, options: DrawableContentOptions<T>) => void;
  onClose: () => void;
  save: (
    creativeData: Partial<DisplayAdResource>,
    formattedProperties: PropertyResourceShape[],
    rendererData: RendererDataProps,
  ) => void;
  drawerMode?: boolean;
}

interface DisplayCreativeContentState {
  adRenderer: AdRendererProps;
  isLoading: boolean;
  rendererProperties: PropertyResourceShape[];
  formats: string[];
}

type JoinedProps = DisplayCreativeContentProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class DisplayCreativeContent extends React.Component<JoinedProps, DisplayCreativeContentState> {

  static defaultProps: Partial<DisplayCreativeContentProps> = {
    drawerMode: false,
  };

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

  redirect = () => {
    const {
      history,
      match: {
        params: {
          organisationId,
        },
      },
    } = this.props;
    const emailCampaignListUrl = `/v2/o/${organisationId}/creatives/display`;
    history.push(emailCampaignListUrl);
  }

  onSelect = (adRenderer: string) => {
    const {
      match: {
        params: {
          organisationId,
        },
      },
    } = this.props;
    this.setState(prevState => {
      const nextState = {
        ...prevState,
      };
      nextState.isLoading = true;
      return nextState;
    }, () => {
      PluginService
        .getPluginVersions(adRenderer)
        .then(res => {
          const lastVersion = res.data[res.data.length - 1];

          const pluginPropertiesPromise = PluginService.getPluginVersionProperty(adRenderer, lastVersion.id);
          const formatsPromises = CreativeService.getCreativeFormats(organisationId).then(resp => resp.data);

          Promise.all([pluginPropertiesPromise, formatsPromises])
            .then(values => {
              this.setState(prevState => {
                const nextState = {
                  ...prevState,
                };
                nextState.rendererProperties = values[0].sort((a) => {
                  return a.writable === false ? -1 : 1;
                });
                nextState.formats = values[1].filter(item => {
                  return item.type === 'DISPLAY_AD';
                }).sort((a, b) => {
                  return a.width - b.width;
                }).map(item => {
                  return `${item.width}x${item.height}`;
                });

                nextState.adRenderer = {
                  id: adRenderer,
                  version_id: lastVersion.id,
                  artifact_id: lastVersion.artifact_id,
                  group_id: lastVersion.group_id,
                };
                nextState.isLoading = false;
                return nextState;
              });
            })
            .catch(err => {
              actions.notifyError(err);
              this.setState(() => {
                return { isLoading: false };
              });
            });

        })
        .catch((err: any) => {
          log.debug(err);
          actions.notifyError(err);
          this.setState(prevState => {
            const nextState = {
              ...prevState,
            };
            nextState.isLoading = true;
            return nextState;
          });
        });
    });
  }

  onReset = () => {
    this.setState(prevState => {
      const nextState = {
        ...prevState,
      };
      nextState.adRenderer = {
        id: '',
        version_id: '',
        artifact_id: '',
        group_id: '',
      };
      return nextState;
    });

  }

  render() {
    const {
      match: {
        params: {
          organisationId,
        },
      },
      intl: { formatMessage },
      onClose,
      match: {
        url,
      },
      drawerMode,
    } = this.props;

    const {
      adRenderer,
      isLoading,
    } = this.state;

    const sidebarItems = {
      creative: messages.creativeSiderMenuCreativeType,
      general_infos: messages.creativeSiderMenuGeneralInformation,
      properties: messages.creativeSiderMenuProperties,
    };

    const buttonMetadata = {
      formId: formId,
      message: drawerMode ? messages.addCreative : messages.saveCreative,
      onClose: onClose,
    };

    const breadcrumbPaths = [
      { name: formatMessage(messages.creativeCreationBreadCrumb) },
    ];

    return (
      <div className="ant-layout">
        {isLoading ?
          <div style={{ display: 'flex', flex: 1 }}>
            <Loading className="loading-full-screen" />
          </div>
          :
          (adRenderer.id && adRenderer.version_id) ?
            <EditContentLayout
              breadcrumbPaths={breadcrumbPaths}
              sidebarItems={sidebarItems}
              buttonMetadata={buttonMetadata}
              url={url}
              changeType={this.onReset}
              isCreativetypePicker={false}
            >
              <DisplayCreativeCreationEditor
                save={this.props.save}
                adRenderer={adRenderer}
                isLoading={isLoading}
                formats={this.state.formats}
                rendererProperties={this.state.rendererProperties}
                organisationId={organisationId}
                formId={formId}
              />
            </EditContentLayout>
            :
            <div className="ant-layout">
              <EditContentLayout
                breadcrumbPaths={breadcrumbPaths}
                buttonMetadata={buttonMetadata}
                url={url}
                isCreativetypePicker={true}
              >
                <DisplayCreativeTypePicker
                  onSelect={this.onSelect}
                  formId={formId}
                />
              </EditContentLayout>
            </div>}
      </div>
    );
  }
}

export default compose<JoinedProps, DisplayCreativeContentProps>(
  injectIntl,
  withMcsRouter,
  connect(
    undefined,
    { notifyError: actions.notifyError },
  ),
)(DisplayCreativeContent);
