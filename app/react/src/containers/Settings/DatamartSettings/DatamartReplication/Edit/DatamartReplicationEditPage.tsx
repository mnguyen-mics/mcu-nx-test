import * as React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withRouter, RouteComponentProps } from 'react-router';
// import { message } from 'antd';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import * as FeatureSelectors from '../../../../../state/Features/selectors';
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
import { injectDatamart, InjectedDatamartProps } from '../../../../Datamart';
// import { FormLayoutActionbarProps } from '../../../../../components/Layout/FormLayoutActionbar';
import { getWorkspace } from '../../../../../state/Session/selectors';
// import { lazyInject } from '../../../../../config/inversify.config';
// import { TYPES } from '../../../../../constants/types';
import { MicsReduxState } from '../../../../../utils/ReduxHelper';
import { Layout } from 'antd';
import { FormLayoutActionbar } from '../../../../../components/Layout';
import { FormLayoutActionbarProps } from '../../../../../components/Layout/FormLayoutActionbar';
import { DatamartResource } from '../../../../../models/datamart/DatamartResource';
import DatamartSelector from '../../../../../containers/Audience/Common/DatamartSelector';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import { IDatamartReplicationService } from '../../../../../services/DatamartReplicationService';

interface State {
  formData: DatamartReplicationFormData;
  isLoading: boolean;
  selectedDatamartId: string;
}

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  RouteComponentProps<DatamartReplicationRouteMatchParam> &
  InjectedDatamartProps;

class EditDatamartReplicationPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IDatamartReplicationService)
  private _datamartReplicationService: IDatamartReplicationService;

  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: false,
      selectedDatamartId: '',
      formData: INITIAL_DATAMART_REPLICATION_FORM_DATA,
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { datamartId, datamartReplicationId },
      },
      notifyError,
    } = this.props;
    if (datamartReplicationId) {
      this.setState({
        isLoading: true,
      });
      this._datamartReplicationService
        .getDatamartReplication(datamartId, datamartReplicationId)
        .then(response => {
          this.setState({
            formData: response.data,
            isLoading: false,
          });
        })
        .catch(err => {
          notifyError(err);
          this.setState({
            isLoading: false,
          });
        });
    }
  }

  onDatamartSelect = (datamart: DatamartResource) => {
    this.setState({
      selectedDatamartId: datamart.id,
    });
  };

  getDatamartId = () => {
    const {
      match: {
        params: { datamartReplicationId },
      },
    } = this.props;
    const { formData, selectedDatamartId } = this.state;
    let datamartId: string;
    if (datamartReplicationId) {
      datamartId = formData.datamart_id
        ? formData.datamart_id
        : datamartReplicationId;
    } else {
      datamartId = selectedDatamartId;
    }
    return datamartId;
  };

  save = () => {
    // const {
    //   match: {
    //     params: { organisationId },
    //   },
    //   notifyError,
    //   history,
    //   intl,
    // } = this.props;
  };

  onClose = () => {
    const {
      history,
      location,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const defaultRedirectUrl = `/v2/o/${organisationId}/settings/datamart/my_datamart`;

    return location.state && location.state.from
      ? history.push(location.state.from)
      : history.push(defaultRedirectUrl);
  };

  render() {
    const {
      match: {
        params: { organisationId, datamartReplicationId },
      },
      intl,
    } = this.props;

    const { isLoading, formData } = this.state;

    if (isLoading) {
      return <Loading className="loading-full-screen" />;
    }

    const replicationName =
      datamartReplicationId && formData.name
        ? formData.name
        : intl.formatMessage(messages.newDatamartReplication);

    const breadcrumbPaths = [
      {
        name: messages.datamartReplications,
        path: `/v2/o/${organisationId}/settings/datamart/datamart_replications`,
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

    const datamartId = this.getDatamartId();

    return datamartId ? (
      <Layout className="edit-layout">
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          {'choose where to replicate your data'}
        </Layout>
      </Layout>
    ) : (
      <Layout className="edit-layout">
        <FormLayoutActionbar {...actionBarProps} />
        <DatamartSelector onSelect={this.onDatamartSelect} />
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
  injectDatamart,
  connect(mapStateToProps),
  injectNotifications,
)(EditDatamartReplicationPage);
