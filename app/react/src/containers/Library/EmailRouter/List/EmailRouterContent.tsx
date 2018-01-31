import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Modal } from 'antd';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { McsIconType } from '../../../../components/McsIcons';
import ItemList, { Filters } from '../../../../components/ItemList';
import EmailRoutersService from '../../../../services/Library/EmailRoutersService';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import {
  PAGINATION_SEARCH_SETTINGS,
  parseSearch,
  updateSearch,
} from '../../../../utils/LocationSearchHelper';
import { EmailRouter } from '../../../../models/Plugins';
import messages from './messages';

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

class EmailRouterContent extends React.Component<
  RouteComponentProps<RouterProps> & InjectedIntlProps,
  EmailRouterContentState
> {
  state = initialState;

  archiveEmailRouter = (routerId: string) => {
    return EmailRoutersService.deleteEmailRouter(routerId);
  };

  fetchEmailRouter = (organisationId: string, filter: Filters) => {
    this.setState({ loading: true }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      EmailRoutersService.getEmailRouters(organisationId, options).then(
        results => {
          this.setState({
            loading: false,
            data: results.data,
            total: results.total || results.count,
          });
        },
      );
    });
  };

  onClickArchive = (keyword: EmailRouter) => {
    const {
      location: { search, pathname, state },
      history,
      match: { params: { organisationId } },
      intl: { formatMessage },
    } = this.props;

    const { data } = this.state;

    const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);

    Modal.confirm({
      iconType: 'exclamation-circle',
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
    const { history, match: { params: { organisationId } } } = this.props;

    history.push(
      `/v2/o/${organisationId}/library/email_routers/${router.id}/edit`,
    );
  };

  render() {
    const { match: { params: { organisationId } } } = this.props;

    const actionsColumnsDefinition = [
      {
        key: 'action',
        actions: [
          { translationKey: 'EDIT', callback: this.onClickEdit },
          { translationKey: 'ARCHIVE', callback: this.onClickArchive },
        ],
      },
    ];

    const dataColumnsDefinition = [
      {
        translationKey: 'NAME',
        intlMessage: messages.name,
        key: 'name',
        isHideable: false,
        render: (text: string, record: EmailRouter) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/library/email_routers/${
              record.id
            }/edit`}
          >
            {text}
          </Link>
        ),
      },
    ];

    const emptyTable: {
      iconType: McsIconType;
      intlMessage: FormattedMessage.Props;
    } = {
      iconType: 'library',
      intlMessage: messages.empty,
    };

    return (
      <ItemList
        fetchList={this.fetchEmailRouter}
        dataSource={this.state.data}
        loading={this.state.loading}
        total={this.state.total}
        columns={dataColumnsDefinition}
        actionsColumnsDefinition={actionsColumnsDefinition}
        pageSettings={PAGINATION_SEARCH_SETTINGS}
        emptyTable={emptyTable}
      />
    );
  }
}

export default compose(withRouter, injectIntl)(EmailRouterContent);
