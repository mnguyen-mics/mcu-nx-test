import queryString from 'query-string';
import * as React from 'react';
import { InjectedIntlProps, injectIntl, defineMessages } from 'react-intl';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import { compose } from 'recompose';
import { UserQuerySegment } from '../../../models/audiencesegment/AudienceSegmentResource';
import { DatamartResource } from '../../../models/datamart/DatamartResource';
import { QueryDocument } from '../../../models/datamart/graphdb/QueryDocument';
import { DatamartSelector } from '../../Datamart';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import JSONQLBuilderContainer from '../../QueryTool/JSONOTQL/JSONQLBuilderContainer';
import { NewUserQuerySimpleFormData } from '../../QueryTool/SaveAs/NewUserQuerySegmentSimpleForm';
import SaveQueryAsActionBar from '../../QueryTool/SaveAs/SaveQueryAsActionBar';
import { IAudienceSegmentService } from '../../../services/AudienceSegmentService';
import { TYPES } from '../../../constants/types';
import { lazyInject } from '../../../config/inversify.config';
import { IQueryService } from '../../../services/QueryService';
import { MicsReduxState } from '../../../utils/ReduxHelper';
import { Alert } from 'antd';
import { UserProfileResource } from '../../../models/directory/UserProfileResource';
import { calculateDefaultTtl } from '../Segments/Edit/domain';
import { injectFeatures, InjectedFeaturesProps } from '../../Features';
import { ITagService } from '../../../services/TagService';

export interface QueryBuilderPageRouteParams {
  organisationId: string;
}

interface MapStateToProps {
  connectedUser: UserProfileResource;
}

type Props = RouteComponentProps<QueryBuilderPageRouteParams> &
  MapStateToProps &
  InjectedFeaturesProps &
  InjectedNotificationProps &
  InjectedIntlProps;

const messages = defineMessages({
  segmentBuilder: {
    id: 'audience.segmentBuilder.actionbar.title',
    defaultMessage: 'Segment Builder',
  },
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

class SegmentBuilderPage extends React.Component<Props> {
  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;

  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  @lazyInject(TYPES.ITagService)
  private _tagService: ITagService;

  render() {
    const { intl, connectedUser, location, history, match, hasFeature } = this.props;

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
              segment_editor: 'SEGMENT_BUILDER',
            };
            return this._audienceSegmentService.saveSegment(
              match.params.organisationId,
              userQuerySegment,
            );
          })
          .then(res => {
            this._tagService.sendEvent(
              'create_segment',
              'Advanced Segment Builder',
              'Save Segment',
            );
            history.push(`/v2/o/${match.params.organisationId}/audience/segments/${res.data.id}`);
          });
      };

      const convert2Otql = () => {
        return this._queryService
          .createQuery(datamartId, {
            query_language: 'JSON_OTQL',
            query_text: JSON.stringify(query),
          })
          .then(d => d.data)
          .then(d => {
            return this._queryService.convertJsonOtql2Otql(datamartId, d);
          });
      };

      return (
        <SaveQueryAsActionBar
          saveAsUserQuery={saveAsUserQuery}
          convertToOtql={convert2Otql}
          breadcrumb={[
            hasFeature('audience-segment_builder_v2')
              ? intl.formatMessage(messages.advancedSegmentBuilder)
              : intl.formatMessage(messages.segmentBuilder),
          ]}
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
              pathItems: [
                hasFeature('audience-segment_builder_v2')
                  ? intl.formatMessage(messages.advancedSegmentBuilder)
                  : intl.formatMessage(messages.segmentBuilder),
              ],
            }}
            isMainlayout={true}
          />
        )}
        {selectedDatamart && selectedDatamart.storage_model_version === 'v201709' && (
          <JSONQLBuilderContainer
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
  injectFeatures,
  injectNotifications,
  connect((state: MicsReduxState) => ({
    connectedUser: state.session.connectedUser,
  })),
)(SegmentBuilderPage);
