import * as React from 'react';
import { Layout } from 'antd';
import { RouteComponentProps, withRouter } from 'react-router';
import { InjectedIntlProps, injectIntl, FormattedMessage } from 'react-intl';

import { compose } from 'redux';
import { lazyInject } from '../../../../config/inversify.config';
import { TYPES } from '../../../../constants/types';
import MlAlgorithmResource from '../../../../models/mlAlgorithm/MlAlgorithmResource';
import { IMlAlgorithmService } from '../../../../services/MlAlgorithmService';
import ItemList, { Filters } from '../../../../components/ItemList';
import { getPaginatedApiParam } from '../../../../utils/ApiHelper';
import messages from './messages';
import { McsIconType } from '../../../../components/McsIcon';
import { PAGINATION_SEARCH_SETTINGS } from '../../../../utils/LocationSearchHelper';

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

class MlAlgorithmList extends React.Component<RouteComponentProps<RouterProps> & InjectedIntlProps, MlAlgorithmListState> {
    state = initialState;

    @lazyInject(TYPES.IMlAlgorithmService)
    private _mlAlgorithmService: IMlAlgorithmService;

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

    render() {
        const dataColumnsDefinition = [
            {
                intlMessage: messages.id,
                key: 'id',
                isHideable: false
            },
            {
                intlMessage: messages.name,
                key: 'name',
                isHideable: false,
            },
            {
                intlMessage: messages.description,
                key: 'description',
                isHideable: false,
            },
        ];

        const emptyTable: {
            iconType: McsIconType;
            intlMessage: FormattedMessage.Props;
          } = {
            iconType: 'settings',
            intlMessage: messages.emptyMlAlgorithms,
          };

          const additionalComponent = (
            <div>
              <div className="mcs-card-header mcs-card-title">
                <span className="mcs-card-title">
                  <FormattedMessage {...messages.mlAlgorithms} />
                </span>
                {/* <span className="mcs-card-button">{buttons}</span> */}
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
                  columns={dataColumnsDefinition}
                  // actionsColumnsDefinition={actionsColumnsDefinition}
                  pageSettings={PAGINATION_SEARCH_SETTINGS}
                  emptyTable={emptyTable}
                  additionnalComponent={additionalComponent}
                />
              </Content>
            </div>
          );
    }
}


export default compose(withRouter, injectIntl)(MlAlgorithmList);