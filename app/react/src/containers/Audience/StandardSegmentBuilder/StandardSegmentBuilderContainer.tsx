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
  StandardSegmentBuilderFormData,
  StandardSegmentBuilderQueryDocument,
  StandardSegmentBuilderResource,
  StandardSegmentBuilderParametricPredicateNode,
  isStandardSegmentBuilderParametricPredicateNode,
  StandardSegmentBuilderParametricPredicateGroupNode,
} from '../../../models/standardSegmentBuilder/StandardSegmentBuilderResource';
import StandardSegmentBuilderDashboard from './StandardSegmentBuilderDashboard';
import QueryFragmentFormSection, {
  QueryFragmentFormSectionProps,
} from './QueryFragmentBuilders/QueryFragmentFormSection';
import { MicsReduxState } from '../../../utils/ReduxHelper';
import { OTQLResult } from '../../../models/datamart/graphdb/OTQLResult';
import { lazyInject } from '../../../config/inversify.config';
import { TYPES } from '../../../constants/types';
import { IRuntimeSchemaService } from '../../../services/RuntimeSchemaService';
import { ObjectLikeTypeInfoResource } from '../../../models/datamart/graphdb/RuntimeSchema';
import { McsIcon, Button, Loading } from '@mediarithmics-private/mcs-components-library';
import { IAudienceFeatureService } from '../../../services/AudienceFeatureService';
import { IStandardSegmentBuilderQueryService } from './StandardSegmentBuilderQueryService';
import { AudienceFeatureResource } from '../../../models/audienceFeature';
import injectNotifications, {
  InjectedNotificationProps,
} from '../../Notifications/injectNotifications';
import AudienceFeatureSelector, {
  AudienceFeatureSelectorProps,
} from './QueryFragmentBuilders/AudienceFeatureSelector';

import injectDrawer, { InjectedDrawerProps } from '../../../components/Drawer/injectDrawer';

export const QueryFragmentFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  QueryFragmentFormSectionProps
>;

export interface StandardSegmentBuilderContainerProps
  extends Omit<ConfigProps<StandardSegmentBuilderFormData>, 'form'> {
  standardSegmentBuilder: StandardSegmentBuilderResource;
  renderActionBar: (
    queryDocument: StandardSegmentBuilderQueryDocument,
    datamartId: string,
  ) => React.ReactNode;
}

interface MapStateToProps {
  formValues: StandardSegmentBuilderFormData;
}

type Props = InjectedFormProps<
  StandardSegmentBuilderFormData,
  StandardSegmentBuilderContainerProps
> &
  MapStateToProps &
  StandardSegmentBuilderContainerProps &
  InjectedNotificationProps &
  InjectedIntlProps &
  InjectedDrawerProps &
  RouteComponentProps<{ organisationId: string }>;

interface State {
  isLoadingObjectTypes: boolean;
  queryDocument?: StandardSegmentBuilderQueryDocument;
  objectTypes: ObjectLikeTypeInfoResource[];
  queryResult?: OTQLResult;
  isQueryRunning: boolean;
  isDashboardToggled: boolean;
  isMaskVisible: boolean;
  audienceFeatures?: AudienceFeatureResource[];
}

class StandardSegmentBuilderContainer extends React.Component<Props, State> {
  @lazyInject(TYPES.IRuntimeSchemaService)
  private _runtimeSchemaService: IRuntimeSchemaService;

  @lazyInject(TYPES.IAudienceFeatureService)
  private _audienceFeatureService: IAudienceFeatureService;

  @lazyInject(TYPES.IStandardSegmentBuilderQueryService)
  private _standardSegmentBuilderQueryService: IStandardSegmentBuilderQueryService;

  // ----------------------------------
  // Component setup

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
    const { standardSegmentBuilder, formValues } = this.props;

    this.runQuery();

    this._runtimeSchemaService
      .getRuntimeSchemas(standardSegmentBuilder.datamart_id)
      .then(schemaRes => {
        const liveSchema = schemaRes.data.find(s => s.status === 'LIVE');
        if (!liveSchema) return;
        return this._runtimeSchemaService
          .getObjectTypeInfoResources(standardSegmentBuilder.datamart_id, liveSchema.id)
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
        if (isStandardSegmentBuilderParametricPredicateNode(exp)) {
          audienceFeatureIds.push(exp.parametric_predicate_id);
        }
      });
    });

    const promises = audienceFeatureIds.map(id => {
      return this._audienceFeatureService.getAudienceFeature(
        standardSegmentBuilder.datamart_id,
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

  // ----------------------------------
  // Utilities

  private runQuery = () => {
    const { standardSegmentBuilder, formValues } = this.props;

    const queryDocument = this._standardSegmentBuilderQueryService.buildQueryDocument(formValues);

    this.setState({
      isQueryRunning: true,
      isMaskVisible: false,
      queryDocument: queryDocument,
    });

    const success = (result: OTQLResult) => {
      this.setState({
        queryResult: result,
        isQueryRunning: false,
      });
    };

    const failure = (err: any) => {
      this.setState({
        isQueryRunning: false,
      });
      this.props.notifyError(err);
    };

    this._standardSegmentBuilderQueryService.runQuery(
      standardSegmentBuilder.datamart_id,
      queryDocument,
      success,
      failure,
    );
  };

  private saveGroup = (
    groups: StandardSegmentBuilderParametricPredicateGroupNode[],
    groupsLocation: 'include' | 'exclude',
  ) => (newGroup: StandardSegmentBuilderParametricPredicateGroupNode) => {
    const { change } = this.props;
    change(groupsLocation, groups.concat(newGroup));
  };

  private addToNewGroup = (
    save: (_: StandardSegmentBuilderParametricPredicateGroupNode) => void,
  ) => (predicate: StandardSegmentBuilderParametricPredicateNode) => {
    const newGroup: StandardSegmentBuilderParametricPredicateGroupNode = {
      expressions: [predicate],
    };
    save(newGroup);
  };

  private addAudienceFeature = (
    processPredicate: (_: StandardSegmentBuilderParametricPredicateNode) => void,
  ) => (audienceFeatures: AudienceFeatureResource[], finalValue?: string) => {
    const { closeNextDrawer } = this.props;

    const newParametricPredicate = (
      audienceFeature: AudienceFeatureResource,
    ): StandardSegmentBuilderParametricPredicateNode => {

      const generateParameters = () => {
        let parameters: { [key: string]: string | string[] | number | number[] | undefined } = {};

        if (audienceFeature.variables) {
          audienceFeature.variables.forEach(v => {

            if (finalValue && v.final_values?.includes(finalValue)) {
              const insertFinalValue = (typeList: boolean) => {
                switch (v.type) {
                  case 'Int':
                  case 'Float':
                  case 'ID':
                    parameters[v.parameter_name] = typeList ? [parseInt(finalValue)] : parseInt(finalValue);
                    break;
                  default:
                    parameters[v.parameter_name] = typeList ? [finalValue] : finalValue;
                    break;
                }
              }
              if (v.container_type === 'List') {
                insertFinalValue(true)
              } else {
                insertFinalValue(false)
              }
            } else {
              parameters[v.parameter_name] = undefined;
            }
          });
        }
        return parameters;
      }
      return {
        type: 'PARAMETRIC_PREDICATE',
        parametric_predicate_id: audienceFeature.id,
        parameters: generateParameters(),
      };
    };

    if (audienceFeatures[0]) {
      const predicate = newParametricPredicate(audienceFeatures[0]);
      processPredicate(predicate);

      // TODO put in processPredicate ?
      this.setState({
        audienceFeatures: this.state.audienceFeatures?.concat(audienceFeatures[0]),
      });

      closeNextDrawer();
    }
  };

  private selectNewAudienceFeature = (onSelect: (_: AudienceFeatureResource[], finalValue?: string) => void) => {
    const { openNextDrawer, standardSegmentBuilder } = this.props;

    const props: AudienceFeatureSelectorProps = {
      datamartId: standardSegmentBuilder.datamart_id,
      close: this.props.closeNextDrawer,
      save: onSelect,
    };

    openNextDrawer<AudienceFeatureSelectorProps>(AudienceFeatureSelector, {
      additionalProps: props,
    });
  };

  private selectAndAddFeature = (
    processPredicate: (_: StandardSegmentBuilderParametricPredicateNode) => void,
  ) => () => {
    this.selectNewAudienceFeature(this.addAudienceFeature(processPredicate));
  };

  private toggleDashboard = () => {
    this.setState({
      isDashboardToggled: !this.state.isDashboardToggled,
    });
    // Timeout is needed here otherwise graph resizing won't work
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 50);
  };

  // ----------------------------------
  // Rendering

  private renderQueryBuilderButtons = () => {
    const { formValues, intl } = this.props;

    return (
      <div className='mcs-standardSegmentBuilder_timelineButtons'>
        <Button
          className='mcs-timelineButton_left'
          onClick={this.selectAndAddFeature(
            this.addToNewGroup(this.saveGroup(formValues.include, 'include')),
          )}
        >
          {intl.formatMessage(messages.standardSegmentBuilderInclude)}
        </Button>

        {formValues.exclude.length === 0 && (
          <span>
            /
            <Button
              className='mcs-timelineButton_right'
              onClick={this.selectAndAddFeature(
                this.addToNewGroup(this.saveGroup(formValues.exclude, 'exclude')),
              )}
            >
              {intl.formatMessage(messages.standardSegmentBuilderExclude)}
            </Button>
          </span>
        )}
      </div>
    );
  };

  private renderQueryFragmentForm = () => {
    const genericFieldArrayProps = {
      rerenderOnEveryChange: true,
    };

    const { objectTypes, audienceFeatures } = this.state;

    const { standardSegmentBuilder, change } = this.props;

    return (
      <div>
        {/* Include Timeline */}
        <QueryFragmentFieldArray
          name={`include`}
          timelineConfiguration={{
            titlePart1: messages.standardSegmentBuilderTimelineMatchingCriterias1,
            titlePart2: messages.standardSegmentBuilderTimelineMatchingCriterias2,
            initialDotColor: 'mcs-timeline_initialDot_color1',
            actionDotColor: 'mcs-timeline_actionDot_color1',
          }}
          component={QueryFragmentFormSection}
          datamartId={standardSegmentBuilder.datamart_id}
          selectAndAddFeature={this.selectAndAddFeature}
          change={change}
          audienceFeatures={audienceFeatures}
          objectTypes={objectTypes}
          {...genericFieldArrayProps}
        />
        {/* Include / Exclude Buttons */}
        {this.renderQueryBuilderButtons()}
        {/* Exclude Timeline */}
        <QueryFragmentFieldArray
          name={`exclude`}
          timelineConfiguration={{
            titlePart1: messages.standardSegmentBuilderTimelineExcludingCriterias1,
            titlePart2: messages.standardSegmentBuilderTimelineExcludingCriterias2,
            initialDotColor: 'mcs-timeline_initialDot_color2',
            actionDotColor: 'mcs-timeline_actionDot_color2',
          }}
          component={QueryFragmentFormSection}
          change={change}
          datamartId={standardSegmentBuilder.datamart_id}
          selectAndAddFeature={this.selectAndAddFeature}
          audienceFeatures={audienceFeatures}
          objectTypes={objectTypes}
          {...genericFieldArrayProps}
        />
      </div>
    );
  };

  render() {
    const {
      renderActionBar,
      formValues,
      match: {
        params: { organisationId },
      },
      intl,
      standardSegmentBuilder,
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

    const queryFragmentForm = !isLoadingObjectTypes ? (
      this.renderQueryFragmentForm()
    ) : (
      <Loading className='m-t-40' isFullScreen={true} />
    );

    return (
      <React.Fragment>
        {renderActionBar(
          {
            operations: [{ directives: [], selections: [{ name: 'id' }] }],
            from: 'UserPoint',
            where: this._standardSegmentBuilderQueryService.buildQueryDocument(formValues)?.where,
          },
          standardSegmentBuilder.datamart_id,
        )}

        <Layout>
          <Row className='ant-layout-content mcs-standardSegmentBuilder_container'>
            <Col span={isDashboardToggled ? 1 : 12}>
              <div className={`${isDashboardToggled && 'mcs-standardSegmentBuilder_hiddenForm'}`}>
                {queryFragmentForm}
              </div>
            </Col>

            <Col
              span={isDashboardToggled ? 23 : 12}
              className='mcs-standardSegmentBuilder_liveDashboardContainer'
            >
              <Button
                className={`mcs-standardSegmentBuilder_sizeButton ${isDashboardToggled && 'mcs-standardSegmentBuilder_rightChevron'
                  }`}
                onClick={this.toggleDashboard}
              >
                <McsIcon type='chevron-right' />
              </Button>
              {!!isMaskVisible && (
                <div className='mcs-standardSegmentBuilder_liveDashboardMask'>
                  <Button
                    onClick={this.runQuery}
                    className='mcs-standardSegmentBuilder_dashboard_refresh_button'
                  >
                    {intl.formatMessage(messages.refreshMessage)}
                  </Button>
                </div>
              )}
              <StandardSegmentBuilderDashboard
                organisationId={organisationId}
                datamartId={standardSegmentBuilder.datamart_id}
                standardSegmentBuilderId={standardSegmentBuilder.id}
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

export default compose<Props, StandardSegmentBuilderContainerProps>(
  injectIntl,
  withRouter,
  injectNotifications,
  injectDrawer,
  reduxForm<StandardSegmentBuilderFormData, StandardSegmentBuilderContainerProps>({
    form: NEW_FORM_ID,
    enableReinitialize: true,
  }),
  connect(mapStateToProps),
)(StandardSegmentBuilderContainer);
