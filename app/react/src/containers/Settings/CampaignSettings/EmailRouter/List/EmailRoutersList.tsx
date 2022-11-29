import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps, Link } from 'react-router-dom';
import { Modal, Button, Layout } from 'antd';
import { injectIntl, WrappedComponentProps, FormattedMessage } from 'react-intl';
import ItemList, { Filters } from '../../../../../components/ItemList';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import {
  PAGINATION_SEARCH_SETTINGS,
  parseSearch,
  updateSearch,
} from '../../../../../utils/LocationSearchHelper';
import { EmailRouter } from '../../../../../models/Plugins';
import messages from './messages';
import { lazyInject } from '../../../../../config/inversify.config';
import { IEmailRouterService } from '../../../../../services/Library/EmailRoutersService';
import { TYPES } from '../../../../../constants/types';
import { McsIconType } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-icon';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import {
  ActionsColumnDefinition,
  DataColumnDefinition,
} from '@mediarithmics-private/mcs-components-library/lib/components/table-view/table-view/TableView';

const { Content } = Layout;

const initialState = {
  loading: false,
  data: [],
  total: 0,
};

interface EmailRouterContentState {
  loading: boolean;
  data: EmailRouter[];
  total: number;
}

interface RouterProps {
  organisationId: string;
}

class EmailRoutersList extends React.Component<
  RouteComponentProps<RouterProps> & WrappedComponentProps,
  EmailRouterContentState
> {
  state = initialState;

  @lazyInject(TYPES.IEmailRouterService)
  private _emailRouterService: IEmailRouterService;

  archiveEmailRouter = (routerId: string) => {
    return this._emailRouterService.deleteEmailRouter(routerId);
  };

  fetchEmailRouter = (organisationId: string, filter: Filters) => {
    this.setState({ loading: true }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      this._emailRouterService.getEmailRouters(organisationId, options).then(results => {
        this.setState({
          loading: false,
          data: results.data,
          total: results.total || results.count,
        });
      });
    });
  };

  onClickArchive = (keyword: EmailRouter) => {
    const {
      location: { search, pathname, state },
      history,
      match: {
        params: { organisationId },
      },
      intl: { formatMessage },
    } = this.props;

    const { data } = this.state;

    const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);

    Modal.confirm({
      icon: <ExclamationCircleOutlined />,
      title: formatMessage(messages.emailRouterArchiveTitle),
      content: formatMessage(messages.emailRouterArchiveMessage),
      okText: formatMessage(messages.emailRouterArchiveOk),
      cancelText: formatMessage(messages.emailRouterArchiveCancel),
      onOk: () => {
        this.archiveEmailRouter(keyword.id).then(() => {
          if (data.length === 1 && filter.currentPage !== 1) {
            const newFilter = {
              ...filter,
              currentPage: filter.currentPage - 1,
            };
            history.replace({
              pathname: pathname,
              search: updateSearch(search, newFilter),
              state: state,
            });
            return Promise.resolve();
          }
          return this.fetchEmailRouter(organisationId, filter);
        });
      },
      onCancel: () => {
        // cancel
      },
    });
  };

  onClickEdit = (router: EmailRouter) => {
    const {
      history,
      match: {
        params: { organisationId },
      },
    } = this.props;

    history.push(`/v2/o/${organisationId}/settings/campaigns/email_routers/${router.id}/edit`);
  };

  render() {
    const {
      match: {
        params: { organisationId },
      },
      history,
      intl: { formatMessage },
    } = this.props;

    const actionsColumnsDefinition: Array<ActionsColumnDefinition<EmailRouter>> = [
      {
        key: 'action',
        actions: () => [
          {
            message: formatMessage(messages.edit),
            callback: this.onClickEdit,
          },
          {
            message: formatMessage(messages.archive),
            callback: this.onClickArchive,
          },
        ],
      },
    ];

    const dataColumnsDefinition: Array<DataColumnDefinition<EmailRouter>> = [
      {
        title: formatMessage(messages.name),
        key: 'name',
        isHideable: false,
        render: (text: string, record: EmailRouter) => (
          <Link
            className='mcs-campaigns-link'
            to={`/v2/o/${organisationId}/settings/campaigns/email_routers/${record.id}/edit`}
          >
            {text}
          </Link>
        ),
      },
    ];

    const emptyTable: {
      iconType: McsIconType;
      message: string;
    } = {
      iconType: 'settings',
      message: this.props.intl.formatMessage(messages.empty),
    };

    const onClick = () =>
      history.push(`/v2/o/${organisationId}/settings/campaigns/email_routers/create`);

    const buttons = [
      <Button key='create' type='primary' onClick={onClick}>
        <FormattedMessage {...messages.newEmailRouter} />
      </Button>,
    ];

    const additionnalComponent = (
      <div>
        <div className='mcs-card-header mcs-card-title'>
          <span className='mcs-card-title'>
            <FormattedMessage {...messages.emailrouter} />
          </span>
          <span className='mcs-card-button'>{buttons}</span>
        </div>
        <hr className='mcs-separator' />
      </div>
    );

    return (
      <div className='ant-layout'>
        <Content className='mcs-content-container'>
          <ItemList
            fetchList={this.fetchEmailRouter}
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

export default compose(withRouter, injectIntl)(EmailRoutersList);
