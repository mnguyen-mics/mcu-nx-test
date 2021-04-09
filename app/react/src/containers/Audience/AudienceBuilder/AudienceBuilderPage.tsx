import * as React from 'react';
import _ from 'lodash';
import { compose } from 'recompose';
import queryString from 'query-string';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Loading } from '@mediarithmics-private/mcs-components-library';
import AudienceBuilderSelector, { messages } from './AudienceBuilderSelector';
import AudienceBuilderContainer from './AudienceBuilderContainer';
import NewAudienceBuilderContainer from './NewAudienceBuilderContainer';
import {
  AudienceBuilderResource,
  AudienceBuilderFormData,
  NewAudienceBuilderFormData,
  AudienceBuilderParametricPredicateNode,
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
  NEW_INITIAL_AUDIENCE_BUILDER_FORM_DATA,
} from './constants';
import { IQueryService } from '../../../services/QueryService';
import { IAudienceFeatureService } from '../../../services/AudienceFeatureService';
import { IAudienceSegmentService } from '../../../services/AudienceSegmentService';
import { withRouter, RouteComponentProps } from 'react-router';
import { NewUserQuerySimpleFormData } from '../../QueryTool/SaveAs/NewUserQuerySegmentSimpleForm';
import AudienceBuilderActionbar from './AudienceBuilderActionbar';
import { calculateDefaultTtl } from '../Segments/Edit/domain';
import { InjectedWorkspaceProps, injectWorkspace } from '../../Datamart';
import { injectFeatures, InjectedFeaturesProps } from '../../Features';
import { AudienceFeatureResource } from '../../../models/audienceFeature';

interface State {
  audienceBuildersByDatamartId?: AudienceBuilderResource[][];
  selectedAudienceBuilder?: AudienceBuilderResource;
  formData: AudienceBuilderFormData;
  newFormData: NewAudienceBuilderFormData;
  isLoading: boolean;
}

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  InjectedFeaturesProps &
  InjectedWorkspaceProps &
  RouteComponentProps<{ organisationId: string }>;

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
      newFormData: NEW_INITIAL_AUDIENCE_BUILDER_FORM_DATA,
      formData: INITIAL_AUDIENCE_BUILDER_FORM_DATA,
    };
  }

  componentDidMount() {
    const {
      location: { search },
    } = this.props;
    this.getAudienceBuilders().then(() => {
      const audienceBuilderId = queryString.parse(search).audienceBuilderId;
      if (audienceBuilderId) {
        this.getAudienceBuilder(audienceBuilderId);
      }
    });
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const {
      match: {
        params: { organisationId },
      },
      location: { search },
    } = this.props;
    const {
      match: {
        params: { organisationId: prevOrganisationId },
      },
      location: { search: prevSearch },
    } = prevProps;
    const {
      audienceBuildersByDatamartId,
      selectedAudienceBuilder,
      isLoading,
    } = this.state;
    if (organisationId !== prevOrganisationId) {
      this.getAudienceBuilders();
    } else if (
      selectedAudienceBuilder === undefined &&
      audienceBuildersByDatamartId?.length === 1 &&
      audienceBuildersByDatamartId[0].length === 1 &&
      !isLoading
    ) {
      this.getAudienceBuilder(audienceBuildersByDatamartId[0][0].id);
    } else if (search !== prevSearch) {
      const audienceBuilderId = queryString.parse(search).audienceBuilderId;
      this.getAudienceBuilder(audienceBuilderId);
    }
  }

  getAudienceBuilders = () => {
    const { workspace } = this.props;
    this.setState({
      selectedAudienceBuilder: undefined,
      isLoading: true,
    });
    const promises = workspace.datamarts.map((d) => {
      return this._audienceBuilderService
        .getAudienceBuilders(d.id)
        .then((res) => {
          return res.data;
        });
    });
    return Promise.all(promises)
      .then((res) => {
        this.setState({
          audienceBuildersByDatamartId: res.filter((r) => r.length > 0),
          isLoading: false,
        });
      })
      .catch((error) => {
        this.setState({
          isLoading: false,
        });
        this.props.notifyError(error);
      });
  };

  selectAudienceBuilder = (audienceBuilderId?: string) => {
    const {
      match: {
        params: { organisationId },
      },
    } = this.props;
    this.props.history.push(
      `/v2/o/${organisationId}/audience/segment-builder-v2?audienceBuilderId=${audienceBuilderId}`,
    );
  };

  getAudienceBuilder = (audienceBuilderId?: string) => {
    const { audienceBuildersByDatamartId } = this.state;

    if (audienceBuilderId) {
      const audienceBuilder = _.flattenDeep(audienceBuildersByDatamartId).find(
        (b) => b.id === audienceBuilderId,
      );

      if (
        audienceBuilder &&
        audienceBuilder.demographics_features_ids.length >= 1
      ) {
        const datamartId = audienceBuilder.datamart_id;
        const demographicsFeatures = audienceBuilder.demographics_features_ids.map(
          (id) => {
            return this._audienceFeatureService.getAudienceFeature(
              datamartId,
              id,
            );
          },
        );

        const setUpPredicates = (
          features: AudienceFeatureResource[],
        ): AudienceBuilderParametricPredicateNode[] => {
          return features.map((p) => {
            const parameters: { [key: string]: any } = {};
            p.variables.forEach((v) => {
              const parameterName = v.parameter_name;
              parameters[parameterName] = '';
            });

            return {
              type: 'PARAMETRIC_PREDICATE',
              parametric_predicate_id: p.id,
              parameters: parameters,
            };
          });
        };

        Promise.all(demographicsFeatures).then((resp) => {
          const defaultFeatures = resp.map((r) => {
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
                    expressions: setUpPredicates(defaultFeatures),
                  },
                ],
              },
            },
            newFormData: {
              include: [
                {
                  expressions: setUpPredicates(defaultFeatures),
                },
              ],
              exclude: [],
            },
          });
        });
      } else {
        this.setState({
          selectedAudienceBuilder: audienceBuilder,
          newFormData: NEW_INITIAL_AUDIENCE_BUILDER_FORM_DATA,
          formData: INITIAL_AUDIENCE_BUILDER_FORM_DATA,
        });
      }
    } else {
      this.setState({
        selectedAudienceBuilder: undefined,
      });
    }
  };

  audienceBuilderActionbar = (
    query: AudienceBuilderQueryDocument,
    datamartId: string,
  ) => {
    const { match, history } = this.props;
    const { selectedAudienceBuilder } = this.state;
    const saveAudience = (userQueryFormData: NewUserQuerySimpleFormData) => {
      const { name, technical_name, persisted } = userQueryFormData;

      return this._queryService
        .createQuery(datamartId, {
          query_language: 'JSON_OTQL',
          query_text: JSON.stringify(query),
        })
        .then((res) => {
          const userQuerySegment: Partial<UserQuerySegment> = {
            datamart_id: datamartId,
            type: 'USER_QUERY',
            name,
            technical_name,
            persisted,
            default_ttl: calculateDefaultTtl(userQueryFormData),
            query_id: res.data.id,
            segment_editor: 'AUDIENCE_BUILDER',
            audience_builder_id: selectedAudienceBuilder?.id,
          };
          return this._audienceSegmentService.saveSegment(
            match.params.organisationId,
            userQuerySegment,
          );
        })
        .then((res) => {
          history.push(
            `/v2/o/${match.params.organisationId}/audience/segments/${res.data.id}`,
          );
        });
    };

    return (
      <AudienceBuilderActionbar
        save={saveAudience}
        audienceBuilder={selectedAudienceBuilder}
      />
    );
  };

  selectBuilderContainer(audienceBuilder: AudienceBuilderResource) {
    const { hasFeature } = this.props;

    const { formData, newFormData } = this.state;

    if (hasFeature('audience-builder-new_design')) {
      return (
        <NewAudienceBuilderContainer
          initialValues={newFormData}
          audienceBuilder={audienceBuilder}
          renderActionBar={this.audienceBuilderActionbar}
        />
      );
    } else {
      return (
        <AudienceBuilderContainer
          initialValues={formData}
          audienceBuilder={audienceBuilder}
          renderActionBar={this.audienceBuilderActionbar}
        />
      );
    }
  }

  render() {
    const {
      intl,
      workspace: { datamarts },
    } = this.props;
    const {
      selectedAudienceBuilder,
      audienceBuildersByDatamartId,
      isLoading,
    } = this.state;

    if (isLoading) {
      return <Loading isFullScreen={true} />;
    }

    return selectedAudienceBuilder ? (
      this.selectBuilderContainer(selectedAudienceBuilder)
    ) : (
      <AudienceBuilderSelector
        audienceBuildersByDatamartId={audienceBuildersByDatamartId}
        datamarts={datamarts}
        onSelect={this.selectAudienceBuilder}
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

export default compose(
  withRouter,
  injectIntl,
  injectFeatures,
  injectNotifications,
  injectWorkspace,
)(AudienceBuilderPage);
