import queryString from 'query-string';
import * as React from 'react';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import { UserQuerySegment } from '../../../models/audiencesegment/AudienceSegmentResource';
import {
  DatamartResource,
  QueryTranslationRequest,
} from '../../../models/datamart/DatamartResource';
import { QueryDocument } from '../../../models/datamart/graphdb/QueryDocument';
import { DatamartSelector } from '../../Datamart';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import JSONQLBuilderContainer from './AdvancedSegmentBuilderContainer';
import { NewUserQuerySimpleFormData } from '../../QueryTool/SaveAs/NewUserQuerySegmentSimpleForm';
import SaveQueryAsActionBar from '../../QueryTool/SaveAs/SaveQueryAsActionBar';
import { IAudienceSegmentService } from '../../../services/AudienceSegmentService';
import { TYPES } from '../../../constants/types';
import { lazyInject } from '../../../config/inversify.config';
import { IQueryService } from '../../../services/QueryService';
import { ITagService, MicsReduxState } from '@mediarithmics-private/advanced-components';
import { Alert } from 'antd';
import { UserProfileResource } from '../../../models/directory/UserProfileResource';
import { calculateDefaultTtl } from '../Segments/Edit/domain';
import { ProcessingSelectionResource } from '../../../models/processing';

export interface QueryBuilderPageRouteParams {
  organisationId: string;
}

interface MapStateToProps {
  connectedUser: UserProfileResource;
}

interface AdvancedSegmentBuilderPageState {
  queryId?: string;
}

type Props = RouteComponentProps<QueryBuilderPageRouteParams> &
  MapStateToProps &
  InjectedNotificationProps &
  InjectedIntlProps;

const messages = defineMessages({
  advancedSegmentBuilder: {
    id: 'audience.segmentBuilder.actionbar.title.advancedBuilder',
    defaultMessage: 'Advanced Segment Builder',
  },
  noMoreSupported: {
    id: 'audience.segmentBuilder.legacyComponent.noMoreSupported',
    defaultMessage:
      'The query language related to this datamart is no more supported. Please select another datamart or create a new resource based on another datamart.',
  },
});

class AdvancedSegmentBuilderPage extends React.Component<Props, AdvancedSegmentBuilderPageState> {
  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;

  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  @lazyInject(TYPES.ITagService)
  private _tagService: ITagService;

  constructor(props: Props) {
    super(props);
    this.state = {
      queryId: undefined,
    };
  }

  handleOnSelectExistingSegment = (segment: UserQuerySegment) => {
    this.setState({
      queryId: segment.query_id,
    });
  };

  render() {
    const { intl, connectedUser, location, history, match } = this.props;

    const { queryId } = this.state;

    const handleOnSelectDatamart = (selection: DatamartResource) => {
      // this.setState({ datamart: selection });
      history.push({
        pathname: location.pathname,
        search: queryString.stringify({ datamartId: selection.id }),
      });
    };

    let selectedDatamart: DatamartResource | undefined;

    const orgWp = connectedUser.workspaces.find(
      (w: any) => w.organisation_id === this.props.match.params.organisationId,
    );

    const datamartIdQueryString = queryString.parse(location.search).datamartId;

    if (orgWp && orgWp.datamarts && orgWp.datamarts.length === 1) {
      selectedDatamart = orgWp.datamarts[0];
    }

    if (datamartIdQueryString && orgWp) {
      selectedDatamart = orgWp.datamarts.find(
        (d: DatamartResource) => d.id === datamartIdQueryString,
      );
    }

    const jsonQLActionbar = (query: QueryDocument, datamartId: string) => {
      const saveAsUserQuery = (segmentFormData: NewUserQuerySimpleFormData) => {
        const { name, technical_name, persisted } = segmentFormData;
        return this._queryService
          .createQuery(datamartId, {
            query_language: 'JSON_OTQL',
            query_text: JSON.stringify(query),
          })
          .then(res => {
            const userQuerySegment: Partial<UserQuerySegment> = {
              datamart_id: datamartId,
              type: 'USER_QUERY',
              name,
              technical_name,
              persisted,
              default_ttl: calculateDefaultTtl(segmentFormData),
              query_id: res.data.id,
              segment_editor: 'ADVANCED_SEGMENT_BUILDER',
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
            this._tagService.pushEvent('CreateSegment', 'Advanced Segment Builder');
            history.push(`/v2/o/${match.params.organisationId}/audience/segments/${res.data.id}`);
          });
      };

      const convert2Otql = () => {
        const queryTranslationRequest: QueryTranslationRequest = {
          input_query_language: 'JSON_OTQL',
          input_query_text: JSON.stringify(query),
          output_query_language: 'OTQL',
        };
        return this._queryService.translateQuery(datamartId, queryTranslationRequest);
      };

      return (
        <SaveQueryAsActionBar
          saveAsUserQuery={saveAsUserQuery}
          convertToOtql={convert2Otql}
          breadcrumb={[intl.formatMessage(messages.advancedSegmentBuilder)]}
          datamartId={datamartId}
          organisationId={this.props.match.params.organisationId}
          handleSelectExistingSegment={this.handleOnSelectExistingSegment}
        />
      );
    };

    // TODO DatamartSelector could render React.Children({ selectedDatamart })
    const style: React.CSSProperties = { height: '100%', display: 'flex' };
    return (
      <div style={style}>
        {!selectedDatamart && (
          <DatamartSelector
            onSelect={handleOnSelectDatamart}
            actionbarProps={{
              pathItems: [intl.formatMessage(messages.advancedSegmentBuilder)],
            }}
            isMainlayout={true}
          />
        )}
        {selectedDatamart && selectedDatamart.storage_model_version === 'v201709' && (
          <JSONQLBuilderContainer
            queryId={queryId}
            datamartId={selectedDatamart.id}
            renderActionBar={jsonQLActionbar}
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
  injectIntl,
  withRouter,
  injectNotifications,
  connect((state: MicsReduxState) => ({
    connectedUser: state.session.connectedUser,
  })),
)(AdvancedSegmentBuilderPage);
