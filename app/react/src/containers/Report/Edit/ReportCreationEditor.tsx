import * as React from 'react';
import { Link } from 'react-router-dom';
import Scrollspy from 'react-scrollspy';
import { connect } from 'react-redux';
import {
  Field,
  reduxForm,
  FieldArray,
  Form,
  GenericField,
  InjectedFormProps,
  getFormValues,
  isValid,
  GenericFieldArray,
} from 'redux-form';
import { compose } from 'recompose';
import { Layout, Row, Button, Col } from 'antd';
import { injectIntl, FormattedMessage, InjectedIntlProps } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';

import { Actionbar } from '@mediarithmics-private/mcs-components-library';
import McsIcon from '../../../components/McsIcon';
import { FormTitle, withValidators } from '../../../components/Form';
import FormDateRangePicker, {
  FormDateRangePickerProps,
} from '../../../components/Form/FormDateRangePicker';
import FormLinkedSelectInput, {
  FormLinkedSelectInputProps,
} from '../../../components/Form/FormLinkedSelectInput';
import DefaultSelect, {
  DefaultSelectProps,
} from '../../../components/Form/FormSelect/DefaultSelect';
import TagSelect, {
  FormTagSelectProps,
} from '../../../components/Form/FormSelect/TagSelect';
import messages from './messages';
import ReportFilterFields from './ReportFilterFields';
import TableView, {
  DataColumnDefinition,
} from '../../../components/TableView/TableView';
import { ValidatorProps } from '../../../components/Form/withValidators';
import ReportCreationService, {
  FormValueInterface,
} from './ReportCreationService';
import {
  typeOptions,
  availableDimensions,
  selectPropsMetrics,
  linkedSelectOptions,
} from './constants';
import * as NotificationActions from '../../../redux/Notifications/actions';

const { Content, Sider } = Layout;

interface ReportCreationEditorProps {
  organisationId: string;
}

interface MapStateToProps {
  formValue: FormValueInterface;
  isFormValid: boolean;
}

interface MapDispatchToProps {
  notifyError: any;
}

interface State {
  dataSource: any[];
  columns: Array<DataColumnDefinition<any>>;
  loadingData: boolean;
  noPreviewValues: boolean;
}

type JoinedProps = ReportCreationEditorProps &
  InjectedIntlProps &
  InjectedFormProps &
  RouteComponentProps<any> &
  ValidatorProps &
  MapStateToProps &
  MapDispatchToProps;

const DefaultSelectField = Field as new () => GenericField<DefaultSelectProps>;
const TagSelectField = Field as new () => GenericField<FormTagSelectProps>;
const FormDateRangePickerField = Field as new () => GenericField<
  FormDateRangePickerProps
>;
const FormLinkedSelectInputField = Field as new () => GenericField<
  FormLinkedSelectInputProps
>;
const ReportCreationEditorFieldArray = FieldArray as new () => GenericFieldArray<
  Field,
  FormLinkedSelectInputProps
>;

class ReportCreationEditor extends React.Component<JoinedProps, State> {
  constructor(props: JoinedProps) {
    super(props);

    this.state = {
      dataSource: [],
      columns: [],
      loadingData: false,
      noPreviewValues: false,
    };
  }

  exportReport = (formValue: FormValueInterface) => {
    let loadingData = true;
    this.setState({ loadingData });
    ReportCreationService.exportReport(formValue, this.props.organisationId)
      .then(res => {
        loadingData = false;
        this.setState({ loadingData });
      })
      .catch(err => {
        loadingData = false;
        this.setState({ loadingData });
        this.props.notifyError(err);
      });
  };

  preview = () => {
    const { formValue } = this.props;
    const organisationId = this.props.organisationId;

    let loadingData = true;
    this.setState({ loadingData });

    ReportCreationService.preview(formValue, organisationId)
      .then(res => {
        this.setState(res);
        loadingData = false;
        this.setState({ loadingData });
      })
      .catch(err => {
        loadingData = false;
        this.setState({ loadingData });
        this.props.notifyError(err);
      });
  };

  render() {
    const {
      match: { url },
      history,
      intl,
      handleSubmit,
      isFormValid,
      fieldValidators: { isRequired },
      organisationId,
    } = this.props;

    // If there is a preview
    let tablePreviewData = null;
    if (this.state.dataSource.length !== 0) {
      tablePreviewData = (
        <div className="mcs-table-container">
          <TableView
            columns={this.state.columns}
            loading={this.state.loadingData}
            dataSource={this.state.dataSource}
          />
        </div>
      );
    }
    if (this.state.noPreviewValues === true) {
      tablePreviewData = (
        <Row className="report-previewNoValues">
          <p>
            <FormattedMessage {...messages.previewSectionNoValues} />
          </p>
        </Row>
      );
    }

    const handleClose = () => {
      history.push({
        pathname: `/v2/o/${organisationId}/campaigns/display`,
      });
    };

    return (
      <Layout>
        <Form
          className="edit-layout ant-layout"
          onSubmit={handleSubmit(this.exportReport)}
        >
          {/* this button enables submit on enter */}
          <button type="submit" style={{ display: 'none' }} />
          <Actionbar
            paths={[{ name: intl.formatMessage(messages.actionBarTitle) }]}
            edition={true}
          >
            <Button
              type="primary"
              className="mcs-primary"
              htmlType="submit"
              loading={this.state.loadingData}
            >
              <FormattedMessage {...messages.reportCreationSaveButton} />
            </Button>
            <McsIcon
              type="close"
              className="close-icon"
              onClick={handleClose}
            />
          </Actionbar>
          <Layout>
            <Sider className="stepper">
              <Scrollspy
                rootEl="#reportSteps"
                items={['general_information', 'detailed_information']}
                currentClassName="currentStep"
              >
                <li>
                  <Link to={`${url}#general_information`}>
                    <McsIcon type="check-rounded-inverted" />
                    <span className="step-title">
                      <FormattedMessage
                        {...messages.reportSiderMenuGeneralInformation}
                      />
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to={`${url}#detailed_information`}>
                    <McsIcon type="check-rounded-inverted" />
                    <span className="step-title">
                      <FormattedMessage
                        {...messages.reportSiderMenuDetailedInformation}
                      />
                    </span>
                  </Link>
                </li>
              </Scrollspy>
            </Sider>
            <Layout>
              <div id={'reportSteps'} className="ant-layout">
                <Content className="mcs-content-container mcs-form-container">
                  <div id={'general_information'}>
                    <Row
                      type="flex"
                      align="middle"
                      justify="space-between"
                      className="section-header"
                    >
                      <FormTitle
                        title={messages.reportSectionGeneralTitle}
                        subtitle={messages.reportSectionGeneralSubTitle}
                      />
                    </Row>
                    <Row>
                      <DefaultSelectField
                        name="type"
                        component={DefaultSelect}
                        validate={[isRequired]}
                        options={typeOptions}
                        formItemProps={{
                          label: intl.formatMessage(
                            messages.reportSectionGeneralTypeLabel,
                          ),
                          colon: false,
                          required: true,
                        }}
                        helpToolTipProps={{
                          title: intl.formatMessage(
                            messages.reportSectionGeneralTypeTooltip,
                          ),
                        }}
                      />
                    </Row>
                  </div>
                  <hr />
                  <div id={'detailed_information'}>
                    <Row
                      type="flex"
                      align="middle"
                      justify="space-between"
                      className="section-header"
                    >
                      <FormTitle
                        title={messages.reportSectionDetailedTitle}
                        subtitle={messages.reportSectionDetailedSubTitle}
                      />
                    </Row>
                    <Row>
                      <TagSelectField
                        name="dimensions"
                        component={TagSelect}
                        validate={[isRequired]}
                        selectProps={{ options: availableDimensions }}
                        formItemProps={{
                          label: intl.formatMessage(
                            messages.reportSectionDetailedDimensionsLabel,
                          ),
                          colon: false,
                          required: true,
                        }}
                        helpToolTipProps={{
                          title: intl.formatMessage(
                            messages.reportSectionDetailedDimensionsTooltip,
                          ),
                        }}
                      />
                      <TagSelectField
                        name="metrics"
                        component={TagSelect}
                        validate={[isRequired]}
                        selectProps={selectPropsMetrics}
                        formItemProps={{
                          label: intl.formatMessage(
                            messages.reportSectionDetailedMetricsLabel,
                          ),
                          colon: false,
                          required: true,
                        }}
                        helpToolTipProps={{
                          title: intl.formatMessage(
                            messages.reportSectionDetailedMetricsTooltip,
                          ),
                        }}
                      />
                      <FormDateRangePickerField
                        name="duration"
                        component={FormDateRangePicker}
                        validate={[isRequired]}
                        formItemProps={{
                          label: intl.formatMessage(
                            messages.reportSectionDetailedDurationLabel,
                          ),
                          colon: false,
                          required: true,
                        }}
                        helpToolTipProps={{
                          title: intl.formatMessage(
                            messages.reportSectionDetailedDurationTooltip,
                          ),
                        }}
                        allowPastDate={true}
                        startDatePickerProps={{
                          placeholder: intl.formatMessage(
                            messages.reportSectionDetailedDurationStartDatePlaceholder,
                          ),
                        }}
                        endDatePickerProps={{
                          placeholder: intl.formatMessage(
                            messages.reportSectionDetailedDurationEndDatePlaceholder,
                          ),
                        }}
                      />
                      <FormLinkedSelectInputField
                        name="filter"
                        component={FormLinkedSelectInput}
                        formItemProps={{
                          label: intl.formatMessage(
                            messages.reportSectionDetailedFilterLabel,
                          ),
                          colon: false,
                        }}
                        helpToolTipProps={{
                          title: intl.formatMessage(
                            messages.reportSectionDetailedFilterTooltip,
                          ),
                        }}
                        leftFormSelectProps={{
                          placeholder: intl.formatMessage(
                            messages.reportSectionDetailedFilterLeftSelectPlaceholder,
                          ),
                        }}
                        leftOptionsProps={linkedSelectOptions}
                      />
                      <ReportCreationEditorFieldArray
                        name="additionalFilters"
                        component={ReportFilterFields}
                        formItemProps={{ colon: false }}
                        leftFormSelectProps={{
                          placeholder: intl.formatMessage(
                            messages.reportSectionDetailedFilterLeftSelectPlaceholder,
                          ),
                        }}
                        leftOptionsProps={linkedSelectOptions}
                      />
                    </Row>
                    <Row>
                      <Col span={15} offset={4}>
                        <Col span={20} className="report-previewButton">
                          <Button
                            onClick={this.preview}
                            loading={this.state.loadingData}
                            disabled={!isFormValid}
                          >
                            <FormattedMessage {...messages.previewButton} />
                          </Button>
                        </Col>
                      </Col>
                    </Row>
                    {tablePreviewData}
                  </div>
                </Content>
              </div>
            </Layout>
          </Layout>
        </Form>
      </Layout>
    );
  }
}

const FORM_NAME = 'report';

export default compose<JoinedProps, ReportCreationEditorProps>(
  injectIntl,
  withRouter,
  reduxForm({ form: FORM_NAME }),
  withValidators,
  connect(
    state => ({
      formValue: getFormValues(FORM_NAME)(state),
      isFormValid: isValid(FORM_NAME)(state),
    }),
    { notifyError: NotificationActions.notifyError },
  ),
)(ReportCreationEditor);
