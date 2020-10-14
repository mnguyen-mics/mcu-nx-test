import * as React from 'react';
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
import { FORM_ID, buildQueryDocument } from './constants';
import { Omit } from '../../../utils/Types';
import {
  AudienceBuilderFormData,
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
    run: () => void,
  ) => React.ReactNode;
  datamartId: string;
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
    const { formValues, datamartId } = this.props;
    const { datamartId: prevDatamartId } = prevProps;
    if (datamartId !== prevDatamartId) {
      this.runQuery(formValues);
    }
  }

  runQuery = (formData: AudienceBuilderFormData) => {
    const { datamartId } = this.props;
    this.setState({
      isQueryRunning: true,
    });
    this._queryService
      .runJSONOTQLQuery(datamartId, buildQueryDocument(formData))
      .then(queryResult => {
        this.setState({
          queryResult: queryResult.data,
          isQueryRunning: false,
          queryDocument: buildQueryDocument(formData),
        });
      })
      .catch(err => {
        // this.props.notifyError(err);
        this.setState({
          isQueryRunning: false,
        });
      });
  };

  // This will be removed when backend will be able to handle List and Long

  render() {
    const {
      datamartId,
      renderActionBar,
      formValues,
      demographicsFeaturesIds,
      match: {
        params: { organisationId },
      },
    } = this.props;

    const {
      objectTypes,
      queryResult,
      isQueryRunning,
      queryDocument,
    } = this.state;

    const genericFieldArrayProps = {
      rerenderOnEveryChange: true,
    };

    return (
      <React.Fragment>
        <Layout>
          {renderActionBar(
            {
              operations: [{ directives: [], selections: [{ name: 'id' }] }],
              from: 'UserPoint',
              where: formValues.where,
            },
            datamartId,
            () => this.runQuery(formValues),
          )}
          <Row className="ant-layout-content mcs-audienceBuilder_container">
            <Col span={12}>
              <QueryFragmentFieldArray
                name={`where.expressions`}
                component={QueryFragmentFormSection}
                datamartId={datamartId}
                demographicsFeaturesIds={demographicsFeaturesIds}
                objectTypes={objectTypes}
                {...genericFieldArrayProps}
              />
            </Col>
            <Col
              span={12}
              className="mcs-audienceBuilder_liveDashboardContainer"
            >
              <AudienceBuilderDashboard
                organisationId={organisationId}
                datamartId={datamartId}
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
