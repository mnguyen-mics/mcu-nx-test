import React, { Component } from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { Modal, Button, Layout } from 'antd';
import { McsIconType } from '../../../../../components/McsIcon';
import ItemList, { Filters } from '../../../../../components/ItemList';
import VisitAnalyzerService from '../../../../../services/Library/VisitAnalyzerService';
import PluginService from '../../../../../services/PluginService';
import {
  PAGINATION_SEARCH_SETTINGS,
  parseSearch,
  updateSearch,
} from '../../../../../utils/LocationSearchHelper';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import messages from './messages';

const { Content } = Layout;

const initialState = {
  loading: false,
  data: [],
  total: 0,
};

interface PluginProperty {
  deletable: boolean;
  origin: string;
  property_type: string;
  technical_name: string;
  value: any;
  writable: boolean;
}

interface VisitAnalyzer {
  id: string;
  artifact_id: string;
  name: string;
  group_id: string;
  version_id: string;
  version_value: string;
  visit_analyzer_plugin_id: string;
  organisation_id: string;
  properties?: PluginProperty[];
}

interface VisitAnalyzerContentState {
  loading: boolean;
  data: VisitAnalyzer[];
  total: number;
}

interface RouterProps {
  organisationId: string;
}

class VisitAnalyzerContent extends Component<
  RouteComponentProps<RouterProps> & InjectedIntlProps,
  VisitAnalyzerContentState
> {
  state = initialState;

  archiveVisitAnalyzer = (visitAnalyzerId: string) => {
    return VisitAnalyzerService.deleteVisitAnalyzerProperty(visitAnalyzerId);
  };

  fetchVisitAnalyzer = (organisationId: string, filter: Filters) => {
    this.setState({ loading: true }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      VisitAnalyzerService.getVisitAnalyzers(organisationId, options).then(
        (results: { data: VisitAnalyzer[]; total?: number; count: number }) => {
          const promises = results.data.map(va => {
            return new Promise((resolve, reject) => {
              PluginService.getEngineVersion(va.version_id)
                .then(visitAnalyzer => {
                  return PluginService.getEngineProperties(visitAnalyzer.id);
                })
                .then(v => resolve(v));
            });
          });
          Promise.all(promises).then((vaProperties: PluginProperty[]) => {
            const formattedResults: any = results.data.map((va, i) => {
              return {
                ...va,
                properties: vaProperties[i],
              };
            });
            this.setState({
              loading: false,
              data: formattedResults,
              total: results.total || results.count,
            });
          });
        },
      );
    });
  };

  onClickArchive = (visitAnalyzer: VisitAnalyzer) => {
    const {
      location: { search, state, pathname },
      history,
      match: { params: { organisationId } },
      intl: { formatMessage },
    } = this.props;

    const { data } = this.state;

    const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);

    Modal.confirm({
      iconType: 'exclamation-circle',
      title: formatMessage(messages.visitAnalyzerArchiveTitle),
      content: formatMessage(messages.visitAnalyzerArchiveMessage),
      okText: formatMessage(messages.visitAnalyzerArchiveOk),
      cancelText: formatMessage(messages.visitAnalyzerArchiveCancel),
      onOk: () => {
        this.archiveVisitAnalyzer(visitAnalyzer.id).then(() => {
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
          return this.fetchVisitAnalyzer(organisationId, filter);
        });
      },
      onCancel: () => {
        // cancel
      },
    });
  };

  onClickEdit = (visitAnalyzer: VisitAnalyzer) => {
    const { history, match: { params: { organisationId } } } = this.props;

    history.push(
      `/v2/o/${organisationId}/settings/datamart/visit_analyzers/${
        visitAnalyzer.id
      }/edit`,
    );
  };

  render() {
    const { match: { params: { organisationId } }, history } = this.props;

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
        translationKey: 'PROCESSOR',
        intlMessage: messages.processor,
        key: 'name',
        isHideable: false,
        render: (text: string, record: VisitAnalyzer) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/settings/datamart/visit_analyzers/${
              record.id
            }/edit`}
          >
            {text}
          </Link>
        ),
      },
      {
        translationKey: 'PROVIDER',
        intlMessage: messages.provider,
        key: 'id',
        isHideable: false,
        render: (text: string, record: VisitAnalyzer) => {
          const property =
            record &&
            record.properties &&
            record.properties.find(item => item.technical_name === 'name');
          const render =
            property && property.value && property.value.value
              ? property.value.value
              : null;
          return <span>{render}</span>;
        },
      },
      {
        translationKey: 'NAME',
        intlMessage: messages.name,
        key: 'version_id',
        isHideable: false,
        render: (text: string, record: VisitAnalyzer) => {
          const property =
            record &&
            record.properties &&
            record.properties.find(item => item.technical_name === 'provider');
          const render =
            property && property.value && property.value.value
              ? property.value.value
              : null;
          return <span>{render}</span>;
        },
      },
    ];

    const emptyTable: {
      iconType: McsIconType;
      intlMessage: FormattedMessage.Props;
    } = {
      iconType: 'library',
      intlMessage: messages.empty,
    };

    const onClick = () => history.push(`/v2/o/${organisationId}/settings/datamart/visit_analyzers/create`)

    const buttons = [
      (<Button key="create" type="primary" onClick={onClick}>
      <FormattedMessage {...messages.newVisitAnalyzer} />
    </Button>)
    ]

    const additionnalComponent = (<div>
      <div className="mcs-card-header mcs-card-title">
        <span className="mcs-card-title"><FormattedMessage {...messages.visitAnalyzer} /></span>
        <span className="mcs-card-button">{buttons}</span>
      </div>
      <hr className="mcs-separator" />
    </div>)

    return (
      <div className="ant-layout">
        <Content className="mcs-content-container">
          <ItemList
            fetchList={this.fetchVisitAnalyzer}
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

export default compose(withRouter, injectIntl)(VisitAnalyzerContent);
