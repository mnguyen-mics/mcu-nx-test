import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import PluginContent from '../../../Plugin/Edit/PluginContent';
import EmailRouterService from '../../../../services/Library/EmailRoutersService';
import * as actions from '../../../../state/Notifications/actions';
import { PluginProperty, EmailRouter, PluginInterface} from '../../../../models/Plugins';
import withDrawer, { DrawableContentProps } from '../../../../components/Drawer';

import messages from './messages';

interface EmailRouterRouteParam {
  organisationId: string;
  emailRouterId?: string;
}

interface EmailRouterForm {
  plugin: any;
  properties?: PluginProperty[];
}

interface CreateEmailRouterState {
  edition: boolean;
  isLoading: boolean;
  initialValues?: EmailRouterForm;
  selectedEmailRouter?: PluginInterface;
}

interface CreateEmailRouterProps extends DrawableContentProps {
  notifyError: (err?: any) => void;
}

type JoinedProps = CreateEmailRouterProps & RouteComponentProps<EmailRouterRouteParam> & InjectedIntlProps;

class CreateEditEmailRouter extends React.Component<
  JoinedProps,
  CreateEmailRouterState
> {

  constructor(props: JoinedProps) {
    super(props);

    this.state = {
      edition: props.match.params.emailRouterId ? true : false,
      isLoading: true,
    };

  }

  componentDidMount() {
    const {
      edition,
    } = this.state;
    const {
      match: { params: { emailRouterId } },
    } = this.props;
    if (edition && emailRouterId) {
      this.fetchInitialValues(emailRouterId);
    } else {
      this.setState({
        isLoading: false,
      });
    }
  }

  componentWillReceiveProps(nextProps: JoinedProps) {
    const {
      match: { params: { organisationId, emailRouterId } },
    } = this.props;
    const {
      match: { params: { organisationId: nextOrganisationId, emailRouterId: nextEmailRouterId } },
    } = nextProps;

    if ((organisationId !== nextOrganisationId || emailRouterId !== nextEmailRouterId) && nextEmailRouterId) {
      this.fetchInitialValues(nextEmailRouterId);
    }
  }

  fetchInitialValues = (emailRouterId: string) => {
    const fetchEmailRouter = EmailRouterService.getEmailRouter(emailRouterId).then(res => res.data);
    const fetchEmailRouterProperties = EmailRouterService.getEmailRouterProperty(emailRouterId)
      .then(res => res.data);
    this.setState({
      isLoading: true,
    }, () => {
      Promise.all([fetchEmailRouter, fetchEmailRouterProperties]).then(res => {
        this.setState({
          isLoading: false,
          initialValues: {
            plugin: res[0],
            properties: res[1],
          },
        });
      });
    });
  }

  redirect = () => {
    const { history, match: { params: { organisationId } } } = this.props;
    const attributionModelUrl = `/v2/o/${organisationId}/library/email_routers`;
    history.push(attributionModelUrl);
  }

  saveOrCreatePluginInstance = (plugin: EmailRouter, properties: PluginProperty[]) => {

    const {
      edition,
    } = this.state;

    const {
      match: { params: { organisationId } },
      history,
      notifyError,
    } = this.props;

    // if edition update and redirect
    if (edition) {
      return this.setState({ isLoading: true }, () => {
        EmailRouterService.updateEmailRouter(plugin.id, plugin)
        .then(res => {
          return this.updatePropertiesValue(properties, organisationId, plugin.id);
        }).then(res => {
          this.setState({ isLoading: false }, () => {
            history.push(`/v2/o/${organisationId}/library/email_routers`);
          });
        })
        .catch(err => notifyError(err));
      });
    }
    // if creation save and redirect
    const formattedFormValues = {
      ...plugin,
      organisation_id: organisationId,
    };
    if (this.state.initialValues) {
      formattedFormValues.artifact_id = this.state.initialValues.plugin.artifact_id;
      formattedFormValues.group_id = this.state.initialValues.plugin.group_id;
    }
    return this.setState({ isLoading: true }, () => {
      EmailRouterService.createEmailRouter(organisationId, formattedFormValues)
      .then(res => res.data)
      .then(res => {
        return this.updatePropertiesValue(properties, organisationId, res.id);
      })
      .then(res => {
        this.setState({ isLoading: false }, () => {
          history.push(`/v2/o/${organisationId}/library/email_routers`);
        });
      })
      .catch(err => notifyError(err));
    });
  }

  updatePropertiesValue = (properties: PluginProperty[], organisationId: string, id: string) => {
    const propertiesPromises: Array<Promise<any>> = [];
    properties.forEach(item => {
      propertiesPromises.push(EmailRouterService.updateEmailRouterProperty(organisationId, id, item.technical_name, item));
    });
    return Promise.all(propertiesPromises);
  }

  onSelect = (bo: PluginInterface) => {
    this.setState({
      initialValues: { plugin: bo },
    });
  }

  render() {
    const {
      intl: { formatMessage },
    } = this.props;

    const {
      isLoading,
    } = this.state;

    const breadcrumbPaths = [
      { name: formatMessage(messages.attributionModelBreadcrumb) },
    ];

    return (
      <PluginContent
        pluginType={'EMAIL_ROUTER'}
        listTitle={messages.listTitle}
        listSubTitle={messages.listSubTitle}
        breadcrumbPaths={breadcrumbPaths}
        saveOrCreatePluginInstance={this.saveOrCreatePluginInstance}
        onClose={this.redirect}
        onSelect={this.onSelect}
        editionMode={this.state.edition}
        initialValue={this.state.initialValues}
        loading={isLoading}
        openNextDrawer={this.props.openNextDrawer}
        closeNextDrawer={this.props.closeNextDrawer}
      />
    );
  }
}

export default compose(
  injectIntl,
  withDrawer,
  withRouter,
  connect(
    undefined,
    { notifyError: actions.notifyError },
  ),
)(CreateEditEmailRouter);
