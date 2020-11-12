import * as React from 'react';
import _ from 'lodash';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import AudienceBuilderSelector, { messages } from './AudienceBuilderSelector';
import AudienceBuilderContainer from './AudienceBuilderContainer';
import {
  AudienceBuilderResource,
  AudienceBuilderFormData,
  QueryDocument as AudienceBuilderQueryDocument,
} from '../../../models/audienceBuilder/AudienceBuilderResource';
import { UserQuerySegment } from '../../../models/audiencesegment/AudienceSegmentResource';
import { lazyInject } from '../../../config/inversify.config';
import { IAudienceBuilderService } from '../../../services/AudienceBuilderService';
import { TYPES } from '../../../constants/types';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import {
  INITIAL_AUDIENCE_BUILDER_FORM_DATA,
  formatQuery,
  FORM_ID,
} from './constants';
import { Loading } from '../../../components';
import { IQueryService } from '../../../services/QueryService';
import { IAudienceFeatureService } from '../../../services/AudienceFeatureService';
import { IAudienceSegmentService } from '../../../services/AudienceSegmentService';
import {
  withDatamartSelector,
  WithDatamartSelectorProps,
} from '../../Datamart/WithDatamartSelector';
import { withRouter, RouteComponentProps } from 'react-router';
import { MicsReduxState } from '../../../utils/ReduxHelper';
import { getFormValues } from 'redux-form';
import { connect } from 'react-redux';
import { NewUserQuerySimpleFormData } from '../../QueryTool/SaveAs/NewUserQuerySegmentSimpleForm';
import AudienceBuilderActionbar from './AudienceBuilderActionbar';
import { calculateDefaultTtl } from '../Segments/Edit/domain';

interface State {
  audienceBuilders?: AudienceBuilderResource[];
  selectedAudienceBuilder?: AudienceBuilderResource;
  formData: AudienceBuilderFormData;
  isLoading: boolean;
}

interface MapStateToProps {
  formValues: AudienceBuilderFormData;
}

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  MapStateToProps &
  RouteComponentProps<{ organisationId: string }> &
  WithDatamartSelectorProps;

class AudienceBuilderPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceBuilderService)
  private _audienceBuilderService: IAudienceBuilderService;

  @lazyInject(TYPES.IAudienceFeatureService)
  private _audienceFeatureService: IAudienceFeatureService;

  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;

  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoading: true,
      formData: INITIAL_AUDIENCE_BUILDER_FORM_DATA,
    };
  }

  componentDidMount() {
    const { selectedDatamartId } = this.props;
    this.getAudienceBuilders(selectedDatamartId);
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const {
      match: {
        params: { organisationId },
      },
      selectedDatamartId,
    } = this.props;
    const {
      match: {
        params: { organisationId: prevOrganisationId },
      },
      selectedDatamartId: prevSelectedDatamartId,
    } = prevProps;
    if (
      organisationId !== prevOrganisationId ||
      selectedDatamartId !== prevSelectedDatamartId
    ) {
      this.getAudienceBuilders(selectedDatamartId);
    }
  }

  getAudienceBuilders = (datamartId: string) => {
    return this._audienceBuilderService
      .getAudienceBuilders(datamartId)
      .then(res => {
        this.setState({
          audienceBuilders: res.data,
          selectedAudienceBuilder:
            res.data.length === 1 ? res.data[0] : undefined,
          isLoading: false,
        });
      })
      .catch(error => {
        this.setState({
          isLoading: false,
        });
        this.props.notifyError(error);
      });
  };

  selectAudienceBuilder = (audienceBuilder: AudienceBuilderResource) => {
    if (audienceBuilder.demographics_features_ids.length >= 1) {
      const datamartId = audienceBuilder.datamart_id;
      const promises = audienceBuilder.demographics_features_ids.map(id => {
        return this._audienceFeatureService.getAudienceFeature(datamartId, id);
      });
      Promise.all(promises).then(resp => {
        const parametricPredicates = resp.map(r => {
          return r.data;
        });
        this.setState({
          selectedAudienceBuilder: audienceBuilder,
          formData: {
            where: {
              type: 'GROUP',
              boolean_operator: 'AND',
              expressions: [
                {
                  type: 'GROUP',
                  boolean_operator: 'AND',
                  expressions: parametricPredicates.map(p => {
                    const parameters: { [key: string]: any } = {};
                    p.variables.forEach(v => {
                      const parameterName = v.parameter_name;
                      parameters[parameterName] = '';
                    });
                    return {
                      type: 'PARAMETRIC_PREDICATE',
                      parametric_predicate_id: p.id,
                      parameters: parameters,
                    };
                  }),
                },
              ],
            },
          },
        });
      });
    } else {
      this.setState({
        selectedAudienceBuilder: audienceBuilder,
        formData: INITIAL_AUDIENCE_BUILDER_FORM_DATA,
      });
    }
  };

  audienceBuilderActionbar = (
    query: AudienceBuilderQueryDocument,
    datamartId: string,
  ) => {
    const saveAudience = (userQueryFormData: NewUserQuerySimpleFormData) => {
      const { match, history } = this.props;
      const { name, technical_name, persisted } = userQueryFormData;

      return this._queryService
        .createQuery(datamartId, {
          query_language: 'JSON_OTQL',
          query_text: JSON.stringify(formatQuery(query)),
        })
        .then(res => {
          const userQuerySegment: Partial<UserQuerySegment> = {
            datamart_id: datamartId,
            type: 'USER_QUERY',
            name,
            technical_name,
            persisted,
            default_ttl: calculateDefaultTtl(userQueryFormData),
            query_id: res.data.id,
            segment_editor: 'AUDIENCE_BUILDER',
          };
          return this._audienceSegmentService.saveSegment(
            match.params.organisationId,
            userQuerySegment,
          );
        })
        .then(res => {
          history.push(
            `/v2/o/${match.params.organisationId}/audience/segments/${res.data.id}`,
          );
        });
    };

    return <AudienceBuilderActionbar save={saveAudience} />;
  };

  render() {
    const { intl, selectedDatamartId } = this.props;
    const {
      selectedAudienceBuilder,
      audienceBuilders,
      isLoading,
      formData,
    } = this.state;

    if (isLoading) {
      return <Loading className="loading-full-screen" />;
    }

    return selectedAudienceBuilder ? (
      <AudienceBuilderContainer
        initialValues={formData}
        demographicsFeaturesIds={
          selectedAudienceBuilder.demographics_features_ids
        }
        audienceBuilderId={selectedAudienceBuilder.id}
        datamartId={selectedDatamartId}
        renderActionBar={this.audienceBuilderActionbar}
      />
    ) : (
      <AudienceBuilderSelector
        audienceBuilders={audienceBuilders || []}
        onSelect={this.selectAudienceBuilder}
        datamartId={selectedDatamartId}
        actionbarProps={{
          paths: [
            {
              name: intl.formatMessage(messages.subTitle),
            },
          ],
        }}
        isMainlayout={true}
      />
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  formValues: getFormValues(FORM_ID)(state),
});

export default compose(
  withDatamartSelector,
  withRouter,
  injectIntl,
  injectNotifications,
  connect(mapStateToProps),
)(AudienceBuilderPage);
