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
import { FORM_ID } from './constants';
import { Omit } from '../../../utils/Types';
import { AudienceBuilderFormData } from '../../../models/audienceBuilder/AudienceBuilderResource';

import AudienceBuilderDashboard from './AudienceBuilderDashboard';
import AudienceBuilderActionbar from './AudienceBuilderActionbar';
import QueryFragmentFormSection, {
  QueryFragmentFormSectionProps,
} from './QueryFragmentBuilders/QueryFragmentFormSection';
import { MicsReduxState } from '../../../utils/ReduxHelper';
import { OTQLResult } from '../../../models/datamart/graphdb/OTQLResult';

export const QueryFragmentFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  QueryFragmentFormSectionProps
>;

interface AudienceBuilderContainerProps
  extends Omit<ConfigProps<AudienceBuilderFormData>, 'form'> {
  save: (formData: AudienceBuilderFormData) => void;
  datamartId: string;
  queryResult?: OTQLResult;
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

class AudienceBuilderContainer extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  saveFormData = () => {
    const { formValues } = this.props;
    this.props.save(formValues);
  };

  render() {
    const { datamartId, queryResult } = this.props;

    const genericFieldArrayProps = {
      rerenderOnEveryChange: true,
    };

    return (
      <React.Fragment>
        <AudienceBuilderActionbar save={this.saveFormData} />
        <Layout>
          <Row className="ant-layout-content mcs-segmentBuilder_container">
            <Col span={12}>
              <QueryFragmentFieldArray
                name={`where.expressions`}
                component={QueryFragmentFormSection}
                datamartId={datamartId}
                {...genericFieldArrayProps}
              />
            </Col>
            <Col
              span={12}
              className="mcs-segmentBuilder_liveDashboardContainer"
            >
              <AudienceBuilderDashboard totalAudience={queryResult && queryResult.rows[0].count} />
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
