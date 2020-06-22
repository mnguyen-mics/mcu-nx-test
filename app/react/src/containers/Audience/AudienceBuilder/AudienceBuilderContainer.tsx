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

export const QueryFragmentFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  QueryFragmentFormSectionProps
>;

interface AudienceBuilderContainerProps
  extends Omit<ConfigProps<AudienceBuilderFormData>, 'form'> {
  save: (formData: AudienceBuilderFormData) => void;
}

interface MapStateToProps {
  formValues: AudienceBuilderFormData;
}

interface State {
  totalAudience: number;
}

type Props = InjectedFormProps<
  AudienceBuilderFormData,
  AudienceBuilderContainerProps
> &
  MapStateToProps &
  AudienceBuilderContainerProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

class AudienceBuilderContainer extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      totalAudience: 3525014,
    };
  }

  saveFormData = () => {
    const { formValues } = this.props;
    this.props.save(formValues);
  };

  render() {
    const { totalAudience } = this.state;

    const { change, formValues } = this.props;

    const genericFieldArrayProps = {
      formChange: change,
      rerenderOnEveryChange: true,
    };

    return (
      <React.Fragment>
        <AudienceBuilderActionbar save={this.saveFormData} />
        <Layout>
          <Row className="ant-layout-content mcs-segmentBuilder_container">
            <Col span={12}>
              {formValues.datamart_id && (
                <QueryFragmentFieldArray
                  name={`where.expressions`}
                  component={QueryFragmentFormSection}
                  datamartId={formValues.datamart_id}
                  {...genericFieldArrayProps}
                />
              )}
            </Col>
            <Col span={12}>
              <AudienceBuilderDashboard totalAudience={totalAudience} />
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
