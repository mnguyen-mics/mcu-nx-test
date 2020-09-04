import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import * as FeatureSelectors from '../../../../../redux/Features/selectors';
import {
  DatamartReplicationRouteMatchParam,
  DatamartReplicationFormData,
  INITIAL_DATAMART_REPLICATION_FORM_DATA,
} from './domain';
import { messages } from '../List/messages';
import Loading from '../../../../../components/Loading';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { getWorkspace } from '../../../../../redux/Session/selectors';
import { MicsReduxState } from '../../../../../utils/ReduxHelper';
import { Layout, message, Row, Col } from 'antd';
import { FormLayoutActionbar } from '../../../../../components/Layout';
import { FormLayoutActionbarProps } from '../../../../../components/Layout/FormLayoutActionbar';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IDatamartReplicationService } from '../../../../../services/DatamartReplicationService';
import DatamartReplicationCard from './DatamartReplicationCard';
import DatamartReplicationEditForm from './DatamartReplicationEditForm';
import { ReplicationType } from '../../../../../models/settings/settings';
import { FormTitle } from '../../../../../components/Form';
import DatamartSelector from '../../../../Datamart/DatamartSelector';
import { DatamartResource } from '../../../../../models/datamart/DatamartResource';
import { isEmpty } from 'lodash';

interface State {
  datamartReplicationData: DatamartReplicationFormData;
  isLoading: boolean;
  selectedType?: ReplicationType;
  replicationTypes: string[];
  datamartId?: string;
}

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<DatamartReplicationRouteMatchParam>;

class EditDatamartReplicationPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IDatamartReplicationService)
  private _datamartReplicationService: IDatamartReplicationService;

  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: false,
      datamartReplicationData: INITIAL_DATAMART_REPLICATION_FORM_DATA,
      replicationTypes: ['GOOGLE_PUBSUB'],
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { datamartId, datamartReplicationId },
      },
      notifyError,
      location: { state },
    } = this.props;
    if (datamartReplicationId) {
      this.setState({
        isLoading: true,
      });
      this._datamartReplicationService
        .getDatamartReplication(datamartId, datamartReplicationId)
        .then(response => {
          this.setState({
            datamartReplicationData: response.data,
            isLoading: false,
            selectedType: response.data.type,
            datamartId: response.data.datamart_id,
          });
        })
        .catch(err => {
          notifyError(err);
          this.setState({
            isLoading: false,
          });
        });
    } else if (state && state.datamartId) {
      this.setState({
        datamartId: state.datamartId,
      });
    }
  }

  save = (datamartReplicationFormData: DatamartReplicationFormData) => {
    const {
      notifyError,
      history,
      intl,
      location: { state },
      match: {
        params: { datamartReplicationId },
      },
    } = this.props;

    const {
      credentials_uri,
      ...formDataWithoutCredentialsUri
    } = datamartReplicationFormData;

    if (isEmpty(credentials_uri)) {
      notifyError(new Error('Credentials must be defined'), {
        intlDescription: messages.datamartReplicationCredentialsUriError,
      });
      return; 
    }

    const { selectedType } = this.state;
    this.setState({
      isLoading: true,
    });

    const hideSaveInProgress = message.loading(
      intl.formatMessage(messages.savingInProgress),
      0,
    );

    const datamartId =
      datamartReplicationFormData.datamart_id || (state && state.datamartId);

    if (datamartId) {
      const newFormData = {
        ...formDataWithoutCredentialsUri,
        datamart_id: datamartId,
        type: selectedType,
      };

      const promise = datamartReplicationId
        ? this._datamartReplicationService.updateDatamartReplication(
            datamartId,
            datamartReplicationId,
            newFormData,
          )
        : this._datamartReplicationService.createDatamartReplication(
            datamartId,
            newFormData,
          );

      promise
        .then(response => {
          if (datamartReplicationFormData.credentials_uri) {
            this._datamartReplicationService
              .uploadDatamartReplicationCredentials(
                datamartId,
                response.data.id,
                datamartReplicationFormData.credentials_uri,
              )
              .catch(error => {
                notifyError(error);
                this.setState({
                  isLoading: false,
                });
              });
          }
        })
        .then(() => {
          hideSaveInProgress();
          history.push({
            pathname: this.getPreviousUrl(),
            state: { activeTab: 'Replications' },
          });
        })
        .catch(err => {
          notifyError(err);
          hideSaveInProgress();
          this.setState({
            isLoading: false,
          });
        });
    }
  };

  getPreviousUrl = () => {
    const {
      match: {
        params: { organisationId, datamartId },
      },
      location: { state },
    } = this.props;
    return state && !!state.datamartId
      ? `/v2/o/${organisationId}/settings/datamart/datamarts/${state.datamartId}`
      : datamartId
      ? `/v2/o/${organisationId}/settings/datamart/datamarts/${datamartId}`
      : `/v2/o/${organisationId}/settings/datamart/datamarts`;
  };

  onClose = () => {
    const { history } = this.props;
    return history.push({
      pathname: this.getPreviousUrl(),
      state: {
        activeTab: 'Replications',
      },
    });
  };

  onSelectType = (type: ReplicationType) => {
    this.setState({
      selectedType: type,
    });
  };

  renderReplicationCards = () => {
    const array = [];
    const size = 6;

    const { replicationTypes } = this.state;

    const cards = replicationTypes.map(type => {
      return (
        <Col key={type} span={4}>
          <DatamartReplicationCard type={type} onClick={this.onSelectType} />
        </Col>
      );
    });

    while (cards.length > 0) array.push(cards.splice(0, size));

    return array.map((arr, i) => (
      <Row
        key={i}
        style={{ marginTop: 30, marginBottom: 40 }}
        type={'flex'}
        gutter={40}>
        {arr}
      </Row>
    ));
  };

  onDatamartSelect = (datamart: DatamartResource) => {
    this.setState({
      datamartId: datamart.id,
    });
  };

  render() {
    const {
      match: {
        params: { datamartReplicationId },
      },
      intl: { formatMessage },
    } = this.props;

    const {
      isLoading,
      datamartReplicationData,
      selectedType,
      datamartId,
    } = this.state;

    if (isLoading) {
      return <Loading className="loading-full-screen" />;
    }

    const replicationName =
      datamartReplicationId && datamartReplicationData.name
        ? datamartReplicationData.name
        : formatMessage(messages.newDatamartReplication);

    const breadcrumbPaths = [
      {
        name: formatMessage(messages.datamartReplications),
        path: this.getPreviousUrl(),
        state: { activeTab: 'Replications' },
      },
      {
        name: replicationName,
      },
    ];

    const actionBarProps: FormLayoutActionbarProps = {
      formId: 'datamartReplicationForm',
      paths: breadcrumbPaths,
      onClose: this.onClose,
    };

    return !datamartId ? (
      <DatamartSelector
        onSelect={this.onDatamartSelect}
        isMainlayout={true}
        actionbarProps={{
          paths: [
            {
              name: formatMessage(messages.datamartReplications),
              path: this.getPreviousUrl(),
            },
          ],
        }}
      />
    ) : selectedType ? (
      <DatamartReplicationEditForm
        initialValues={datamartReplicationData}
        onSubmit={this.save}
        close={this.onClose}
        breadCrumbPaths={breadcrumbPaths}
        type={selectedType}
      />
    ) : (
      <Layout className="edit-layout">
        <FormLayoutActionbar {...actionBarProps} />
        <Layout
          className={
            'mcs-content-container ant-layout-content mcs-form-container'
          }>
          <FormTitle
            title={messages.datamartReplicationTypeSelectionTitle}
            subtitle={messages.datamartReplicationTypeSelectionSubtitle}
          />
          {this.renderReplicationCards()}
        </Layout>
      </Layout>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  workspace: getWorkspace(state),
  hasFeature: FeatureSelectors.hasFeature(state),
});

export default compose(
  withRouter,
  injectIntl,
  connect(mapStateToProps),
  injectNotifications,
)(EditDatamartReplicationPage);
