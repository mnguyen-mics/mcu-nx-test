import * as React from 'react';
import { Layout } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router';
import { InjectedIntlProps, injectIntl } from 'react-intl';

import { compose } from 'redux';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import MlAlgorithmResource from '../../../../models/mlAlgorithm/MlAlgorithmResource';
import { IMlAlgorithmService } from '../../../../services/MlAlgorithmService';
import { Filters } from '../../../../components/ItemList';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import messages from './messages';
import { PAGINATION_SEARCH_SETTINGS, parseSearch, updateSearch, isSearchValid, buildDefaultSearch, compareSearches } from '../../../../utils/LocationSearchHelper';
import { Card } from '../../../../components/Card';
import { TableView } from '../../../../components/TableView';
import moment from 'moment';
import { ActionsColumnDefinition } from '../../../../components/TableView/TableView';
import { InjectedThemeColorsProps } from '../../../Helpers/injectThemeColors';
import { InjectedNotificationProps } from '../../../Notifications/injectNotifications';

const { Content } = Layout;

const initialState = {
    loading: false,
    data: [],
    total: 0,
};

interface MlAlgorithmListState {
    loading: boolean;
    data: MlAlgorithmResource[];
    total: number;
}

interface RouterProps {
    organisationId: string;
}

type JoinedProps = RouteComponentProps<RouterProps> &
  InjectedIntlProps &
  InjectedThemeColorsProps &
  InjectedNotificationProps;

class MlAlgorithmList extends React.Component<JoinedProps, MlAlgorithmListState> {
    @lazyInject(TYPES.IMlAlgorithmService)
    private _mlAlgorithmService: IMlAlgorithmService;

    constructor(props: JoinedProps) {
      super(props);
      this.state = initialState;
    }

    componentDidMount() {
      const {
        match: {
          params: { organisationId },
        },
        location: { search, pathname },
        history,
      } = this.props;
  
      if (!isSearchValid(search, PAGINATION_SEARCH_SETTINGS)) {
        history.replace({
          pathname: pathname,
          search: buildDefaultSearch(search, PAGINATION_SEARCH_SETTINGS),
          state: { reloadDataSource: true },
        });
      } else {
        const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);
        this.fetchMlAlgorithms(organisationId, filter);
      }
    }

    componentWillReceiveProps(nextProps: JoinedProps) {
      const {
        history,
        location: { search },
        match: {
          params: { organisationId },
        },
      } = this.props;
  
      const {
        location: { pathname: nextPathname, search: nextSearch },
        match: {
          params: {
            organisationId: nextOrganisationId,
          }
        },
      } = nextProps;
  
      if (
        !compareSearches(search, nextSearch) ||
        organisationId !== nextOrganisationId
      ) {
        if (!isSearchValid(nextSearch, PAGINATION_SEARCH_SETTINGS)) {
          history.replace({
            pathname: nextPathname,
            search: buildDefaultSearch(nextSearch, PAGINATION_SEARCH_SETTINGS),
            state: { reloadDataSource: organisationId !== nextOrganisationId },
          });
        } else {
          const filter = parseSearch(nextSearch, PAGINATION_SEARCH_SETTINGS);
          this.fetchMlAlgorithms(nextOrganisationId, filter);
        }
      }
    }

    fetchMlAlgorithms = (organisationId: string, filter: Filters) => {
        this.setState({ loading: true}, () => {
            const options = {
                ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
              };
              this._mlAlgorithmService.getMlAlgorithms(organisationId, options).then(
                (results: { data: MlAlgorithmResource[]; total?: number; count: number }) => {
                  this.setState({
                    loading: false,
                    data: results.data,
                    total: results.total || results.count,
                  });
                },
              );
        })
    }

    handleEditMlAlgorithm = (mlAlgorithm: MlAlgorithmResource) => {
      const {
        match: {
          params: { organisationId },
        },
        location,
        history
      } = this.props
      history.push({
        pathname: `/v2/o/${organisationId}/settings/organisation/ml_algorithms/${mlAlgorithm.id}/edit`,
        state: { from: `${location.pathname}${location.search}`}
      });
    }

    handleDownloadNotebook = () => {
      return;
    }

    handleArchiveMlAlgorithm = () => {
      return;
    }

    updateLocationSearch = (params: Filters) => {
      const {
        history,
        location: { search: currentSearch, pathname },
      } = this.props;
  
      const nextLocation = {
        pathname,
        search: updateSearch(currentSearch, params, PAGINATION_SEARCH_SETTINGS),
      };
  
      history.push(nextLocation);
    };

    buildColumnDefinition = () => {
      const {
        intl: { formatMessage },
      } = this.props;
  
      const dataColumns = [
        {
          intlMessage: messages.id,
          key: 'id',
          isHideable: false,
          render: (text: string) => text,
        },
        {
          intlMessage: messages.name,
          key: 'name',
          isHideable: false,
          render: (text: string, record: MlAlgorithmResource) => (
            <span>{record.name}</span>
          ),
        },
        {
          intlMessage: messages.description,
          key: 'description',
          isHideable: false,
          render: (text: string, record: MlAlgorithmResource) => (
            <span>{record.description}</span>
          ),
        },
        {
          intlMessage: messages.lastUpdatedDate,
          key: 'last updated date',
          isHideable: false,
          render: (text: string, record: MlAlgorithmResource) =>
            record.last_updated_date
              ? moment(record.last_updated_date).format('DD/MM/YYYY h:mm:ss')
              : formatMessage(messages.lastUpdatedDate),
        }
      ];
  
      return {
        dataColumnsDefinition: dataColumns,
      };
    };

    

    render() {
      const {
        location: { search },
      } = this.props;

      const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);

      const { data, loading } = this.state;

      const pagination = {
        current: filter.currentPage,
        pageSize: filter.pageSize,
        onChange: (page: number) =>
          this.updateLocationSearch({
            currentPage: page,
          }),
        onShowSizeChange: (current: number, size: number) =>
          this.updateLocationSearch({
            pageSize: size,
          }),
        total: this.state.total,
      };

      const actionsColumnsDefinition: Array<ActionsColumnDefinition<MlAlgorithmResource>> = [
        {
          key: 'action',
          actions: (mlAlgorithm: MlAlgorithmResource) => [
            { intlMessage: messages.edit, callback: this.handleEditMlAlgorithm, disabled: mlAlgorithm.archived },
            { intlMessage: messages.downloadNotebook, callback: this.handleDownloadNotebook, disabled: !(mlAlgorithm.notebook_uri) },
            { intlMessage: messages.archive, callback: this.handleArchiveMlAlgorithm, disabled: mlAlgorithm.archived },
          ],
        },
      ];
      
      return (
        <div className="ant-layout">
          <Content className="mcs-content-container">
          <Card title={'ML Algorithm'}>
            <hr />
            <TableView
              dataSource={data}
              columns={this.buildColumnDefinition().dataColumnsDefinition}
              actionsColumnsDefinition={actionsColumnsDefinition}
              pagination={pagination}
              loading={loading}
            />
          </Card>
          </Content>
        </div>
      );
    }
}


export default compose(withRouter, injectIntl)(MlAlgorithmList);