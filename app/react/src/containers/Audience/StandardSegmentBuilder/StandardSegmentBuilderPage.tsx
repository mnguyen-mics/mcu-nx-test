import * as React from 'react';
import { Modal } from 'antd';
import _ from 'lodash';
import { compose } from 'recompose';
import queryString from 'query-string';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Loading } from '@mediarithmics-private/mcs-components-library';
import StandardSegmentBuilderContainer from './StandardSegmentBuilderContainer';
import {
  StandardSegmentBuilderFormData,
  StandardSegmentBuilderParametricPredicateNode,
  StandardSegmentBuilderQueryDocument,
  StandardSegmentBuilderResource,
  StandardSegmentBuilderParametricPredicateGroupNode,
} from '../../../models/standardSegmentBuilder/StandardSegmentBuilderResource';
import { UserQuerySegment } from '../../../models/audiencesegment/AudienceSegmentResource';
import { lazyInject } from '../../../config/inversify.config';
import { IStandardSegmentBuilderService } from '../../../services/StandardSegmentBuilderService';
import { TYPES } from '../../../constants/types';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { INITIAL_STANDARD_SEGMENT_BUILDER_FORM_DATA } from './constants';
import { IQueryService } from '../../../services/QueryService';
import { IAudienceFeatureService } from '../../../services/AudienceFeatureService';
import { IAudienceSegmentService } from '../../../services/AudienceSegmentService';
import { withRouter, RouteComponentProps } from 'react-router';
import { NewUserQuerySimpleFormData } from '../../QueryTool/SaveAs/NewUserQuerySegmentSimpleForm';
import StandardSegmentBuilderActionbar from './StandardSegmentBuilderActionbar';
import {
  AudienceSegmentFormData,
  calculateDefaultTtl,
  checkProcessingsAndSave,
  generateProcessingSelectionsTasks,
} from '../Segments/Edit/domain';
import { InjectedWorkspaceProps, injectWorkspace } from '../../Datamart';
import { AudienceFeatureResource } from '../../../models/audienceFeature';
import { ITagService } from '../../../services/TagService';
import { IAudienceSegmentFormService } from '../Segments/Edit/AudienceSegmentFormService';

interface State {
  selectedStandardSegmentBuilder?: StandardSegmentBuilderResource;
  formData: StandardSegmentBuilderFormData;
  isLoading: boolean;
}

type Props = InjectedIntlProps &
  InjectedNotificationProps &
  InjectedWorkspaceProps &
  RouteComponentProps<{ organisationId: string }>;

class StandardSegmentBuilderPage extends React.Component<Props, State> {
  @lazyInject(TYPES.IAudienceFeatureService)
  private _audienceFeatureService: IAudienceFeatureService;

  @lazyInject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;

  @lazyInject(TYPES.IAudienceSegmentFormService)
  private _audienceSegmentFormService: IAudienceSegmentFormService;

  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  @lazyInject(TYPES.IStandardSegmentBuilderService)
  private _standardSegmentBuilderService: IStandardSegmentBuilderService;

  @lazyInject(TYPES.ITagService)
  private _tagService: ITagService;

  constructor(props: Props) {
    super(props);

    this.state = {
      isLoading: true,
      formData: INITIAL_STANDARD_SEGMENT_BUILDER_FORM_DATA,
    };
  }

  componentDidMount() {
    const {
      location: { search },
    } = this.props;

    const standardSegmentBuilderId = queryString.parse(search).standardSegmentBuilderId as string;
    const datamartId = queryString.parse(search).datamartId as string;
    if (standardSegmentBuilderId) {
      this.setStandardSegmentBuilder(datamartId, standardSegmentBuilderId);
    }
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const {
      match: {
        params: { organisationId },
      },
      location: { search },
      history,
    } = this.props;
    const {
      match: {
        params: { organisationId: prevOrganisationId },
      },
      location: { search: prevSearch },
    } = prevProps;
    const standardSegmentBuilderId = queryString.parse(search).standardSegmentBuilderId as string;
    const datamartId = queryString.parse(search).datamartId as string;
    const prevStandardSegmentBuilderId = queryString.parse(prevSearch).standardSegmentBuilderId;
    const prevDatamartId = queryString.parse(prevSearch).datamartId;
    if (!standardSegmentBuilderId || !datamartId || organisationId !== prevOrganisationId) {
      history.push(`/v2/o/${organisationId}/audience/segment-builder-selector`);
    } else if (
      datamartId !== prevDatamartId ||
      standardSegmentBuilderId !== prevStandardSegmentBuilderId
    ) {
      this.setStandardSegmentBuilder(datamartId, standardSegmentBuilderId);
    }
  }

  setStandardSegmentBuilder = (datamartId: string, standardSegmentBuilderId: string) => {
    this._standardSegmentBuilderService
      .getStandardSegmentBuilder(datamartId, standardSegmentBuilderId)
      .then(res => {
        this.setState({
          selectedStandardSegmentBuilder: res.data,
        });
        return res.data;
      })
      .then(standardSegmentBuilder => {
        const demographicsFeaturePromises = standardSegmentBuilder.demographics_features_ids.map(
          id => {
            return this._audienceFeatureService.getAudienceFeature(datamartId, id);
          },
        );

        const setUpPredicate = (
          feature: AudienceFeatureResource,
        ): StandardSegmentBuilderParametricPredicateNode => {
          return {
            type: 'PARAMETRIC_PREDICATE',
            parametric_predicate_id: feature.id,
            parameters: {},
          };
        };

        const setUpDefaultPredicates = (
          features: AudienceFeatureResource[],
        ): StandardSegmentBuilderParametricPredicateGroupNode[] => {
          return features.map(feature => {
            return {
              expressions: [setUpPredicate(feature)],
            };
          });
        };

        Promise.all(demographicsFeaturePromises)
          .then(resp => {
            const defaultFeatures = resp.map(r => {
              return r.data;
            });

            this.setState({
              selectedStandardSegmentBuilder: standardSegmentBuilder,
              formData: {
                include: setUpDefaultPredicates(defaultFeatures),
                exclude: [],
              },
              isLoading: false,
            });
          })
          .catch(err => {
            this.setState({
              selectedStandardSegmentBuilder: standardSegmentBuilder,
              formData: INITIAL_STANDARD_SEGMENT_BUILDER_FORM_DATA,
              isLoading: false,
            });
            this.props.notifyError(err);
          });
      })
      .catch(error => {
        this.setState({
          isLoading: false,
        });
        this.props.notifyError(error);
      });
  };
  standardSegmentBuilderActionbar = (
    query: StandardSegmentBuilderQueryDocument,
    datamartId: string,
  ) => {
    const { match, history, intl, notifyError } = this.props;
    const { selectedStandardSegmentBuilder } = this.state;
    const saveAudienceSegment = (audienceSegmentFormData: AudienceSegmentFormData) => {
      const {
        audienceSegment: { name, technical_name, persisted },
        defaultLifetime,
        defaultLifetimeUnit,
      } = audienceSegmentFormData;

      return this._queryService
        .createQuery(datamartId, {
          query_language: 'JSON_OTQL',
          query_language_subtype: 'PARAMETRIC',
          query_text: JSON.stringify(query),
        })
        .then(res => {
          const userQuerySegment: Partial<UserQuerySegment> = {
            datamart_id: datamartId,
            type: 'USER_QUERY',
            name,
            technical_name,
            persisted,
            default_ttl: calculateDefaultTtl({
              defaultLifetimeUnit: defaultLifetimeUnit,
              defaultLifetime: defaultLifetime,
            }),
            query_id: res.data.id,
            segment_editor: 'AUDIENCE_BUILDER',
            audience_builder_id: selectedStandardSegmentBuilder?.id,
          };
          return this._audienceSegmentService.saveSegment(
            match.params.organisationId,
            userQuerySegment,
          );
        })
        .then(response => {
          if (!!response) {
            Promise.all([
              ...generateProcessingSelectionsTasks(
                response.data.id,
                audienceSegmentFormData,
                this._audienceSegmentFormService,
              ),
            ]);
          }
          return response;
        })
        .then(res => {
          this._tagService.sendEvent('create_segment', 'Segment Builder', 'Save Segment');
          history.push(`/v2/o/${match.params.organisationId}/audience/segments/${res.data.id}`);
        })
        .catch(err => {
          Modal.destroyAll();
          notifyError(err);
        });
    };

    const onSubmit = (userQueryFormData: NewUserQuerySimpleFormData) => {
      const { name, technical_name, persisted, ...rest } = userQueryFormData;
      const audienceSegmentFormData: AudienceSegmentFormData = {
        audienceSegment: {
          name: name,
          technical_name: technical_name,
          persisted: persisted,
        },
        ...rest,
      };
      checkProcessingsAndSave(audienceSegmentFormData, saveAudienceSegment, intl);
    };

    return (
      <StandardSegmentBuilderActionbar
        save={onSubmit}
        standardSegmentBuilder={selectedStandardSegmentBuilder}
      />
    );
  };

  selectBuilderContainer(standardSegmentBuilder: StandardSegmentBuilderResource) {
    const { formData } = this.state;

    return (
      <StandardSegmentBuilderContainer
        initialValues={formData}
        standardSegmentBuilder={standardSegmentBuilder}
        renderActionBar={this.standardSegmentBuilderActionbar}
      />
    );
  }

  render() {
    const { selectedStandardSegmentBuilder, isLoading } = this.state;

    if (isLoading) {
      return <Loading isFullScreen={true} />;
    }

    return selectedStandardSegmentBuilder
      ? this.selectBuilderContainer(selectedStandardSegmentBuilder)
      : null;
  }
}

export default compose(
  withRouter,
  injectIntl,
  injectNotifications,
  injectWorkspace,
)(StandardSegmentBuilderPage);
