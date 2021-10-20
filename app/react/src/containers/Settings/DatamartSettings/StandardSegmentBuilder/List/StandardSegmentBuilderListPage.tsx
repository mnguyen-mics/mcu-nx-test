import * as React from 'react';
import { compose } from 'recompose';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Button, Layout, Modal } from 'antd';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import { messages } from '../messages';
import StandardSegmentBuilderTable from './StandardSegmentBuilderTable';
import { injectDrawer } from '../../../../../components/Drawer';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../../../Notifications/injectNotifications';
import { TYPES } from '../../../../../constants/types';
import { lazyInject } from '../../../../../config/inversify.config';
import { IStandardSegmentBuilderService } from '../../../../../services/StandardSegmentBuilderService';
import { StandardSegmentBuilderResource } from '../../../../../models/standardSegmentBuilder';
import { Index } from '@mediarithmics-private/mcs-components-library/lib/utils';
import { getPaginatedApiParam } from '../../../../../utils/ApiHelper';
import { Filter } from '../../Common/domain';

const { Content } = Layout;

interface State {
  isLoading: boolean;
  StandardSegmentBuilders: StandardSegmentBuilderResource[];
  noStandardSegmentBuilder: boolean;
  totalStandardSegmentBuilder: number;
  filter: Filter;
}

type Props = RouteComponentProps<{
  organisationId: string;
  datamartId: string;
}> &
  InjectedNotificationProps &
  InjectedIntlProps;

class StandardSegmentBuilderListPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IStandardSegmentBuilderService)
  private _standardSegmentBuilderService: IStandardSegmentBuilderService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      noStandardSegmentBuilder: true,
      totalStandardSegmentBuilder: 0,
      StandardSegmentBuilders: [],
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
      history,
      location: { pathname },
    } = this.props;
    const defaultFilter = {
      pageSize: 10,
      currentPage: 1,
      keywords: '',
    };
    this.setState({
      filter: defaultFilter,
    });
    history.replace(pathname);
    this.fetchStandardSegmentBuilders(datamartId, defaultFilter);
  }

  fetchStandardSegmentBuilders = (datamartId: string, filter: Index<any>) => {
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

    this._standardSegmentBuilderService
      .getStandardSegmentBuilders(datamartId, buildOptions())
      .then(res => {
        this.setState({
          isLoading: false,
          StandardSegmentBuilders: res.data,
          noStandardSegmentBuilder: res && res.total === 0,
          totalStandardSegmentBuilder: res.total ? res.total : res.count,
        });
      })
      .catch(e => {
        notifyError(e);
        this.setState({
          isLoading: false,
        });
      });
  };

  deleteStandardSegmentBuilder = (resource: StandardSegmentBuilderResource) => {
    const {
      match: {
        params: { datamartId },
      },
      intl: { formatMessage },
      notifyError,
    } = this.props;

    const { StandardSegmentBuilders, filter } = this.state;

    Modal.confirm({
      icon: 'exclamation-circle',
      title: formatMessage(messages.standardSegmentBuilderDeleteListModalTitle),
      okText: formatMessage(messages.standardSegmentBuilderDeleteListModalOk),
      cancelText: formatMessage(messages.standardSegmentBuilderDeleteListModalCancel),
      className: 'mcs-standardSegmentBuilderDeletePopUp',
      okButtonProps: { className: 'mcs-standardSegmentBuilderDeletePopUp_delete_button' },
      onOk: () => {
        this._standardSegmentBuilderService
          .deleteStandardSegmentBuilder(resource.datamart_id, resource.id)
          .then(() => {
            if (StandardSegmentBuilders.length === 1 && filter.currentPage !== 1) {
              const newFilter = {
                ...filter,
                currentPage: filter.currentPage - 1,
              };
              this.fetchStandardSegmentBuilders(datamartId, filter);
              this.setState({
                filter: newFilter,
              });
            } else {
              this.fetchStandardSegmentBuilders(datamartId, filter);
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
        pathname: `/v2/o/${organisationId}/settings/datamart/${datamartId}/standard_segment_builder/create`,
        state: {
          datamartId: datamartId,
        },
      });
    };
    return (
      <Button
        type='primary'
        className='mcs-standardSegmentBuilder_creation_button'
        onClick={onClick}
      >
        <FormattedMessage {...messages.standardSegmentBuilderNew} />
      </Button>
    );
  };

  onFilterChange = (newFilter: Index<any>) => {
    const {
      match: {
        params: { datamartId },
      },
    } = this.props;
    this.setState({
      filter: {
        pageSize: newFilter.pageSize,
        currentPage: newFilter.currentPage,
        keywords: newFilter.keywords,
      },
    });

    this.fetchStandardSegmentBuilders(datamartId, newFilter);
  };

  render() {
    const {
      isLoading,
      StandardSegmentBuilders,
      noStandardSegmentBuilder,
      totalStandardSegmentBuilder,
      filter,
    } = this.state;

    return (
      <div className='ant-layout'>
        <Content className='mcs-content-container'>
          <div className='mcs-table-container'>
            <div>
              <div className='mcs-card-header mcs-card-title'>
                <span className='mcs-card-title'>
                  <FormattedMessage {...messages.standardSegmentBuilders} />
                </span>
                <span className='mcs-card-button'>{this.buildNewActionElement()}</span>
              </div>
              <hr className='mcs-separator' />
              <StandardSegmentBuilderTable
                dataSource={StandardSegmentBuilders}
                total={totalStandardSegmentBuilder}
                isLoading={isLoading}
                noItem={noStandardSegmentBuilder}
                onFilterChange={this.onFilterChange}
                filter={filter}
                deleteStandardSegmentBuilder={this.deleteStandardSegmentBuilder}
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
)(StandardSegmentBuilderListPage);
