import * as React from 'react';
import _ from 'lodash';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { RouteComponentProps, withRouter } from 'react-router';
import { Layout, Col, Row } from 'antd';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import {
  reduxForm,
  ConfigProps,
  FieldArray,
  GenericFieldArray,
  Field,
  InjectedFormProps,
  getFormValues,
} from 'redux-form';
import { FORM_ID, buildQueryDocument, messages } from './constants';
import { Omit } from '../../../utils/Types';
import {
  AudienceBuilderFormData,
  QueryDocument as AudienceBuilderQueryDocument,
  AudienceBuilderGroupNode,
  isAudienceBuilderParametricPredicateNode,
  AudienceBuilderResource,
} from '../../../models/audienceBuilder/AudienceBuilderResource';
import AudienceBuilderDashboard from './AudienceBuilderDashboard';
import QueryFragmentFormSection, {
  QueryFragmentFormSectionProps,
} from './QueryFragmentBuilders/QueryFragmentFormSection';
import { MicsReduxState } from '../../../utils/ReduxHelper';
import { OTQLResult } from '../../../models/datamart/graphdb/OTQLResult';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IRuntimeSchemaService } from '../../../services/RuntimeSchemaService';
import { IQueryService } from '../../../services/QueryService';
import { ObjectLikeTypeInfoResource } from '../../../models/datamart/graphdb/RuntimeSchema';
import { QueryDocument as GraphDbQueryDocument } from '../../../models/datamart/graphdb/QueryDocument';
import {
  McsIcon,
  Button,
  Loading,
} from '@mediarithmics-private/mcs-components-library';
import { IAudienceFeatureService } from '../../../services/AudienceFeatureService';
import { AudienceFeatureResource } from '../../../models/audienceFeature';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';

export const QueryFragmentFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  QueryFragmentFormSectionProps
>;

export interface AudienceBuilderContainerProps
  extends Omit<ConfigProps<AudienceBuilderFormData>, 'form'> {
  audienceBuilder: AudienceBuilderResource;
  renderActionBar: (
    queryDocument: AudienceBuilderQueryDocument,
    datamartId: string,
  ) => React.ReactNode;
}

interface MapStateToProps {
  formValues: AudienceBuilderFormData;
}

type Props = InjectedFormProps<
  AudienceBuilderFormData,
  AudienceBuilderContainerProps
> &
  MapStateToProps &
  AudienceBuilderContainerProps &
  InjectedNotificationProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

interface State {
  isLoadingObjectTypes: boolean;
  queryDocument?: GraphDbQueryDocument;
  objectTypes: ObjectLikeTypeInfoResource[];
  queryResult?: OTQLResult;
  isQueryRunning: boolean;
  isDashboardToggled: boolean;
  isMaskVisible: boolean;
  audienceFeatures?: AudienceFeatureResource[];
}

class AudienceBuilderContainer extends React.Component<Props, State> {
  @lazyInject(TYPES.IRuntimeSchemaService)
  private _runtimeSchemaService: IRuntimeSchemaService;

  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  @lazyInject(TYPES.IAudienceFeatureService)
  private _audienceFeatureService: IAudienceFeatureService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoadingObjectTypes: true,
      objectTypes: [],
      isQueryRunning: false,
      isDashboardToggled: false,
      isMaskVisible: false,
    };
  }

  componentDidMount() {
    const { audienceBuilder, formValues } = this.props;
    this.runQuery(formValues);

    this._runtimeSchemaService
      .getRuntimeSchemas(audienceBuilder.datamart_id)
      .then(schemaRes => {
        const liveSchema = schemaRes.data.find(s => s.status === 'LIVE');
        if (!liveSchema) return;
        return this._runtimeSchemaService
          .getObjectTypeInfoResources(
            audienceBuilder.datamart_id,
            liveSchema.id,
          )
          .then(objectTypes => {
            this.setState({
              objectTypes: objectTypes,
              isLoadingObjectTypes: false,
            });
          });
      });
    const audienceFeatureIds: string[] = [];
    formValues.where.expressions.forEach(exp => {
      (exp as AudienceBuilderGroupNode).expressions.forEach(e => {
        if (isAudienceBuilderParametricPredicateNode(e)) {
          audienceFeatureIds.push(e.parametric_predicate_id);
        }
      });
    });
    const promises = audienceFeatureIds.map(id => {
      return this._audienceFeatureService.getAudienceFeature(
        audienceBuilder.datamart_id,
        id,
      );
    });

    Promise.all(promises).then(res => {
      const audienceFeatures = res.map(r => r.data);
      this.setState({
        audienceFeatures,
      });
    });
  }

  componentDidUpdate(prevProps: Props) {
    const { formValues } = this.props;
    // Todo: don't display mask if empty expression node is added/deleted
    if (!_.isEqual(formValues, prevProps.formValues)) {
      this.setState({
        isMaskVisible: true,
      });
    }
  }

  runQuery = (formData: AudienceBuilderFormData) => {
    const { audienceBuilder } = this.props;
    this.setState({
      isQueryRunning: true,
      isMaskVisible: false,
    });
    const queryDocument = buildQueryDocument(formData);
    this._queryService
      .runJSONOTQLQuery(audienceBuilder.datamart_id, queryDocument)
      .then(queryResult => {
        this.setState({
          queryResult: queryResult.data,
          isQueryRunning: false,
          queryDocument: queryDocument,
        });
      })
      .catch(err => {
        this.setState({
          isQueryRunning: false,
        });
        this.props.notifyError(err);
      });
  };

  toggleDashboard = () => {
    this.setState({
      isDashboardToggled: !this.state.isDashboardToggled,
    });
    // Timeout is needed here otherwise graph resizing won't work
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 50);
  };

  refreshDashboard = () => {
    const { formValues } = this.props;
    this.runQuery(formValues);
  };

  render() {
    const {
      renderActionBar,
      formValues,
      match: {
        params: { organisationId },
      },
      intl,
      audienceBuilder,
      change,
    } = this.props;

    const {
      objectTypes,
      queryResult,
      isQueryRunning,
      queryDocument,
      isDashboardToggled,
      isMaskVisible,
      isLoadingObjectTypes,
      audienceFeatures,
    } = this.state;

    const genericFieldArrayProps = {
      rerenderOnEveryChange: true,
    };

    return (
      <React.Fragment>
        {renderActionBar(
          {
            operations: [{ directives: [], selections: [{ name: 'id' }] }],
            from: 'UserPoint',
            where: formValues.where,
          },
          audienceBuilder.datamart_id,
        )}
        <Layout>
          <Row className="ant-layout-content mcs-audienceBuilder_container">
            <Col span={isDashboardToggled ? 1 : 12}>
              <div
                className={`${isDashboardToggled &&
                  'mcs-audienceBuilder_hiddenForm'}`}
              >
                {!isLoadingObjectTypes ? (
                  <QueryFragmentFieldArray
                    name={`where.expressions`}
                    component={QueryFragmentFormSection}
                    datamartId={audienceBuilder.datamart_id}
                    formChange={change}
                    demographicsFeaturesIds={
                      audienceBuilder.demographics_features_ids
                    }
                    audienceFeatures={audienceFeatures}
                    objectTypes={objectTypes}
                    {...genericFieldArrayProps}
                  />
                ) : (
                  <Loading className="m-t-40" isFullScreen={true} />
                )}
              </div>
            </Col>
            <Col
              span={isDashboardToggled ? 23 : 12}
              className="mcs-audienceBuilder_liveDashboardContainer"
            >
              <Button
                className={`mcs-audienceBuilder_sizeButton ${isDashboardToggled &&
                  'mcs-audienceBuilder_rightChevron'}`}
                onClick={this.toggleDashboard}
              >
                <McsIcon type="chevron-right" />
              </Button>
              {!!isMaskVisible && (
                <div className="mcs-audienceBuilder_liveDashboardMask">
                  <Button onClick={this.refreshDashboard} className="mcs-audienceBuilder_dashboard_refresh_button">
                    {intl.formatMessage(messages.refreshMessage)}
                  </Button>
                </div>
              )}
              <AudienceBuilderDashboard
                organisationId={organisationId}
                datamartId={audienceBuilder.datamart_id}
                audienceBuilderId={audienceBuilder.id}
                totalAudience={queryResult && queryResult.rows[0].count}
                isQueryRunning={isQueryRunning}
                queryDocument={queryDocument}
              />
            </Col>
          </Row>
        </Layout>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  formValues: getFormValues(FORM_ID)(state),
});

export default compose<Props, AudienceBuilderContainerProps>(
  injectIntl,
  withRouter,
  injectNotifications,
  reduxForm<AudienceBuilderFormData, AudienceBuilderContainerProps>({
    form: FORM_ID,
    enableReinitialize: true,
  }),
  connect(mapStateToProps),
)(AudienceBuilderContainer);
