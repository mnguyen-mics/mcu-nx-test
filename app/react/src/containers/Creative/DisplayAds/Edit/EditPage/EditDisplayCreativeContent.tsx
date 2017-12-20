import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { RouteComponentProps } from 'react-router';

import { withMcsRouter } from '../../../../Helpers';
import DisplayCreativeEditionEditor from './DisplayCreativeEditionEditor';
import CreativeService from '../../../../../services/CreativeService';
import * as actions from '../../../../../state/Notifications/actions';
import Loading from '../../../../../components/Loading';
import log from '../../../../../utils/Logger';
import { EditContentLayout } from '../../../../../components/Layout';
import messages from '../messages';
import { DrawableContentProps, DrawableContentOptions } from '../../../../../components/Drawer';
import { FormattedPropertiesProps } from '../../../../../models/campaign/display/AdResource';
import { DisplayAdResource } from '../../../../../models/creative/CreativeResource';
import { PropertyResourceShape } from '../../../../../models/plugin';

const formId = 'creativeEditionForm';

interface EditDisplayCreativeContentProps {
  creativeId: string;
  organisationId?: string;
  onClose: () => void; // check type
  save: (
    creativeData: Partial<DisplayAdResource>,
    formattedProperties: PropertyResourceShape[],
    // rendererData: RendererDataProps,
  ) => void;
  closeNextDrawer: () => void;
  openNextDrawer: <T>(component: React.ComponentClass<T & DrawableContentProps | T>, options: DrawableContentOptions<T>) => void;
}

interface RouteProps {
  organisationId: string;
  creativeId: string;
}

interface EditDisplayCreativeContentState {
  formats: string[];
  rendererProperties: FormattedPropertiesProps[];
  creative: DisplayAdResource | {};
  isLoading: boolean;
}

type JoinedProps = EditDisplayCreativeContentProps & InjectedIntlProps & RouteComponentProps<RouteProps>;

class EditDisplayCreativeContent extends React.Component<JoinedProps, EditDisplayCreativeContentState> {

  constructor(props: JoinedProps) {
    super(props);
    this.state = {
      formats: [],
      rendererProperties: [],
      creative: {},
      isLoading: false,
    };
  }

  fetchAllData = (organisationId: string, creativeId: string) => {

    const getFormats = CreativeService.getCreativeFormats(organisationId).then(res => res.data);
    const getRendererProperties = CreativeService.getCreativeRendererProperties(creativeId).then(res => res.data);
    const getCreative = CreativeService.getCreative(creativeId).then(res => res.data);

    this.setState(prevState => {
      const nextState = {
        ...prevState,
      };
      nextState.isLoading = true;
      return nextState;
    }, () => {
      Promise.all([getFormats, getRendererProperties, getCreative]).then(values => {
        this.setState(prevState => {
          const nextState = {
            ...prevState,
          };
          nextState.formats = values[0].filter(item => {
            return item.type === 'DISPLAY_AD';
          }).sort((a, b) => {
            return a.width - b.width;
          }).map(item => {
            return `${item.width}x${item.height}`;
          });
          nextState.rendererProperties = values[1].sort((a) => {
            return a.writable === false ? -1 : 1;
          });
          nextState.creative = values[2];
          nextState.isLoading = false;
          return nextState;
        });
      })
      .catch(err => {
        log.error(err);
        actions.notifyError(err);
      });
    });
  }

  componentDidMount() {
    const {
      match: {
        params: {
          organisationId,
        },
      },
      creativeId,
    } = this.props;
    this.fetchAllData(organisationId, creativeId);
  }

  componentWillReceiveProps(nextProps: JoinedProps) {
    const {
      match: {
        params: {
          organisationId: nextOrganisationId,
          creativeId: nextCreativeId,
        },
      },
    } = nextProps;

    const {
      match: {
        params: {
          organisationId,
          creativeId,
        },
      },
    } = this.props;

    if (organisationId !== nextOrganisationId || creativeId !== nextCreativeId) {
      this.fetchAllData(nextOrganisationId, nextCreativeId);
    }
  }

  refreshCreative = () => {
    const {
      match: {
        params: {
          organisationId,
          creativeId,
        },
      },
    } = this.props;

    this.fetchAllData(organisationId, creativeId);
  }

  formatProperties = () => {
    const {
      rendererProperties,
    } = this.state;

    const formattedProperties: any = {};
    rendererProperties.forEach(item => {
      formattedProperties[item.technical_name] = { value: item.value };
    });

    return formattedProperties;
  }

  render() {
    const {
      organisationId,
      intl: { formatMessage },
      onClose,
      match: { url },
    } = this.props;

    const {
      isLoading,
    } = this.state;

    const sidebarItems = {
      general_infos: messages.creativeSiderMenuGeneralInformation,
      audit_status: messages.creativeSiderMenuAudit,
      properties: messages.creativeSiderMenuProperties,
      preview: messages.creativeSiderMenuPreview,
    };

    const buttonMetadata = {
      formId: formId,
      message: messages.saveCreative,
      onClose: onClose,
    };

    const breadcrumbPaths = [
      { name: formatMessage(messages.creativeCreationBreadCrumb) },
    ];

    return this.state.isLoading ?
    (
      <div style={{ display: 'flex', flex: 1 }}>
        <Loading className="loading-full-screen" />
      </div>
    ) :
    (
      <EditContentLayout
        breadcrumbPaths={breadcrumbPaths}
        sidebarItems={sidebarItems}
        buttonMetadata={buttonMetadata}
        url={url}
        isCreativetypePicker={false}
        changeType={undefined}
      >
        <DisplayCreativeEditionEditor
          save={this.props.save}
          creative={this.state.creative}
          rendererProperties={this.state.rendererProperties}
          formats={this.state.formats}
          refreshCreative={this.refreshCreative}
          organisationId={organisationId}
          isLoading={isLoading}
          formId={formId}
        />
      </EditContentLayout>
    );
  }
}

export default compose<JoinedProps, EditDisplayCreativeContentProps>(
  withMcsRouter,
  injectIntl,
  connect(
    undefined,
    { notifyError: actions.notifyError },
  ),
)(EditDisplayCreativeContent);
