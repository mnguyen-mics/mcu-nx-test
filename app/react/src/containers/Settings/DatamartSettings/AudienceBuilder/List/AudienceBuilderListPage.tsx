import * as React from 'react';
import { compose } from 'recompose';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Button, Layout, Modal } from 'antd';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import { messages } from '../messages';
import AudienceBuilderTable from './AudienceBuilderTable';
import { injectDrawer } from '../../../../../components/Drawer';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import {
  KEYWORD_SEARCH_SETTINGS,
  PAGINATION_SEARCH_SETTINGS,
  parseSearch,
  updateSearch,
} from '../../../../../utils/LocationSearchHelper';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';
import { IAudienceBuilderService } from '../../../../../services/AudienceBuilderService';
import { AudienceBuilderResource } from '../../../../../models/audienceBuilder';
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
  audienceBuilders: AudienceBuilderResource[];
  noAudienceBuilder: boolean;
  totalAudienceBuilder: number;
  filter: Filter;
}

type Props = RouteComponentProps<{
  organisationId: string;
  datamartId: string;
}> &
  InjectedNotificationProps &
  InjectedIntlProps;

class AudienceBuilderListPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceBuilderService)
  private _audienceBuilderService: IAudienceBuilderService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      noAudienceBuilder: true,
      totalAudienceBuilder: 0,
      audienceBuilders: [],
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

    this.fetchAudienceBuilders(datamartId, filter);
  }

  fetchAudienceBuilders = (datamartId: string, filter: Index<any>) => {
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

    this._audienceBuilderService
      .getAudienceBuilders(datamartId, buildOptions())
      .then(res => {
        this.setState({
          isLoading: false,
          audienceBuilders: res.data,
          noAudienceBuilder: res && res.total === 0,
          totalAudienceBuilder: res.total ? res.total : res.count,
        });
      })
      .catch(e => {
        notifyError(e);
        this.setState({
          isLoading: false,
        });
      });
  };

  deleteAudienceBuilder = (resource: AudienceBuilderResource) => {
    const {
      match: {
        params: { datamartId },
      },
      location: { search, pathname, state },
      history,
      intl: { formatMessage },
      notifyError,
    } = this.props;

    const { audienceBuilders } = this.state;

    const filter = parseSearch(search, AUDIENCE_BUILDER_SEARCH_SETTINGS);

    Modal.confirm({
      icon: 'exclamation-circle',
      title: formatMessage(messages.audienceBuilderDeleteListModalTitle),
      okText: formatMessage(messages.audienceBuilderDeleteListModalOk),
      cancelText: formatMessage(messages.audienceBuilderDeleteListModalCancel),
      onOk: () => {
        this._audienceBuilderService
          .deleteAudienceBuilder(resource.datamart_id, resource.id)
          .then(() => {
            if (audienceBuilders.length === 1 && filter.currentPage !== 1) {
              const newFilter = {
                ...filter,
                currentPage: filter.currentPage - 1,
              };
              this.fetchAudienceBuilders(datamartId, filter);
              history.replace({
                pathname: pathname,
                search: updateSearch(search, newFilter),
                state: state,
              });
            } else {
              this.fetchAudienceBuilders(datamartId, filter);
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

  buildNewActionElement = () => {
    const onClick = () => {
      const {
        history,
        match: {
          params: { datamartId, organisationId },
        },
      } = this.props;
      history.push({
        pathname: `/v2/o/${organisationId}/settings/datamart/${datamartId}/audience_builder/create`,
        state: {
          datamartId: datamartId,
        },
      });
    };
    return (
      <Button type='primary' className='mcs-audienceBuilder_creation_button' onClick={onClick}>
        <FormattedMessage {...messages.audienceBuilderNew} />
      </Button>
    );
  };

  onFilterChange = (newFilter: Index<any>) => {
    const {
      match: {
        params: { datamartId },
      },
    } = this.props;
    this.fetchAudienceBuilders(datamartId, newFilter);
  };

  render() {
    const {
      isLoading,
      audienceBuilders,
      noAudienceBuilder,
      totalAudienceBuilder,
      filter,
    } = this.state;

    return (
      <div className='ant-layout'>
        <Content className='mcs-content-container'>
          <div className='mcs-table-container'>
            <div>
              <div className='mcs-card-header mcs-card-title'>
                <span className='mcs-card-title'>
                  <FormattedMessage {...messages.audienceBuilders} />
                </span>
                <span className='mcs-card-button'>{this.buildNewActionElement()}</span>
              </div>
              <hr className='mcs-separator' />
              <AudienceBuilderTable
                dataSource={audienceBuilders}
                total={totalAudienceBuilder}
                isLoading={isLoading}
                noItem={noAudienceBuilder}
                onFilterChange={this.onFilterChange}
                filter={filter}
                deleteAudienceBuilder={this.deleteAudienceBuilder}
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
)(AudienceBuilderListPage);
