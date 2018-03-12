import * as React from 'react';
import { compose } from 'recompose';
import { withRouter, RouteComponentProps } from 'react-router';
import { Link } from 'react-router-dom';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import { Modal } from 'antd';
import { McsIconType } from '../../../../components/McsIcon';
import ItemList, { Filters } from '../../../../components/ItemList';
import AttributionModelService from '../../../../services/AttributionModelService';
import PluginServices from '../../../../services/PluginServices';
import {
  PAGINATION_SEARCH_SETTINGS,
  parseSearch,
  updateSearch,
} from '../../../../utils/LocationSearchHelper';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import { PluginProperty } from '../../../../models/Plugins';
import messages from './messages';
import { AttributionModelResource } from '../../../../models/goal/AttributionSelectionResource';

const initialState = {
  loading: false,
  data: [],
  total: 0,
};

interface AttributionModelInterface extends AttributionModelResource {
  properties?: PluginProperty[];
}

interface AttributionModelContentState {
  loading: boolean;
  data: AttributionModelResource[];
  total: number;
}

interface RouterProps {
  organisationId: string;
}

class AttributionModelContent extends React.Component<
  RouteComponentProps<RouterProps> & InjectedIntlProps,
  AttributionModelContentState
> {
  state = initialState;

  archiveAttributionModel = (attributionModelId: string) => {
    return AttributionModelService.deleteAttributionModel(attributionModelId);
  };

  fetchAttributionModel = (organisationId: string, filter: Filters) => {
    this.setState({ loading: true }, () => {
      const options = {
        ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
      };
      AttributionModelService.getAttributionModels(
        organisationId,
        options,
      ).then(results => {
        const promises = results.data.map(am => {
          return PluginServices.getEngineProperties(
            am.attribution_processor_id,
          );
        });
        Promise.all(promises).then(amProperties => {
          const formattedResults = results.data.map((am, i) => {
            return {
              ...am,
              properties: amProperties[i],
            };
          });

          this.setState({
            loading: false,
            data: formattedResults,
            total: results.total || results.count,
          });
        });
      });
    });
  };

  onClickArchive = (placement: AttributionModelInterface) => {
    const {
      location: { pathname, state, search },
      history,
      match: { params: { organisationId } },
      intl: { formatMessage },
    } = this.props;

    const { data } = this.state;

    const filter = parseSearch(search, PAGINATION_SEARCH_SETTINGS);

    Modal.confirm({
      iconType: 'exclamation-circle',
      title: formatMessage(messages.attributionModelArchiveTitle),
      content: formatMessage(messages.attributionModelArchiveTitle),
      okText: formatMessage(messages.attributionModelArchiveOk),
      cancelText: formatMessage(messages.attributionModelArchiveCancel),
      onOk: () => {
        this.archiveAttributionModel(placement.id).then(() => {
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
          return this.fetchAttributionModel(organisationId, filter);
        });
      },
      onCancel: () => {
        // cancel
      },
    });
  };

  onClickEdit = (attribution: AttributionModelInterface) => {
    const { history, match: { params: { organisationId } } } = this.props;

    history.push(
      `/v2/o/${organisationId}/library/attribution_models/${
        attribution.id
      }/edit`,
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
        render: (text: string, record: AttributionModelInterface) => (
          <Link
            className="mcs-campaigns-link"
            to={`/v2/o/${organisationId}/library/attribution_models/${
              record.id
            }/edit`}
          >
            {text}
          </Link>
        ),
      },
      {
        translationKey: 'ENGINE',
        intlMessage: messages.engine,
        key: 'id',
        isHideable: false,
        render: (text: string, record: AttributionModelInterface) => {
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
        translationKey: 'MINER',
        intlMessage: messages.miner,
        key: '',
        isHideable: false,
        render: (text: string, record: AttributionModelInterface) => {
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

    return (
      <ItemList
        fetchList={this.fetchAttributionModel}
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

export default compose(withRouter, injectIntl)(AttributionModelContent);
