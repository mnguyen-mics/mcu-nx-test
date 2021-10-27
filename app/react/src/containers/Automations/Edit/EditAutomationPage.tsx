import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import queryString from 'query-string';
import { withRouter, RouteComponentProps, StaticContext } from 'react-router';
import { message } from 'antd';
import { injectIntl, InjectedIntlProps, FormattedMessage, defineMessages } from 'react-intl';
import * as NotificationActions from '../../../redux/Notifications/actions';
import * as FeatureSelectors from '../../../redux/Features/selectors';
import { EditAutomationParam, AutomationFormData } from './domain';
import { INITIAL_AUTOMATION_DATA } from '../Edit/domain';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { Loading } from '../../../components';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { DatamartResource } from '../../../models/datamart/DatamartResource';
import { IAutomationFormService } from './AutomationFormService';
import { IDatamartService } from '../../../services/DatamartService';
import { IScenarioService } from '../../../services/ScenarioService';
import AutomationBuilderContainer from '../Builder/AutomationBuilderContainer';
import { MicsReduxState } from '@mediarithmics-private/advanced-components';

interface State {
  automationFormData: AutomationFormData;
  loading: boolean;
  datamart?: DatamartResource;
}

interface MapStateProps {
  notifyError: (err: any) => void;
}

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  MapStateProps &
  RouteComponentProps<EditAutomationParam, StaticContext, { from?: string }>;

class EditAutomationPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IAutomationFormService)
  private _automationFormService: IAutomationFormService;

  @lazyInject(TYPES.IScenarioService)
  private _scenarioService: IScenarioService;

  @lazyInject(TYPES.IDatamartService)
  private _datamartService: IDatamartService;

  constructor(props: Props) {
    super(props);
    this.state = {
      loading: true,
      automationFormData: INITIAL_AUTOMATION_DATA,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { automationId },
      },
      location: { search },
    } = this.props;
    const datamartId = queryString.parse(search).datamartId as string;

    if (automationId) {
      this.loadData(automationId);
    }
    if (!automationId && datamartId) {
      this.fetchDatamart(datamartId);
    }
  }

  componentDidUpdate(prevProps: Props) {
    const {
      match: {
        params: { automationId },
      },
      location: { search },
    } = this.props;

    const {
      match: {
        params: { automationId: prevAutomationId },
      },
      location: { search: prevSearch },
    } = prevProps;

    if (automationId && automationId !== prevAutomationId) {
      this.loadData(automationId);
    }
    const datamartId = queryString.parse(search).datamartId as string;
    const preDatamartId = queryString.parse(prevSearch).datamartId;
    if (!automationId && automationId !== prevAutomationId && datamartId !== preDatamartId) {
      this.fetchDatamart(datamartId);
    }
  }

  fetchDatamart = (datamartId: string) => {
    this.setState({ loading: true });
    return this._datamartService
      .getDatamart(datamartId)
      .then(r => this.setState({ datamart: r.data, loading: false }))
      .catch(err => {
        this.props.notifyError(err);
        this.setState({ loading: false });
      });
  };

  loadData = (automationId: string) => {
    this.setState({ loading: true });
    return this._scenarioService
      .getScenario(automationId)
      .then(r => this._datamartService.getDatamart(r.data.datamart_id))
      .then(({ data: datamartResource }) => {
        return this._automationFormService.loadInitialAutomationValues(automationId).then(data => {
          this.setState({
            datamart: datamartResource,
            automationFormData: data,
            loading: false,
          });
        });
      })
      .catch((err: any) => {
        this.props.notifyError(err);
        this.setState({ loading: false });
      });
  };

  save = (formData: AutomationFormData) => {
    const {
      match: {
        params: { organisationId, automationId },
      },
    } = this.props;

    const { datamart, automationFormData } = this.state;

    if (datamart) {
      this.setState({ loading: true });

      this._automationFormService
        .validateAutomation(formData.automationTreeData)
        .then(() => {
          const saveOrUpdate = this._automationFormService.saveOrCreateAutomation(
            organisationId,
            formData,
            automationFormData,
          );
          saveOrUpdate
            .then(() => {
              this.setState({ loading: false });
              this.props.history.push(
                `/v2/o/${this.props.match.params.organisationId}/automations/${automationId}`,
              );
            })
            .catch(err => {
              this.setState({ loading: false });
              this.props.notifyError(err.data);
            });
        })
        .catch(validationError => {
          this.setState({
            loading: false,
            automationFormData: formData,
          });
          message.error(this.props.intl.formatMessage(validationError));
        });
    }
  };

  onClose = () => {
    const {
      history,
      match: {
        params: { organisationId },
      },
      location: { state },
    } = this.props;
    history.push(state && state.from ? state.from : `/v2/o/${organisationId}/automations`);
  };

  render() {
    const {
      match: {
        params: { automationId },
      },
    } = this.props;

    const { loading, datamart } = this.state;

    if (loading) {
      return <Loading isFullScreen={true} />;
    }

    if (automationId && !loading && datamart) {
      return (
        <AutomationBuilderContainer
          datamartId={datamart.id}
          automationFormData={this.state.automationFormData}
          saveOrUpdate={this.save}
          loading={this.state.loading}
          edition={true}
        />
      );
    }

    return <FormattedMessage {...messages.dontExist} />;
  }
}

export default compose<Props, {}>(
  withRouter,
  injectIntl,
  injectNotifications,
  connect(
    (state: MicsReduxState) => ({
      hasFeature: FeatureSelectors.hasFeature(state),
    }),
    {
      notifyError: NotificationActions.notifyError,
    },
  ),
)(EditAutomationPage);

const messages = defineMessages({
  dontExist: {
    id: 'automation.edit.dontexist',
    defaultMessage:
      "The automation you are trying to load doesn't seem to exist or you don't have the right to view it",
  },
});
