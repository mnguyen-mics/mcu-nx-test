import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { Modal } from 'antd';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { McsIconType } from '../../../../components/McsIcons';
import ItemList, { Filters } from '../../../../components/ItemList';
import ExportsService from '../../../../services/Library/ExportsService';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import { PAGINATION_SEARCH_SETTINGS, parseSearch, updateSearch } from '../../../../utils/LocationSearchHelper';
import { Export } from '../../../../models/exports/exports';
import messages from './messages';

const initialState = {
  loading: false,
  data: [],
  total: 0,
};

interface ExportContentState {
  loading: boolean;
  data: Export[];
  total: number;
}

interface RouterProps {
  organisationId: string;
}

class ExportContent extends React.Component<RouteComponentProps<RouterProps> & InjectedIntlProps, ExportContentState> {

  state = initialState;

  archiveExport = (exportId: string) => {
    return ExportsService.deleteExport(exportId);
  }

  fetchExport = (organisationId: string, filter: Filters) => {
    this.setState({ loading: true }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      ExportsService.getExports(organisationId, options)
        .then((results) => {
          this.setState({
            loading: false,
            data: results.data,
            total: results.total || results.count,
          });
        });
    });
  }

  onClickArchive = (ex: Export) => {
    const {
      location: {
        search,
        pathname,
        state,
      },
      history,
      match: { params: { organisationId } },
      intl: { formatMessage },
    } = this.props;

    const {
      data,
    } = this.state;

    const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);

    Modal.confirm({
      iconType: 'exclamation-circle',
      title: formatMessage(messages.exportsArchiveTitle),
      content: formatMessage(messages.exportsArchiveMessage),
      okText: formatMessage(messages.exportsArchiveOk),
      cancelText: formatMessage(messages.exportsArchiveCancel),
      onOk: () => {
        this.archiveExport(ex.id)
        .then(() => {
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
          return this.fetchExport(organisationId, filter);
        });
      },
      onCancel: () => {
        // cancel
      },
    });
  }

  onClickEdit = (keyword: Export) => {
    const {
      history,
      match: { params: { organisationId } },
    } = this.props;

    history.push(`/${organisationId}/library/exports/${keyword.id}`);
  }

  resetExport = () => {
    this.setState(initialState);
  }

  render() {
    const {
      match: { params: { organisationId } },
    } = this.props;

    const actions = {
      fetchList: this.fetchExport,
      resetList: this.resetExport,
    };

    const columnsDefinitions = {
      actionsColumnsDefinition: [
        {
          key: 'action',
          actions: [
            { translationKey: 'EDIT', callback: this.onClickEdit },
            { translationKey: 'ARCHIVE', callback: this.onClickArchive },
          ],
        },
      ],

      dataColumnsDefinition: [
        {
          translationKey: 'NAME',
          intlMessage: messages.name,
          key: 'name',
          isHideable: false,
          render: (text: string, record: Export) => (
            <Link
              className="mcs-campaigns-link"
              to={`/${organisationId}/library/keywordslists/${record.id}`}
            >{text}
            </Link>
          ),
        },
        {
          translationKey: 'type',
          intlMessage: messages.type,
          key: 'type',
          isHideable: false,
          render: (text: string, record: Export) => (
            <span>{text}</span>
          ),
        },
      ],
    };

    const emptyTable: {
      iconType: McsIconType,
      intlMessage: FormattedMessage.Props,
    } = {
      iconType: 'library',
      intlMessage: messages.empty,
    };

    return (
      <ItemList
        actions={actions}
        dataSource={this.state.data}
        isLoading={this.state.loading}
        total={this.state.total}
        columnsDefinitions={columnsDefinitions}
        pageSettings={PAGINATION_SEARCH_SETTINGS}
        emptyTable={emptyTable}
      />
    );
  }
}

export default compose(
  withRouter,
  injectIntl,
)(ExportContent);
