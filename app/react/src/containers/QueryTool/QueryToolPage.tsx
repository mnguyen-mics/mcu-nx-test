import * as React from 'react';
import * as moment from 'moment';
import queryString from 'query-string';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import { DatamartResource } from '../../models/datamart/DatamartResource';
import { DatamartSelector } from '../Datamart';
import { NewUserQuerySimpleFormData } from '../QueryTool/SaveAs/NewUserQuerySegmentSimpleForm';
import { UserQuerySegment } from '../../models/audiencesegment/AudienceSegmentResource';
import { NewExportSimpleFormData } from '../QueryTool/SaveAs/NewExportSimpleForm';
import { IAudienceSegmentService } from '../../services/AudienceSegmentService';
import { TYPES } from '../../constants/types';
import { lazyInject } from '../../config/inversify.config';
import { IQueryService } from '../../services/QueryService';
import { IExportService } from '../../services/Library/ExportService';
import {
  ITagService,
  MicsReduxState,
  UserWorkspaceResource,
} from '@mediarithmics-private/advanced-components';
import { Alert } from 'antd';
import { ProcessingSelectionResource } from '../../models/processing';
import injectNotifications, {
  InjectedNotificationProps,
} from '../Notifications/injectNotifications';
import { UserProfileResource } from '../../models/directory/UserProfileResource';
import SaveQueryAsButton from './SaveAs/SaveQueryAsButton';
import QueryToolTabsContainer from './OTQL/QueryToolTabsContainer';

export interface QueryToolPageRouteParams {
  organisationId: string;
}

interface MapStateToProps {
  connectedUser: UserProfileResource;
}

interface QueryToolPageState {
  createdQueryId?: string;
}

type Props = RouteComponentProps<QueryToolPageRouteParams> &
  MapStateToProps &
  InjectedIntlProps &
  InjectedNotificationProps;

const messages = defineMessages({
  queryBuilder: {
    id: 'datastudio.queryTool.edit.actionbar.title',
    defaultMessage: 'Query Tool',
  },
  noMoreSupported: {
    id: 'datastudio.queryTool.edit.legacyComponent.noMoreSupported',
    defaultMessage:
      'The query language related to this datamart is no more supported. Please select another datamart or create a new resource based on another datamart.',
  },
});

class QueryToolPage extends React.Component<Props, QueryToolPageState> {
  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;

  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  @lazyInject(TYPES.IExportService)
  private _exportService: IExportService;

  @lazyInject(TYPES.ITagService)
  private _tagService: ITagService;

  constructor(props: Props) {
    super(props);
    this.state = {
      createdQueryId: undefined,
    };
  }

  getSelectedDatamart = (): DatamartResource | undefined => {
    const { location, connectedUser } = this.props;

    let selectedDatamart: DatamartResource | undefined;

    const orgWp = connectedUser.workspaces.find(
      (w: UserWorkspaceResource) => w.organisation_id === this.props.match.params.organisationId,
    );

    const datamartIdQueryString = queryString.parse(location.search).datamartId;

    if (orgWp?.datamarts?.length === 1) {
      selectedDatamart = orgWp.datamarts[0];
    }

    if (datamartIdQueryString && orgWp !== undefined) {
      selectedDatamart = orgWp.datamarts.find(
        (d: DatamartResource) => d.id === datamartIdQueryString,
      );
    }

    return selectedDatamart;
  };

  render() {
    const { intl, location, history, match } = this.props;
    const { createdQueryId } = this.state;
    const handleOnSelectDatamart = (selection: DatamartResource) => {
      history.push({
        pathname: location.pathname,
        search: queryString.stringify({ datamartId: selection.id }),
      });
    };

    const selectedDatamart = this.getSelectedDatamart();

    const renderSaveAsButton = (query: string, datamartId: string) => {
      const saveAsUserQuery = (segmentFormData: NewUserQuerySimpleFormData) => {
        return this._queryService
          .createQuery(datamartId, {
            query_language: 'OTQL',
            query_text: query,
          })
          .then(d => d.data)
          .then(queryResource => {
            const { name, technical_name, persisted } = segmentFormData;
            const userQuerySegment: Partial<UserQuerySegment> = {
              datamart_id: datamartId,
              type: 'USER_QUERY',
              name,
              technical_name,
              persisted,
              default_ttl: calculateDefaultTtl(segmentFormData),
              query_id: queryResource.id,
            };
            return this._audienceSegmentService.saveSegment(
              match.params.organisationId,
              userQuerySegment,
            );
          })
          .then(res => {
            const savePromises = segmentFormData.processingActivities.map(
              processingActivityField => {
                const processingActivity = processingActivityField.model;
                const processingSelectionResource: Partial<ProcessingSelectionResource> = {
                  processing_id: processingActivity.id,
                  processing_name: processingActivity.name,
                };

                return this._audienceSegmentService.createProcessingSelectionForAudienceSegment(
                  res.data.id,
                  processingSelectionResource,
                );
              },
            );

            return Promise.all(savePromises).then(_returnedProcessingActivities => {
              return res;
            });
          })
          .then(res => {
            this._tagService.sendEvent('create_segment', 'Query Tool', 'Save Segment');
            history.push(`/v2/o/${match.params.organisationId}/audience/segments/${res.data.id}`);
          });
      };
      const saveAsExport = (exportFormData: NewExportSimpleFormData) => {
        return this._queryService
          .createQuery(datamartId, {
            datamart_id: datamartId,
            query_language: 'OTQL',
            query_text: query,
          })
          .then(queryResource => {
            return this._exportService
              .createExport(match.params.organisationId, {
                name: exportFormData.name,
                output_format: exportFormData.outputFormat,
                query_id: queryResource.data.id,
                type: 'QUERY',
              })
              .then(res => {
                this._tagService.sendEvent('create_segment', 'Query Tool', 'Save Segment');
                history.push(
                  `/v2/o/${match.params.organisationId}/datastudio/exports/${res.data.id}`,
                );
              });
          });
      };

      const saveAsTechnicalQuery = () => {
        return this._queryService
          .createQuery(datamartId, {
            query_language: 'OTQL',
            query_text: query,
          })
          .then(d => d.data)
          .then(queryResource => {
            this.setState({
              createdQueryId: queryResource.id,
            });
          })
          .catch(err => {
            this.props.notifyError(err);
          });
      };
      return (
        <SaveQueryAsButton
          saveAsUserQuery={saveAsUserQuery}
          saveAsExport={saveAsExport}
          saveAsTechnicalQuery={saveAsTechnicalQuery}
          csvExportDisabled={true}
        />
      );
    };

    return (
      <div style={{ height: '100%', display: 'flex' }}>
        {!selectedDatamart && (
          <DatamartSelector
            onSelect={handleOnSelectDatamart}
            actionbarProps={{
              pathItems: [intl.formatMessage(messages.queryBuilder)],
            }}
            isMainlayout={true}
          />
        )}
        {selectedDatamart && selectedDatamart.storage_model_version === 'v201709' && (
          <QueryToolTabsContainer
            renderSaveAsButton={renderSaveAsButton}
            datamartId={selectedDatamart.id}
            createdQueryId={createdQueryId}
          />
        )}
        {selectedDatamart && selectedDatamart.storage_model_version === 'v201506' && (
          <Alert message={intl.formatMessage(messages.noMoreSupported)} type='warning' />
        )}
      </div>
    );
  }
}

export default compose(
  withRouter,
  injectIntl,
  injectNotifications,
  connect((state: MicsReduxState) => ({
    connectedUser: state.session.connectedUser,
  })),
)(QueryToolPage);

function calculateDefaultTtl(formData: NewUserQuerySimpleFormData) {
  if (formData.defaultLifetime && formData.defaultLifetimeUnit) {
    return moment
      .duration(Number(formData.defaultLifetime), formData.defaultLifetimeUnit)
      .asMilliseconds();
  }
  return undefined;
}
