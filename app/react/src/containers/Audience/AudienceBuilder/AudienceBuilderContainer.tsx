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
  isAudienceBuilderGroupNode,
  QueryDocument as AudienceBuilderQueryDocument,
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
import { McsIcon, Button } from '@mediarithmics-private/mcs-components-library';

export const QueryFragmentFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  QueryFragmentFormSectionProps
>;

export interface AudienceBuilderContainerProps
  extends Omit<ConfigProps<AudienceBuilderFormData>, 'form'> {
  demographicsFeaturesIds: string[];
  renderActionBar: (
    queryDocument: AudienceBuilderQueryDocument,
    datamartId: string,
  ) => React.ReactNode;
  datamartId: string;
  audienceBuilderId: string;
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
}

class AudienceBuilderContainer extends React.Component<Props, State> {
  @lazyInject(TYPES.IRuntimeSchemaService)
  private _runtimeSchemaService: IRuntimeSchemaService;

  @lazyInject(TYPES.IQueryService)
  private _queryService: IQueryService;

  constructor(props: Props) {
    super(props);
    this.state = {
      isLoadingObjectTypes: false,
      objectTypes: [],
      isQueryRunning: false,
      isDashboardToggled: false,
      isMaskVisible: false,
    };
  }

  componentDidMount() {
    const { datamartId, formValues } = this.props;
    this.setState({
      isLoadingObjectTypes: true,
    });
    this.runQuery(formValues);

    this._runtimeSchemaService.getRuntimeSchemas(datamartId).then(schemaRes => {
      const liveSchema = schemaRes.data.find(s => s.status === 'LIVE');
      if (!liveSchema) return;
      return this._runtimeSchemaService
        .getObjectTypeInfoResources(datamartId, liveSchema.id)
        .then(objectTypes => {
          this.setState({
            objectTypes: objectTypes,
          });
        });
    });
  }

  componentDidUpdate(prevProps: Props) {
    const { formValues } = this.props;
    const lastExpression =
      formValues.where.expressions[formValues.where.expressions.length - 1];
    if (
      !_.isEqual(formValues, prevProps.formValues) &&
      lastExpression &&
      isAudienceBuilderGroupNode(lastExpression) &&
      !!lastExpression.expressions.length
    ) {
      this.setState({
        isMaskVisible: true,
      });
    }
  }

  runQuery = (formData: AudienceBuilderFormData) => {
    const { datamartId } = this.props;
    this.setState({
      isQueryRunning: true,
      isMaskVisible: false,
    });
    const queryDocument = buildQueryDocument(formData);
    this._queryService
      .runJSONOTQLQuery(datamartId, queryDocument)
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
      datamartId,
      renderActionBar,
      formValues,
      demographicsFeaturesIds,
      match: {
        params: { organisationId },
      },
      intl,
      audienceBuilderId,
    } = this.props;

    const {
      objectTypes,
      queryResult,
      isQueryRunning,
      queryDocument,
      isDashboardToggled,
      isMaskVisible,
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
          datamartId,
        )}
        <Layout>
          <Row className="ant-layout-content mcs-audienceBuilder_container">
            <Col span={isDashboardToggled ? 1 : 12}>
              <div
                className={`${isDashboardToggled &&
                  'mcs-audienceBuilder_hiddenForm'}`}
              >
                <QueryFragmentFieldArray
                  name={`where.expressions`}
                  component={QueryFragmentFormSection}
                  datamartId={datamartId}
                  demographicsFeaturesIds={demographicsFeaturesIds}
                  objectTypes={objectTypes}
                  {...genericFieldArrayProps}
                />
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
                <React.Fragment>
                  <div className="mcs-audienceBuilder_liveDashboardMask">
                    <Button onClick={this.refreshDashboard}>
                      {intl.formatMessage(messages.refreshMessage)}
                    </Button>
                  </div>
                </React.Fragment>
              )}
              <AudienceBuilderDashboard
                organisationId={organisationId}
                datamartId={datamartId}
                audienceBuilderId={audienceBuilderId}
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
  reduxForm<AudienceBuilderFormData, AudienceBuilderContainerProps>({
    form: FORM_ID,
    enableReinitialize: true,
  }),
  connect(mapStateToProps),
)(AudienceBuilderContainer);
