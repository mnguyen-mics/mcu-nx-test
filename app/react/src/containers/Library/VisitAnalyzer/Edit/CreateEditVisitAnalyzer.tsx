import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import PluginContent from '../../../Plugin/Edit/PluginContent';
import VisitAnalyzerService from '../../../../services/Library/VisitAnalyzerService';
import * as actions from '../../../../state/Notifications/actions';
import { PluginProperty, VisitAnalyzer, PluginInterface} from '../../../../models/Plugins';

import messages from './messages';

interface VisitAnalyzerRouteParam {
  organisationId: string;
  visitAnalyzerId?: string;
}

interface VisitAnalyzerForm {
  plugin: any;
  properties?: PluginProperty[];
}

interface CreateVisitAnalyzerState {
  edition: boolean;
  isLoading: boolean;
  initialValues?: VisitAnalyzerForm;
  selectedVisitAnalyzer?: PluginInterface;
}

interface CreateVisitAnalyzerProps {
  notifyError: (err?: any) => void;
}

type JoinedProps = CreateVisitAnalyzerProps & RouteComponentProps<VisitAnalyzerRouteParam> & InjectedIntlProps;

class CreateEditVisitAnalyzer extends React.Component<
  JoinedProps,
  CreateVisitAnalyzerState
> {

  constructor(props: JoinedProps) {
    super(props);

    this.state = {
      edition: props.match.params.visitAnalyzerId ? true : false,
      isLoading: true,
    };

  }

  componentDidMount() {
    const {
      edition,
    } = this.state;
    const {
      match: { params: { visitAnalyzerId } },
    } = this.props;
    if (edition && visitAnalyzerId) {
      this.fetchInitialValues(visitAnalyzerId);
    } else {
      this.setState({
        isLoading: false,
      });
    }
  }

  componentWillReceiveProps(nextProps: JoinedProps) {
    const {
      match: { params: { organisationId, visitAnalyzerId } },
    } = this.props;
    const {
      match: { params: { organisationId: nextOrganisationId, visitAnalyzerId: nextVisitAnalyzerId } },
    } = nextProps;

    if ((organisationId !== nextOrganisationId || visitAnalyzerId !== nextVisitAnalyzerId) && nextVisitAnalyzerId) {
      this.fetchInitialValues(nextVisitAnalyzerId);
    }
  }

  fetchInitialValues = (visitAnalyzerId: string) => {
    const fetchVisitAnalyzer = VisitAnalyzerService.getVisitAnalyzer(visitAnalyzerId).then(res => res.data);
    const fetchVisitAnalyzerProperties = VisitAnalyzerService.getVisitAnalyzerProperty(visitAnalyzerId)
      .then(res => res.data);
    this.setState({
      isLoading: true,
    }, () => {
      Promise.all([fetchVisitAnalyzer, fetchVisitAnalyzerProperties]).then(res => {
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
    const attributionModelUrl = `/v2/o/${organisationId}/library/visit_analyzers`;
    history.push(attributionModelUrl);
  }

  saveOrCreatePluginInstance = (plugin: VisitAnalyzer, properties: PluginProperty[]) => {

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
        VisitAnalyzerService.updateVisitAnalyzer(plugin.id, plugin)
        .then(res => {
          return this.updatePropertiesValue(properties, organisationId, plugin.id);
        }).then(res => {
          this.setState({ isLoading: false }, () => {
            history.push(`/v2/o/${organisationId}/library/visit_analyzers`);
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
      VisitAnalyzerService.createVisitAnalyzer(organisationId, formattedFormValues)
      .then(res => res.data)
      .then(res => {
        return this.updatePropertiesValue(properties, organisationId, res.id);
      })
      .then(res => {
        this.setState({ isLoading: false }, () => {
          history.push(`/v2/o/${organisationId}/library/visit_analyzers`);
        });
      })
      .catch(err => notifyError(err));
    });
  }

  updatePropertiesValue = (properties: PluginProperty[], organisationId: string, id: string) => {
    const propertiesPromises: Array<Promise<any>> = [];
    properties.forEach(item => {
      propertiesPromises.push(VisitAnalyzerService.updateVisitAnalyzerProperty(organisationId, id, item.technical_name, item));
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
        pluginType={'ACTIVITY_ANALYZER'}
        listTitle={messages.listTitle}
        listSubTitle={messages.listSubTitle}
        breadcrumbPaths={breadcrumbPaths}
        saveOrCreatePluginInstance={this.saveOrCreatePluginInstance}
        onClose={this.redirect}
        onSelect={this.onSelect}
        editionMode={this.state.edition}
        initialValue={this.state.initialValues}
        loading={isLoading}
      />
    );
  }
}

export default compose<JoinedProps, {}>(
  injectIntl,
  withRouter,
  // withDrawer,
  connect(
    undefined,
    { notifyError: actions.notifyError },
  ),
)(CreateEditVisitAnalyzer);
