import * as React from 'react';
import { Layout, Button } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router';
import { InjectedIntlProps, injectIntl, FormattedMessage } from 'react-intl';

import { compose } from 'redux';
import { lazyInject } from '../../../../../config/inversify.config';
import { TYPES } from '../../../../../constants/types';
import MlAlgorithmResource from '../../../../../models/mlAlgorithm/MlAlgorithmResource';
import { IMlAlgorithmService } from '../../../../../services/MlAlgorithmService';
import ItemList, { Filters } from '../../../../../components/ItemList';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import messages from '../messages';
import { PAGINATION_SEARCH_SETTINGS, parseSearch, updateSearch, isSearchValid, buildDefaultSearch, compareSearches } from '../../../../../utils/LocationSearchHelper';
import moment from 'moment';
import { ActionsColumnDefinition } from '../../../../../components/TableView/TableView';
import { InjectedThemeColorsProps } from '../../../../Helpers/injectThemeColors';
import { InjectedNotificationProps } from '../../../../Notifications/injectNotifications';
import { McsIconType } from '../../../../../components/McsIcon';
import { message } from 'antd';
import { Link } from 'react-router-dom';

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
        });
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

    handleArchiveMlAlgorithm = (mlAlgorithm: MlAlgorithmResource) => {
      const {
        match: {
          params: { organisationId },
        },
        location: { search },
        intl
      } = this.props

      mlAlgorithm.archived = true;

      this._mlAlgorithmService
        .updateMlAlgorithm(organisationId, mlAlgorithm.id, mlAlgorithm)
        .then(res => res.data)
        .then(mlAlgorithmArchived => {
          const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);
          this.fetchMlAlgorithms(organisationId, filter)
          message.success(intl.formatMessage(messages.updateSuccess));
        })
        .catch(err => {
          message.error(intl.formatMessage(messages.updateError));
        })

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
            <Link
              className="mcs-campaigns-link"
              to={`/v2/o/${record.organisation_id}/settings/organisation/ml_algorithms/${
                record.id
              }/ml_models`}
            >
              {record.name}
            </Link>
          ),
        },
        {
          intlMessage: messages.description,
          key: 'description',
          isHideable: false,
          render: (text: string, record: MlAlgorithmResource) => (
            <Link
              className="mcs-campaigns-link"
              to={`/v2/o/${record.organisation_id}/settings/organisation/ml_algorithms/${
                record.id
              }/ml_models`}
            >
              {text}
            </Link>
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
        },
        {
          intlMessage: messages.archived,
          key: 'archived',
          isHideable: false,
          render: (text: string, record: MlAlgorithmResource) =>
            record.archived ? formatMessage(messages.isArchived) : formatMessage(messages.notArchived)
        }
        
      ];
  
      return {
        dataColumnsDefinition: dataColumns,
      };
    };
    

    render() {
      const {
        match: {
          params: { organisationId },
        },
        history
      } = this.props;

      const emptyTable: {
        iconType: McsIconType;
        intlMessage: FormattedMessage.Props;
      } = {
        iconType: 'settings',
        intlMessage: messages.empty,
      };


      const actionsColumnsDefinition: Array<ActionsColumnDefinition<MlAlgorithmResource>> = [
        {
          key: 'action',
          actions: (mlAlgorithm: MlAlgorithmResource) => [
            { intlMessage: messages.editMlAlgorithmRaw, callback: this.handleEditMlAlgorithm, disabled: mlAlgorithm.archived },
            { intlMessage: messages.archive, callback: this.handleArchiveMlAlgorithm, disabled: mlAlgorithm.archived },
          ],
        },
      ];
      
      const onClick = () => {
        history.push(
          `/v2/o/${organisationId}/settings/organisation/ml_algorithms/create`,
        );
      }

      const buttons = [
        <Button key="create" type="primary" onClick={onClick}>
          <FormattedMessage {...messages.newMlAlgorithm} />
        </Button>,
      ];

      const additionnalComponent = (
        <div>
          <div className="mcs-card-header mcs-card-title">
            <span className="mcs-card-title">
              <FormattedMessage {...messages.mlAlgorithms} />
            </span>
            <span className="mcs-card-button">{buttons}</span>
          </div>
          <hr className="mcs-separator" />
        </div>
      );
      
      return (
        <div className="ant-layout">
          <Content className="mcs-content-container">
          <ItemList
            fetchList={this.fetchMlAlgorithms}
            dataSource={this.state.data}
            loading={this.state.loading}
            total={this.state.total}
            columns={this.buildColumnDefinition().dataColumnsDefinition}
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


export default compose(withRouter, injectIntl)(MlAlgorithmList);