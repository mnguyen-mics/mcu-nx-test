import * as React from 'react';
import { Alert } from 'antd';
import { withRouter, RouteComponentProps } from 'react-router';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import { OTQLResult, QueryPrecisionMode } from '../../../models/datamart/graphdb/OTQLResult';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import OTQLResultRenderer from './OTQLResultRenderer';
import OTQLEditor from './OTQLEditor';
import { InjectedFeaturesProps, injectFeatures } from '../../Features';
import { ObjectLikeTypeInfoResource } from '../../../models/datamart/graphdb/RuntimeSchema';

export interface QueryToolTabProps {
  datamartId: string;
  query?: string;
  queryEditorClassName?: string;
  editionMode?: boolean;
  serieQueries: SerieQueryModel[];
  onSeriesChanged: (newSeries: SerieQueryModel[]) => void;
  runQuery: () => void;
  onInputChange: (id: string) => (e: any) => void;
  updateQueryModel: (id: string) => (query: string) => void;
  updateNameModel: (id: string) => (e: any) => void;
  displaySerieInput: (id: string) => (e: any) => void;
  showChartLegend?: boolean;
  error: any | null;
  queryResult: OTQLResult | null;
  runningQuery: boolean;
  queryAborted: boolean;
  precision: QueryPrecisionMode;
  evaluateGraphQl: boolean;
  useCache: boolean;
  noLiveSchemaFound: boolean;
  rawSchema?: ObjectLikeTypeInfoResource[];
  dismissError: () => void;
  abortQuery: () => void;
  onSaveChart?: () => void;
}

interface AbstractSerieQueryModel {
  id: string;
  name: string;
  inputVisible?: boolean;
}

export interface QueryListModel extends AbstractSerieQueryModel {
  query: string;
}
export interface SerieQueryModel extends AbstractSerieQueryModel {
  queryModel: string | QueryListModel[];
}

type Props = QueryToolTabProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }> &
  InjectedNotificationProps &
  InjectedFeaturesProps;

class QueryToolTab extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      intl,
      datamartId,
      queryEditorClassName,
      editionMode,
      serieQueries,
      onSeriesChanged,
      runQuery,
      onInputChange,
      displaySerieInput,
      updateNameModel,
      updateQueryModel,
      queryResult,
      runningQuery,
      queryAborted,
      precision,
      evaluateGraphQl,
      useCache,
      noLiveSchemaFound,
      error,
      dismissError,
      showChartLegend,
      abortQuery,
      query,
      onSaveChart,
    } = this.props;

    const errorMsg = error && (
      <Alert
        message='Error'
        style={{ marginBottom: 40 }}
        description={
          error.error_id ? (
            <span>
              {error.error}
              <br />
              <code>{error.error_id}</code>
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
        style={{ marginBottom: 40 }}
        description={intl.formatMessage(messages.noLiveSchemaFound)}
        type='error'
        showIcon={true}
      />
    );

    const queryResultRenderer: React.ReactNode = (runningQuery || queryAborted || queryResult) && (
      <OTQLResultRenderer
        loading={runningQuery}
        result={queryResult}
        aborted={queryAborted}
        query={query}
        datamartId={datamartId}
        showChartLegend={showChartLegend}
        serieQueries={serieQueries}
        onSaveChart={onSaveChart}
      />
    );

    const _onSeriesChanged = onSeriesChanged;

    const handleChange = (eg: boolean, c: boolean, p: QueryPrecisionMode) =>
      this.setState({ evaluateGraphQl: eg, useCache: c, precision: p });

    return (
      <span className='mcs-otqlQuery_container'>
        {errorMsg}
        {noLiveSchemaErrorMsg}
        <OTQLEditor
          onRunQuery={runQuery}
          onAbortQuery={abortQuery}
          runningQuery={runningQuery}
          datamartId={datamartId}
          handleChange={handleChange}
          precision={precision}
          evaluateGraphQl={evaluateGraphQl}
          useCache={useCache}
          queryEditorClassName={queryEditorClassName}
          isQuerySeriesActivated={true}
          serieQueries={serieQueries}
          onInputChange={onInputChange}
          updateQueryModel={updateQueryModel}
          updateNameModel={updateNameModel}
          displaySerieInput={displaySerieInput}
          onSeriesChanged={_onSeriesChanged}
          editionMode={editionMode}
        />
        {queryResultRenderer}
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
