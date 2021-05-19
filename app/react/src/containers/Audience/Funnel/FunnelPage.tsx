import {
  Actionbar,
  McsIcon,
  McsDateRangePicker,
  MentionTag,
} from '@mediarithmics-private/mcs-components-library';
import { parseSearch, updateSearch } from '../../../utils/LocationSearchHelper';
import { Button, Layout } from 'antd';
import * as React from 'react';
import { FormattedMessage, injectIntl, InjectedIntlProps } from 'react-intl';
import { withRouter } from 'react-router';
import { compose } from 'recompose';
import {
  FunnelTemplate,
  FUNNEL_SEARCH_SETTING,
  funnelMessages,
} from '../../../components/Funnel/Constants';
import FunnelWrapper from '../../../components/Funnel/FunnelWrapper';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IUserActivitiesFunnelService } from '../../../services/UserActivitiesFunnelService';
import {
  withDatamartSelector,
  WithDatamartSelectorProps,
} from '../../Datamart/WithDatamartSelector';
import ExportService from '../../../services/ExportService';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { extractDatesFromProps } from '../../../components/Funnel/Utils';
import {
  FunnelFilter,
  FunnelResponse,
  GroupedByFunnel,
} from '../../../models/datamart/UserActivitiesFunnel';
import McsMoment from '../../../utils/McsMoment';
import { McsDateRangeValue } from '@mediarithmics-private/mcs-components-library/lib/components/mcs-date-range-picker/McsDateRangePicker';
import { FILTERS } from '../../../containers/Audience/DatamartUsersAnalytics/DatamartUsersAnalyticsWrapper';
import FunnelTemplateSelector from '../../../components/Funnel/FunnelTemplateSelector';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { CopyOutlined } from '@ant-design/icons';

const { Content } = Layout;

interface State {
  exportIsRunning: boolean;
  isLoading: boolean;
  executeQueryFunction?: () => void;
  cancelQueryFunction?: () => void;
  dateRange: McsDateRangeValue;
  selectedTemplate?: FunnelTemplate;
}

interface FunnelSheetDescription {
  title: string;
  splitIndex?: number;
  funnelData: GroupedByFunnel;
}

type JoinedProps = WithDatamartSelectorProps & InjectedIntlProps & InjectedNotificationProps;

class FunnelPage extends React.Component<JoinedProps, State> {
  @lazyInject(TYPES.IUserActivitiesFunnelService)
  private _userActivitiesFunnelService: IUserActivitiesFunnelService;

  constructor(props: JoinedProps) {
    super(props);
    const routeParams = parseSearch(props.history.location.search, FUNNEL_SEARCH_SETTING);
    this.state = {
      exportIsRunning: false,
      isLoading: false,
      dateRange:
        routeParams.from && routeParams.to && routeParams.from.value && routeParams.to.value
          ? {
              from: new McsMoment(routeParams.from.value),
              to: new McsMoment(routeParams.to.value),
            }
          : {
              from: new McsMoment(`now-7d`),
              to: new McsMoment('now'),
            },
    };
  }

  componentDidUpdate(prevProps: JoinedProps) {
    const {
      location: { search },
    } = this.props;
    const { selectedTemplate } = this.state;
    const routeParams = parseSearch(search, FUNNEL_SEARCH_SETTING);
    const template = routeParams.template;
    if (template && selectedTemplate !== template) {
      this.setState({
        selectedTemplate: template,
      });
    }
  }

  private splitIndex(funnelFilter: FunnelFilter[]): number {
    return funnelFilter.findIndex(x => !!x.group_by_dimension);
  }

  handleRunExport = () => {
    this.setState({ exportIsRunning: true });
    const {
      selectedDatamartId,
      location: { search },
      intl: { formatMessage },
      match: {
        params: { organisationId },
      },
    } = this.props;

    const routeParams = parseSearch(search, FUNNEL_SEARCH_SETTING);
    const detectGroupBy = (funnelFilters: FunnelFilter[]) => {
      return funnelFilters.some(filter => filter.group_by_dimension);
    };
    const funnelFilter: FunnelFilter[] =
      routeParams.filter.length > 0 ? JSON.parse(routeParams.filter) : [];

    const funnelTimeRange = extractDatesFromProps(search);

    const splitIndex =
      this.splitIndex(funnelFilter) === -1
        ? funnelFilter.length - 1
        : this.splitIndex(funnelFilter);
    if (!detectGroupBy(funnelFilter)) {
      funnelFilter[funnelFilter.length - 1].group_by_dimension = 'DATE_YYYY_MM_DD';
      this._userActivitiesFunnelService
        .getUserActivitiesFunnel(selectedDatamartId, funnelFilter, funnelTimeRange)
        .then(funnelResponse => {
          this.setState({ exportIsRunning: false });
          const globalSheet: FunnelSheetDescription = {
            title: 'Funnel report',
            splitIndex: undefined,
            funnelData: {
              ...funnelResponse.data,
              grouped_by: undefined,
            },
          };

          const byDaySheet: FunnelSheetDescription = {
            title: 'Funnel report split by day',
            splitIndex: splitIndex,
            funnelData: {
              ...funnelResponse.data,
              grouped_by: funnelResponse.data.grouped_by?.sort((a, b) =>
                a.dimension_value > b.dimension_value ? 1 : -1,
              ),
            },
          };
          const sheets = [globalSheet, byDaySheet];
          ExportService.exportFunnel(sheets, selectedDatamartId, organisationId, formatMessage);
        })
        .catch(e => {
          this.props.notifyError(e);
          this.setState({
            exportIsRunning: false,
          });
        });
    } else {
      const promises: Array<Promise<FunnelResponse>> = [];
      promises.push(
        this._userActivitiesFunnelService.getUserActivitiesFunnel(
          selectedDatamartId,
          funnelFilter,
          funnelTimeRange,
        ),
      );
      const secondCallFilter: FunnelFilter[] = funnelFilter.map((filter, index) => {
        if (funnelFilter.length === index + 1) filter.group_by_dimension = 'DATE_YYYY_MM_DD';
        else filter.group_by_dimension = undefined;
        return filter;
      });
      promises.push(
        this._userActivitiesFunnelService.getUserActivitiesFunnel(
          selectedDatamartId,
          secondCallFilter,
          funnelTimeRange,
        ),
      );
      Promise.all(promises)
        .then(res => {
          this.setState({ exportIsRunning: false });
          const globalSheet: FunnelSheetDescription = {
            title: 'Funnel report',
            splitIndex: this.splitIndex(funnelFilter),
            funnelData: res[0].data,
          };
          const byDaySheet: FunnelSheetDescription = {
            title: 'Funnel report split by day',
            splitIndex: funnelFilter.length - 1,
            funnelData: {
              ...res[1].data,
              grouped_by: res[1].data.grouped_by?.sort((a, b) =>
                a.dimension_value > b.dimension_value ? 1 : -1,
              ),
            },
          };
          const sheets = [globalSheet, byDaySheet];
          ExportService.exportFunnel(sheets, selectedDatamartId, organisationId, formatMessage);
        })
        .catch(e => {
          this.props.notifyError(e);
          this.setState({
            exportIsRunning: false,
          });
        });
    }
  };

  handleExecuteQueryButtonClick = () => {
    const { executeQueryFunction } = this.state;
    if (executeQueryFunction) {
      executeQueryFunction();
    }
  };

  handleFunnelWrapperCallback = (
    executeQueryFunction: () => void,
    cancelQueryFunction: () => void,
    isLoading: boolean,
  ) => {
    const { exportIsRunning } = this.state;
    this.setState({
      exportIsRunning: exportIsRunning,
      isLoading: isLoading,
      executeQueryFunction: executeQueryFunction,
      cancelQueryFunction: cancelQueryFunction,
    });
  };

  handleCancelButtonClick = () => {
    const { cancelQueryFunction } = this.state;
    if (cancelQueryFunction) {
      cancelQueryFunction();
      this.setState({
        isLoading: false,
      });
    }
  };

  updateLocationSearch = (params: FILTERS) => {
    const {
      history,
      location: { search: currentSearch, pathname },
    } = this.props;
    const nextLocation = {
      pathname,
      search: updateSearch(currentSearch, params, FUNNEL_SEARCH_SETTING),
    };

    history.push(nextLocation);
  };

  handleDateRangePickerChangeFunction = (newValues: McsDateRangeValue): void => {
    this.updateLocationSearch({
      from: newValues.from,
      to: newValues.to,
    });
    this.setState({
      dateRange: {
        from: newValues.from,
        to: newValues.to,
      },
    });
  };

  handleAfterFunnelLinkCopy = () => {
    this.props.notifySuccess({
      message: funnelMessages.copied.defaultMessage,
      description: '',
    });
  };

  render() {
    const {
      selectedDatamartId,
      location: { search },
    } = this.props;
    const { exportIsRunning, isLoading, dateRange, selectedTemplate } = this.state;
    const routeParams = parseSearch(search, FUNNEL_SEARCH_SETTING);
    const breadcrumbPaths = [
      <span className='mcs-pathItem' key='1'>
        Funnel Analytics
        <MentionTag className='mcs-pathItem_mentionTag' mention='BETA' />
      </span>,
    ];

    return (
      <div className='ant-layout'>
        <Actionbar pathItems={breadcrumbPaths}>
          <FunnelTemplateSelector selectedValue={selectedTemplate} />
          <McsDateRangePicker
            values={dateRange}
            onChange={this.handleDateRangePickerChangeFunction}
          />
          {routeParams.filter.length > 0 && (
            <Button
              className='mcs-funnelQueryBuilder_exportBtn'
              onClick={this.handleRunExport}
              loading={exportIsRunning}
            >
              {!exportIsRunning && <McsIcon type='download' />}
              <FormattedMessage id='funnel.actionbar.exportButton' defaultMessage='Export' />
            </Button>
          )}
          {isLoading && (
            <Button
              className='mcs-funnelQueryBuilder_cancelBtn'
              type='default'
              onClick={this.handleCancelButtonClick}
            >
              Cancel
            </Button>
          )}
          <Button
            className='mcs-primary mcs-funnelQueryBuilder_executeQueryBtn'
            type='primary'
            onClick={this.handleExecuteQueryButtonClick}
            loading={isLoading}
          >
            {!isLoading && <McsIcon type='play' />}
            Execute Query
          </Button>
          <CopyToClipboard text={window.location.href} onCopy={this.handleAfterFunnelLinkCopy}>
            <Button icon={<CopyOutlined />}>
              <FormattedMessage id='funnel.share' defaultMessage='Share' />
            </Button>
          </CopyToClipboard>
        </Actionbar>
        <Content className='mcs-content-container'>
          <FunnelWrapper
            datamartId={selectedDatamartId}
            parentCallback={this.handleFunnelWrapperCallback}
            dateRange={dateRange}
          />
        </Content>
      </div>
    );
  }
}

export default compose(
  withDatamartSelector,
  withRouter,
  injectIntl,
  injectNotifications,
)(FunnelPage);
