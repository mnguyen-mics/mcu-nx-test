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
import { NEW_FORM_ID, messages } from './constants';
import { Omit } from '../../../utils/Types';
import {
  NewAudienceBuilderFormData,
  QueryDocument as AudienceBuilderQueryDocument,
  AudienceBuilderResource
} from '../../../models/audienceBuilder/AudienceBuilderResource';
import AudienceBuilderDashboard from './AudienceBuilderDashboard';
import NewQueryFragmentFormSection, {
  NewQueryFragmentFormSectionProps,
} from './QueryFragmentBuilders/NewQueryFragmentFormSection';
import { MicsReduxState } from '../../../utils/ReduxHelper';
import { OTQLResult } from '../../../models/datamart/graphdb/OTQLResult';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IRuntimeSchemaService } from '../../../services/RuntimeSchemaService';
import { ObjectLikeTypeInfoResource } from '../../../models/datamart/graphdb/RuntimeSchema';
import { QueryDocument as GraphDbQueryDocument } from '../../../models/datamart/graphdb/QueryDocument';
import {
  McsIcon,
  Button,
  Loading,
} from '@mediarithmics-private/mcs-components-library';
import { IAudienceFeatureService } from '../../../services/AudienceFeatureService';
import { IAudienceBuilderQueryService } from './AudienceBuilderQueryService';
import { AudienceFeatureResource } from '../../../models/audienceFeature';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import { injectFeatures, InjectedFeaturesProps } from '../../Features';
import {
  AudienceBuilderParametricPredicateGroupNode,
  AudienceBuilderParametricPredicateNode,
} from '../../../models/audienceBuilder/AudienceBuilderResource';
import AudienceFeatureSelector, {
  AudienceFeatureSelectorProps,
} from './QueryFragmentBuilders/AudienceFeatureSelector';
import NewAudienceFeatureSelector, {
  NewAudienceFeatureSelectorProps,
} from './QueryFragmentBuilders/NewAudienceFeatureSelector';

import injectDrawer, {
  InjectedDrawerProps,
} from '../../../components/Drawer/injectDrawer';


export const QueryFragmentFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  NewQueryFragmentFormSectionProps
>;

export interface NewAudienceBuilderContainerProps
  extends Omit<ConfigProps<NewAudienceBuilderFormData>, 'form'> {
  audienceBuilder: AudienceBuilderResource;
  renderActionBar: (
    queryDocument: AudienceBuilderQueryDocument,
    datamartId: string,
  ) => React.ReactNode;
}

interface MapStateToProps {
  formValues: NewAudienceBuilderFormData;
}

type Props = InjectedFormProps<
  NewAudienceBuilderFormData,
  NewAudienceBuilderContainerProps
> &
  MapStateToProps &
  NewAudienceBuilderContainerProps &
  InjectedNotificationProps &
  InjectedFeaturesProps &
  InjectedIntlProps &
  InjectedDrawerProps &
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

class NewAudienceBuilderContainer extends React.Component<Props, State> {
  @lazyInject(TYPES.IRuntimeSchemaService)
  private _runtimeSchemaService: IRuntimeSchemaService;

  @lazyInject(TYPES.IAudienceFeatureService)
  private _audienceFeatureService: IAudienceFeatureService;

  @lazyInject(TYPES.IAudienceBuilderQueryService)
  private _audienceBuilderQueryService: IAudienceBuilderQueryService;

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

  runQuery = () => {
    const { audienceBuilder, formValues } = this.props;

    this.setState({
      isQueryRunning: true,
      isMaskVisible: false,
    });

    const success = (
      queryDocument: GraphDbQueryDocument,
      result: OTQLResult
    ) => {
      this.setState({
        queryResult: result,
        isQueryRunning: false,
        queryDocument: queryDocument,
      });
    }

    const failure = (err: any) => {
      this.setState({
        isQueryRunning: false,
      });
      this.props.notifyError(err);
    }

    this._audienceBuilderQueryService.runQuery(audienceBuilder.datamart_id, formValues, success, failure);
  }

  componentDidMount() {
    const { audienceBuilder, formValues } = this.props;

    this.runQuery();

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
    formValues.include.concat(formValues.exclude).forEach(group => {
      group.expressions.forEach(exp => {
        audienceFeatureIds.push(exp.parametric_predicate_id);
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

  toggleDashboard = () => {
    this.setState({
      isDashboardToggled: !this.state.isDashboardToggled,
    });
    // Timeout is needed here otherwise graph resizing won't work
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 50);
  };

  saveGroup =
    (groups: AudienceBuilderParametricPredicateGroupNode[],
      groupsLocation: string) =>
      (newGroup: AudienceBuilderParametricPredicateGroupNode) => {
        const {
          change,
        } = this.props;

        change(groupsLocation, groups.concat(newGroup));
      }

  addToNewGroup =
    (save: (_: AudienceBuilderParametricPredicateGroupNode) => void) =>
      (predicate: AudienceBuilderParametricPredicateNode) => {

        let newGroup: AudienceBuilderParametricPredicateGroupNode = {
          type: 'GROUP',
          boolean_operator: 'OR',
          negation: false,
          expressions: [predicate],
        };

        save(newGroup)
      }

  addAudienceFeature =
    (processPredicate: (_: AudienceBuilderParametricPredicateNode) => void) =>
      (audienceFeatures: AudienceFeatureResource[]) => {
        const { closeNextDrawer } = this.props;

        let newParametricPredicate =
          (audienceFeature: AudienceFeatureResource): AudienceBuilderParametricPredicateNode => {
            const parameters: { [key: string]: string[] | undefined } = {};

            audienceFeature.variables.forEach(v => {
              parameters[v.field_name] = undefined;
            });

            return {
              type: 'PARAMETRIC_PREDICATE',
              parametric_predicate_id: audienceFeature.id,
              parameters: parameters,
            };
          };

        if (audienceFeatures[0]) {
          const predicate = newParametricPredicate(audienceFeatures[0])
          processPredicate(predicate)

          // TODO put in processPredicate ?
          this.setState({
            audienceFeatures: this.state.audienceFeatures?.concat(
              audienceFeatures[0],
            ),
          });

          closeNextDrawer();
        }
      };

  selectNewAudienceFeature =
    (onSelect: (_: AudienceFeatureResource[]) => void) => {
      const {
        openNextDrawer,
        audienceBuilder,
        hasFeature,
      } = this.props;

      const props: AudienceFeatureSelectorProps = {
        datamartId: audienceBuilder.datamart_id,
        close: this.props.closeNextDrawer,
        save: onSelect,
        demographicIds:
          audienceBuilder.demographics_features_ids.length >= 1
            ? audienceBuilder.demographics_features_ids
            : undefined,
      };

      hasFeature('new-audienceFeatureSelector')
        ? openNextDrawer<NewAudienceFeatureSelectorProps>(NewAudienceFeatureSelector, {
          additionalProps: props,
        })
        : openNextDrawer<AudienceFeatureSelectorProps>(AudienceFeatureSelector, {
          additionalProps: props,
        });
    };

  selectAndAddFeature =
    (processPredicate: (_: AudienceBuilderParametricPredicateNode) => void) =>
      () => {
        console.log("Select and add");
        this.selectNewAudienceFeature(
          this.addAudienceFeature(
            processPredicate
          )
        )
      }

  renderQueryBuilderButtons = () => {
    const {
      formValues
    } = this.props;

    return (
      <div className="mcs-audienceBuilder_queryGroupButtons">
        <Button
          className="mcs-queryGroupButton-left"
          onClick={
            this.selectAndAddFeature(
              this.addToNewGroup(
                this.saveGroup(
                  formValues.include,
                  'include'
                )
              )
            )
          }
        >
          Include
        </Button>
        /
        <Button
          className="mcs-queryGroupButton-right"
          onClick={
            this.selectAndAddFeature(
              this.addToNewGroup(
                this.saveGroup(
                  formValues.exclude,
                  'exclude'
                )
              )
            )
          }
        >
          Exclude
        </Button>
      </div>
    );
  };

  renderQueryFragmentForm = () => {
    const genericFieldArrayProps = {
      rerenderOnEveryChange: true,
    };

    const {
      objectTypes,
      audienceFeatures,
    } = this.state;

    const {
      audienceBuilder,
      change
    } = this.props;

    return (
      <div>
        {/* Include Timeline */}
        <QueryFragmentFieldArray
          name={`include`}
          component={NewQueryFragmentFormSection}
          datamartId={audienceBuilder.datamart_id}
          selectAndAddFeature={this.selectAndAddFeature}
          change={change}
          demographicsFeaturesIds={
            audienceBuilder.demographics_features_ids
          }
          audienceFeatures={audienceFeatures}
          objectTypes={objectTypes}
          {...genericFieldArrayProps}
        />
        {/* Include / Exclude Buttons */}
        {this.renderQueryBuilderButtons()}
        {/* Exclude Timeline */}
        <QueryFragmentFieldArray
          name={`exclude`}
          component={NewQueryFragmentFormSection}
          datamartId={audienceBuilder.datamart_id}
          selectAndAddFeature={this.selectAndAddFeature}
          demographicsFeaturesIds={[]}
          audienceFeatures={audienceFeatures}
          objectTypes={objectTypes}
          {...genericFieldArrayProps}
        />
      </div>
    );
  }

  render() {
    const {
      renderActionBar,
      formValues,
      match: {
        params: { organisationId },
      },
      intl,
      audienceBuilder,
    } = this.props;

    const {
      queryResult,
      isQueryRunning,
      queryDocument,
      isDashboardToggled,
      isMaskVisible,
      isLoadingObjectTypes,
    } = this.state;

    /**
     * QueryFragmentForm selection
     */

    let queryFragmentForm = (!isLoadingObjectTypes) ?
      this.renderQueryFragmentForm() :
      <Loading className="m-t-40" isFullScreen={true} />

    return (
      <React.Fragment>
        {renderActionBar(
          {
            operations: [{ directives: [], selections: [{ name: 'id' }] }],
            from: 'UserPoint',
            where: this._audienceBuilderQueryService.buildObjectTreeExpression(formValues)?.where,
          },
          audienceBuilder.datamart_id,
        )}

        <Layout>
          <Row className="ant-layout-content mcs-audienceBuilder_container">
            <Col span={isDashboardToggled ? 1 : 12}>
              <div
                className={`${isDashboardToggled && 'mcs-audienceBuilder_hiddenForm'}`}
              >
                {queryFragmentForm}
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
                  <Button onClick={this.runQuery} className="mcs-audienceBuilder_dashboard_refresh_button">
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
  formValues: getFormValues(NEW_FORM_ID)(state),
});

export default compose<Props, NewAudienceBuilderContainerProps>(
  injectIntl,
  withRouter,
  injectNotifications,
  injectFeatures,
  injectDrawer,
  reduxForm<NewAudienceBuilderFormData, NewAudienceBuilderContainerProps>({
    form: NEW_FORM_ID,
    enableReinitialize: true,
  }),
  connect(mapStateToProps),
)(NewAudienceBuilderContainer);
