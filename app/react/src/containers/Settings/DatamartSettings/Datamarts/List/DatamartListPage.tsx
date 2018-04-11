import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { Layout } from 'antd';
import { McsIconType } from '../../../../../components/McsIcon';
import ItemList, { Filters } from '../../../../../components/ItemList';
import { PAGINATION_SEARCH_SETTINGS } from '../../../../../utils/LocationSearchHelper';
import DatamartService from '../../../../../services/DatamartService';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import { DatamartResource } from '../../../../../models/datamart/DatamartResource';
import messages from './messages';
import settingsMessages from '../../../messages';
import injectNotifications, { InjectedNotificationProps } from '../../../../Notifications/injectNotifications';

const { Content } = Layout;

const initialState = {
  loading: false,
  data: [],
  total: 0,
};

interface DatamartsListPageState {
  loading: boolean;
  data: DatamartResource[];
  total: number;
}

interface RouterProps {
  organisationId: string;
}

class DatamartsListPage extends React.Component<
  RouteComponentProps<RouterProps> & InjectedIntlProps & InjectedNotificationProps,
  DatamartsListPageState
> {
  state = initialState;

  archiveUser = (recommenderId: string) => {
    return Promise.resolve();
  };

  fetchDatamarts = (organisationId: string, filter: Filters) => {
    this.setState({ loading: true }, () => {
      const options = {
        allow_administrator: true,
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      DatamartService.getDatamarts(organisationId, options)
        .then(
          (results) => {
            this.setState({
              loading: false,
              data: results.data,
              total: results.total || results.count,
            });
          },
        )
        .catch(error => {
          this.setState({ loading: false });
          this.props.notifyError(error);
        });
    });
  };

  onClickEdit = (datamart: DatamartResource) => {
    const { history, match: { params: { organisationId } } } = this.props;

    history.push(
      `/v2/o/${organisationId}/settings/datamart/my_datamart/${datamart.id}/edit`,
    );
  };

  render() {

    const actionsColumnsDefinition = [
      {
        key: 'action',
        actions: [{ translationKey: 'EDIT', callback: this.onClickEdit }],
      },
    ];

    const dataColumnsDefinition = [
      {
        intlMessage: messages.datamartId,
        key: 'id',
        isHideable: false,
      },
      {
        intlMessage: messages.datamartToken,
        key: 'name',
        isVisibleByDefault: true,
        isHideable: false,
      },
    ];

    const emptyTable: {
      iconType: McsIconType;
      intlMessage: FormattedMessage.Props;
    } = {
      iconType: 'settings',
      intlMessage: messages.emptyDatamarts,
    };


    const additionnalComponent = (
      <div>
        <div className="mcs-card-header mcs-card-title">
          <span className="mcs-card-title">
            <FormattedMessage {...settingsMessages.datamarts} />
          </span>
        </div>
        <hr className="mcs-separator" />
      </div>
    );

    return (
      <div className="ant-layout">
        <Content className="mcs-content-container">
          <ItemList
            fetchList={this.fetchDatamarts}
            dataSource={this.state.data}
            loading={this.state.loading}
            total={this.state.total}
            columns={dataColumnsDefinition}
            actionsColumnsDefinition={actionsColumnsDefinition}
            pageSettings={PAGINATION_SEARCH_SETTINGS}
            emptyTable={emptyTable}
            additionnalComponent={additionnalComponent}
          />
        </Content>
      </div>
    );
  }
}

export default compose(withRouter, injectIntl, injectNotifications)(DatamartsListPage);
