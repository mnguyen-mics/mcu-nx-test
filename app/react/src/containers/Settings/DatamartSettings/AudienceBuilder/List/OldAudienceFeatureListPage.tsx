import * as React from 'react';
import { compose } from 'recompose';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Button, Layout, Modal } from 'antd';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import { messages } from '../messages';
import {
  KEYWORD_SEARCH_SETTINGS,
  PAGINATION_SEARCH_SETTINGS,
  parseSearch,
  updateSearch,
} from '../../../../../utils/LocationSearchHelper';
import AudienceFeatureTable from '../List/AudienceFeatureTable';
import { injectDrawer } from '../../../../../components/Drawer';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';
import { IAudienceFeatureService } from '../../../../../services/AudienceFeatureService';
import { AudienceFeatureResource } from '../../../../../models/audienceFeature';
import { Index } from '@mediarithmics-private/mcs-components-library/lib/utils';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import { Filter } from '../../Common/domain';
const { Content } = Layout;

export const AUDIENCE_BUILDER_SEARCH_SETTINGS = [
  ...KEYWORD_SEARCH_SETTINGS,
  ...PAGINATION_SEARCH_SETTINGS,
];

interface State {
  isLoading: boolean;
  audienceFeatures: AudienceFeatureResource[];
  noAudienceFeature: boolean;
  totalAudienceFeature: number;
  filter: Filter;
}

type Props = RouteComponentProps<{
  organisationId: string;
  datamartId: string;
}> &
  InjectedNotificationProps &
  InjectedIntlProps;

class AudienceFeatureListPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceFeatureService)
  private _audienceFeatureService: IAudienceFeatureService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      noAudienceFeature: true,
      totalAudienceFeature: 0,
      audienceFeatures: [],
      filter: {
        pageSize: 10,
        currentPage: 1,
        keywords: '',
      },
    };
  }

  componentDidMount() {
    const {
      match: {
        params: { datamartId },
      },
      location: { search },
    } = this.props;
    const filter = parseSearch(search, AUDIENCE_BUILDER_SEARCH_SETTINGS);

    this.fetchAudienceFeatures(datamartId, filter);
  }

  fetchAudienceFeatures = (datamartId: string, filter: Index<any>) => {
    const { notifyError } = this.props;
    const buildOptions = () => {
      let options = {};
      if (filter.currentPage && filter.pageSize) {
        options = {
          ...getPaginatedApiParam(filter.currentPage, filter.pageSize),
        };
      }
      if (filter.keywords) {
        return {
          ...options,
          keywords: filter.keywords,
        };
      }
      return options;
    };

    this.setState({
      filter: filter as Filter,
    });

    this._audienceFeatureService
      .getAudienceFeatures(datamartId, buildOptions())
      .then(res => {
        this.setState({
          isLoading: false,
          audienceFeatures: res.data,
          noAudienceFeature: res && res.total === 0 && !filter.keywords,
          totalAudienceFeature: res.total ? res.total : res.count,
        });
      })
      .catch(e => {
        notifyError(e);
        this.setState({
          isLoading: false,
        });
      });
  };

  deleteAudienceFeature = (resource: AudienceFeatureResource) => {
    const {
      match: {
        params: { datamartId },
      },
      location: { search, pathname, state },
      history,
      intl: { formatMessage },
      notifyError,
    } = this.props;

    const { audienceFeatures } = this.state;

    const filter = parseSearch(search, AUDIENCE_BUILDER_SEARCH_SETTINGS);

    Modal.confirm({
      icon: 'exclamation-circle',
      title: formatMessage(messages.audienceFeatureDeleteListModalTitle),
      okText: formatMessage(messages.audienceFeatureDeleteListModalOk),
      cancelText: formatMessage(messages.audienceFeatureDeleteListModalCancel),
      onOk: () => {
        this._audienceFeatureService
          .deleteAudienceFeature(resource.datamart_id, resource.id)
          .then(() => {
            if (audienceFeatures.length === 1 && filter.currentPage !== 1) {
              const newFilter = {
                ...filter,
                currentPage: filter.currentPage - 1,
              };
              this.fetchAudienceFeatures(datamartId, filter);
              history.replace({
                pathname: pathname,
                search: updateSearch(search, newFilter),
                state: state,
              });
            } else {
              this.fetchAudienceFeatures(datamartId, filter);
            }
          })
          .catch(err => {
            notifyError(err);
          });
      },
      onCancel: () => {
        // cancel,
      },
    });
  };

  onFilterChange = (newFilter: Index<any>) => {
    const {
      match: {
        params: { datamartId },
      },
    } = this.props;
    this.fetchAudienceFeatures(datamartId, newFilter);
  };

  buildNewActionElement = () => {
    const onClick = () => {
      const {
        history,
        match: {
          params: { datamartId, organisationId },
        },
      } = this.props;
      history.push({
        pathname: `/v2/o/${organisationId}/settings/datamart/${datamartId}/audience_feature/create`,
        state: {
          datamartId: datamartId,
        },
      });
    };
    return (
      <Button type='primary' onClick={onClick} className='mcs-audienceFeature_creation_button'>
        <FormattedMessage {...messages.audienceFeatureNew} />
      </Button>
    );
  };

  render() {
    const {
      isLoading,
      audienceFeatures,
      noAudienceFeature,
      totalAudienceFeature,
      filter,
    } = this.state;

    return (
      <div className='ant-layout'>
        <Content className='mcs-content-container'>
          <div className='mcs-table-container'>
            <div>
              <div className='mcs-card-header mcs-card-title'>
                <span className='mcs-card-title'>
                  <FormattedMessage {...messages.audienceFeatures} />
                </span>
                <span className='mcs-card-button'>{this.buildNewActionElement()}</span>
              </div>
              <hr className='mcs-separator' />
              <AudienceFeatureTable
                dataSource={audienceFeatures}
                total={totalAudienceFeature}
                isLoading={isLoading}
                noItem={noAudienceFeature}
                onFilterChange={this.onFilterChange}
                filter={filter}
                deleteAudienceFeature={this.deleteAudienceFeature}
              />
            </div>
          </div>
        </Content>
      </div>
    );
  }
}

export default compose<Props, {}>(
  injectIntl,
  withRouter,
  injectDrawer,
  injectNotifications,
)(AudienceFeatureListPage);
