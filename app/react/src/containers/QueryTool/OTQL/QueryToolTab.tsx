import * as React from 'react';
import { Alert, Button, Modal, Select, Switch } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { compose } from 'recompose';
import { injectIntl, WrappedComponentProps, defineMessages, FormattedMessage } from 'react-intl';
import { QueryPrecisionMode } from '../../../models/datamart/graphdb/OTQLResult';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import QueryResultContainer from './QueryResultContainer';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';
import { ObjectLikeTypeInfoResource } from '../../../models/datamart/graphdb/RuntimeSchema';
import { ChartType } from '@mediarithmics-private/advanced-components/lib/services/ChartDatasetService';
import { McsTabsItem } from './QueryToolTabsContainer';
import { SettingOutlined } from '@ant-design/icons';
import QueryToolSeries from './QueryToolSeries';
import { ChartResource } from '@mediarithmics-private/advanced-components/lib/models/chart/Chart';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { ITagService } from '@mediarithmics-private/advanced-components';
import { AnalyticsSourceType } from '@mediarithmics-private/advanced-components/lib/models/dashboards/dataset/common';
import { ReportRequestBody } from '@mediarithmics-private/advanced-components/lib/models/report/ReportRequestBody';
import {
  AnalyticsDimension,
  AnalyticsMetric,
} from '@mediarithmics-private/advanced-components/lib/utils/analytics/Common';

export interface QueryToolTabProps {
  datamartId: string;
  query?: string;
  tab: McsTabsItem;
  queryEditorClassName?: string;
  editionMode?: boolean;
  onSeriesChange: (newSeries: SerieQueryModel[]) => void;
  runQuery: (chartType?: ChartType) => void;
  onInputChange: (id: string) => (e: any) => void;
  updateQueryModel: (serieId: string, subStepId?: string) => (query: AbstractQueryModel) => void;
  updateNameModel: (id: string) => (e: any) => void;
  displaySerieInput: (id: string) => (e: any) => void;
  noLiveSchemaFound: boolean;
  rawSchema?: ObjectLikeTypeInfoResource[];
  dismissError: () => void;
  abortQuery: () => void;
  onSaveChart?: (chart: ChartResource) => void;
  onDeleteChart: () => void;
  onQueryParamsChange: (eg: boolean, c: boolean, p: QueryPrecisionMode) => void;
}

export type QueryModelType = 'otql' | AnalyticsSourceType;

export interface OTQLQueryModel {
  query: string;
}

export type AnalyticsQueryModel<M, D> = Omit<
  ReportRequestBody<M, D>,
  'order_by' | 'first_result' | 'max_result' | 'sample_factor'
>;

export type AbstractQueryModel =
  | OTQLQueryModel
  | AnalyticsQueryModel<AnalyticsMetric, AnalyticsDimension>;

export interface AbstractSerieQueryModel {
  id: string;
  name: string;
  inputVisible?: boolean;
  type?: QueryModelType;
}
export interface SerieQueryModel extends AbstractSerieQueryModel {
  queryModel: AbstractQueryModel | AbstractListQueryModel[];
}

export interface AbstractListQueryModel extends AbstractSerieQueryModel {
  queryModel: AbstractQueryModel;
}

interface State {
  visible: boolean;
}

type Props = QueryToolTabProps &
  WrappedComponentProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedNotificationProps &
  InjectedFeaturesProps;

class QueryToolTab extends React.Component<Props, State> {
  @lazyInject(TYPES.ITagService)
  private _tagService: ITagService;

  constructor(props: Props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  buildEditorActions = (tab: McsTabsItem) => {
    const {
      runQuery,
      abortQuery,
      tab: { runningQuery },
    } = this.props;

    const handleOnRunButtonClick = () => {
      const { noLiveSchemaFound } = this.props;
      this._tagService.pushEvent('RunQuery', 'Query tool');
      if (!noLiveSchemaFound) runQuery();
    };

    const runButton = (
      <Button
        type='primary'
        className='mcs-otqlInputEditor_run_button'
        onClick={handleOnRunButtonClick}
      >
        <FormattedMessage id='queryTool.otql.edit.new.run.label' defaultMessage='Run' />
      </Button>
    );

    const abortButton = (
      <Button type='primary' className='mcs-otqlInputEditor_abort_button' onClick={abortQuery}>
        <FormattedMessage id='queryTool.otql.edit.new.abort.label' defaultMessage='Abort' />
      </Button>
    );

    const params = (
      <a className='mcs-otqlInputEditor_settings_button' onClick={this.showModal}>
        <SettingOutlined />
      </a>
    );

    return (
      <div>
        {params}
        {runningQuery ? abortButton : runButton}
      </div>
    );
  };

  showModal = () => {
    this.setState({ visible: true });
  };

  handleOk = () => {
    this.setState({ visible: false });
  };

  render() {
    const {
      intl,
      datamartId,
      editionMode,
      onSeriesChange,
      tab,
      onInputChange,
      displaySerieInput,
      updateNameModel,
      updateQueryModel,
      noLiveSchemaFound,
      dismissError,
      query,
      onSaveChart,
      onDeleteChart,
      onQueryParamsChange,
    } = this.props;

    const onCacheChange = (a: boolean) =>
      onQueryParamsChange(tab.evaluateGraphQl, a, tab.precision);
    const onEvaluateGraphQlChange = (a: boolean) =>
      onQueryParamsChange(a, tab.useCache, tab.precision);
    const onPrecisionChange = (a: QueryPrecisionMode) =>
      onQueryParamsChange(tab.evaluateGraphQl, tab.useCache, a);

    const errorMsg = tab.error && (
      <Alert
        message='Error'
        style={{ marginTop: 50 }}
        description={
          tab.error.error_id ? (
            <span>
              {tab.error.error}
              <br />
              <code>{tab.error.error_id}</code>
            </span>
          ) : (
            intl.formatMessage(messages.queryErrorDefaultMsg)
          )
        }
        type='error'
        showIcon={true}
        closable={true}
        onClose={dismissError}
      />
    );

    const noLiveSchemaErrorMsg = noLiveSchemaFound && (
      <Alert
        message='Error'
        style={{ marginTop: 50 }}
        description={intl.formatMessage(messages.noLiveSchemaFound)}
        type='error'
        showIcon={true}
      />
    );

    const queryResultRenderer: React.ReactNode = !errorMsg && !noLiveSchemaErrorMsg && (
      <QueryResultContainer
        tab={tab}
        query={query}
        datamartId={datamartId}
        onSaveChart={onSaveChart}
        onDeleteChart={onDeleteChart}
      />
    );

    return (
      <span className='mcs-otqlQuery_container'>
        <QueryToolSeries
          datamartId={datamartId}
          actionButtons={this.buildEditorActions(tab)}
          seriesQueries={tab.serieQueries}
          onInputChange={onInputChange}
          updateQueryModel={updateQueryModel}
          updateNameModel={updateNameModel}
          displaySeriesInput={displaySerieInput}
          onSeriesChange={onSeriesChange}
          editionMode={editionMode}
        />
        <Modal
          title='Query Settings'
          visible={this.state.visible}
          onOk={this.handleOk}
          onCancel={this.handleOk}
          footer={[
            <Button key={1} onClick={this.handleOk}>
              Ok
            </Button>,
          ]}
        >
          <div style={{ marginBottom: 10 }}>
            <FormattedMessage
              id='queryTool.otql.modal.evaluate.graphql'
              defaultMessage='Evaluate SELECT clause in GraphQL'
            />
            : <Switch checked={tab.evaluateGraphQl} onChange={onEvaluateGraphQlChange} />
          </div>
          <div style={{ marginBottom: 10 }}>
            <FormattedMessage id='queryTool.otql.modal.use.cache' defaultMessage='Use Cache' />
            : <Switch checked={tab.useCache} onChange={onCacheChange} />
          </div>
          <div>
            <Select value={tab.precision} style={{ width: '100%' }} onChange={onPrecisionChange}>
              <Select.Option value='FULL_PRECISION'>
                <FormattedMessage
                  id='queryTool.otql.modal.full.precision'
                  defaultMessage='Full Precision'
                />
              </Select.Option>
              <Select.Option value='MEDIUM_PRECISION'>
                <FormattedMessage
                  id='queryTool.otql.modal.medium.precision'
                  defaultMessage='Medium Precision'
                />
              </Select.Option>
              <Select.Option value='LOWER_PRECISION'>
                <FormattedMessage
                  id='queryTool.otql.modal.low.precision'
                  defaultMessage='Low Precision'
                />
              </Select.Option>
            </Select>
          </div>
        </Modal>
        {noLiveSchemaErrorMsg || errorMsg || queryResultRenderer}
      </span>
    );
  }
}

export default compose<Props, QueryToolTabProps>(
  injectIntl,
  withRouter,
  injectNotifications,
  injectFeatures,
)(QueryToolTab);

const messages = defineMessages({
  queryToolBreadcrumbLabel: {
    id: 'query-tool.action-bar.breadcrumb.label.query-tool',
    defaultMessage: 'Query Tool',
  },
  queryErrorDefaultMsg: {
    id: 'query-tool.error.default-message',
    defaultMessage: 'An error occured',
  },
  noLiveSchemaFound: {
    id: 'query-tool.error.no-live-schena',
    defaultMessage: "This datamart can't be queried as there is no LIVE schema associated to it",
  },
});
