import * as React from 'react';
import ActionBar, { Path } from '../../../../../../components/ActionBar';
import { Layout, Form, Row, Button, Alert } from 'antd';
import { compose } from 'recompose';
import {
  injectIntl,
  InjectedIntlProps,
  defineMessages,
  FormattedMessage,
} from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import { FORM_ID, QueryInputAutomationFormData } from '../domain';
import { QueryLanguage } from '../../../../../../models/datamart/DatamartResource';
import { MenuPresentational } from '../../../../../../components/FormMenu';
import { FormTitle } from '../../../../../../components/Form';
import JSONQLBuilderContainer from '../../../../../QueryTool/JSONOTQL/JSONQLBuilderContainer';
import { McsIcon, OtqlConsole } from '../../../../../../components';
import { QueryDocument } from '../../../../../../models/datamart/graphdb/QueryDocument';
import { StorylineNodeModel } from '../../../domain';
import { QueryInputNodeResource } from '../../../../../../models/automations/automations';

const { Content } = Layout;

const localMessages = defineMessages({
  save: {
    id: 'automation.builder.node.edition.form.query.save.button',
    defaultMessage: 'Update',
  },
  or: {
    id: 'automation.builder.node.edition.form.query.presentation.or',
    defaultMessage: 'or',
  },
  subtitle: {
    id: 'automation.builder.node.edition.form.query.presentation.subtitle',
    defaultMessage: 'Please select the query type you want to do.',
  },
  title: {
    id: 'automation.builder.node.edition.form.query.presentation.title',
    defaultMessage: 'Language Selection.',
  },
  noMoreSupported: {
    id:
      'automation.builder.node.edition.form.query.legacyComponent.noMoreSupported',
    defaultMessage:
      'The query language related to this datamart is no more supported. Please select another datamart or create a new resource based on another datamart.',
  },
});

export interface QueryAutomationFormProps {
  close: () => void;
  breadCrumbPaths: Path[];
  storylineNodeModel: StorylineNodeModel;
  onSubmit: (data: QueryInputAutomationFormData) => void;
  initialValues: QueryInputAutomationFormData;
  disabled?: boolean;
}

type Props = QueryAutomationFormProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

interface State {
  queryLanguage?: QueryLanguage;
  queryText?: string;
  isTrigger?: boolean;
}

class QueryAutomationForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const node = props.storylineNodeModel.node as QueryInputNodeResource;
    this.state = {
      queryLanguage: node.formData.query_language,
      queryText: node.formData.query_text,
      isTrigger: node.evaluation_mode === 'LIVE',
    };
  }

  render() {
    const {
      breadCrumbPaths,
      close,
      storylineNodeModel: storylineNodeModel,
      initialValues,
      onSubmit,
      disabled,
      intl,
    } = this.props;

    const { queryLanguage, isTrigger } = this.state;

    const isDisabled = {
      disabled: disabled,
    };

    if (!queryLanguage) {
      const onSelect = (q: QueryLanguage) => () =>
        this.setState({ queryLanguage: q });

      return (
        <Layout>
          <div className="edit-layout ant-layout">
            <ActionBar edition={true} paths={breadCrumbPaths}>
              <McsIcon
                type="close"
                className="close-icon"
                style={{ cursor: 'pointer' }}
                onClick={close}
              />
            </ActionBar>
            <Layout>
              <Content className="mcs-content-container mcs-form-container text-center">
                <FormTitle
                  title={localMessages.title}
                  subtitle={localMessages.subtitle}
                />
                <Row className="mcs-selector_container">
                  <Row className="menu">
                    <div className="presentation">
                      <MenuPresentational
                        title={'Query Builder'}
                        type="data"
                        select={onSelect('JSON_OTQL')}
                      />
                      <div className="separator">
                        <FormattedMessage {...localMessages.or} />
                      </div>
                      <MenuPresentational
                        title={'Expert Mode'}
                        type="code"
                        select={onSelect('OTQL')}
                      />
                    </div>
                  </Row>
                </Row>
              </Content>
            </Layout>
          </div>
        </Layout>
      );
    }

    if (queryLanguage === 'SELECTORQL') {
      return (
        <Alert
          message={intl.formatMessage(localMessages.noMoreSupported)}
          type="warning"
        />
      );
    }

    const node = storylineNodeModel.node as QueryInputNodeResource;
    const datamartId = node.formData.datamart_id
      ? node.formData.datamart_id
      : initialValues.datamart_id!;

    if (queryLanguage === 'JSON_OTQL') {
      const actionBar = (query: QueryDocument) => {
        const onSave = () => {
          const formData: QueryInputAutomationFormData = {
            ...initialValues,
            query_language: queryLanguage,
            query_text: JSON.stringify(query),
          };
          onSubmit(formData);
        };

        return (
          <ActionBar edition={true} paths={breadCrumbPaths}>
            {!disabled && (
              <Button onClick={onSave} type="primary" className={'mcs-primary'}>
                Save
              </Button>
            )}

            <McsIcon
              type="close"
              className="close-icon"
              style={{ cursor: 'pointer' }}
              onClick={close}
            />
          </ActionBar>
        );
      };

      return (
        <JSONQLBuilderContainer
          datamartId={
            node.formData.datamart_id
              ? node.formData.datamart_id
              : initialValues.datamart_id!
          }
          renderActionBar={actionBar}
          editionLayout={true}
          queryDocument={
            node.formData.query_text!
              ? JSON.parse(node.formData.query_text!)
              : undefined
          }
          isTrigger={isTrigger}
          {...isDisabled}
        />
      );
    }

    const onChange = (val: string) => this.setState({ queryText: val });

    const onOtqlSave = () => {
      const formData: QueryInputAutomationFormData = {
        ...initialValues,
        query_language: queryLanguage,
        query_text: this.state.queryText,
      };
      onSubmit(formData);
    };

    return (
      <Layout className="edit-layout">
        <Layout className={'ant-layout'}>
          <ActionBar edition={true} paths={breadCrumbPaths}>
            <Button
              onClick={onOtqlSave}
              type="primary"
              className={'mcs-primary'}
            >
              Save
            </Button>

            <McsIcon
              type="close"
              className="close-icon"
              style={{ cursor: 'pointer' }}
              onClick={close}
            />
          </ActionBar>
          <Form className="edit-layout ant-layout" layout="vertical">
            <Content
              id={FORM_ID}
              className="mcs-content-container mcs-form-container automation-form"
            >
              <OtqlConsole
                value={this.state.queryText ? this.state.queryText : ''}
                datamartId={datamartId}
                onChange={onChange}
                showPrintMargin={false}
                height="250px"
                width="100%"
                enableBasicAutocompletion={true}
                enableLiveAutocompletion={true}
                {...isDisabled}
              />
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

export default compose<Props, QueryAutomationFormProps>(
  injectIntl,
  withRouter,
)(QueryAutomationForm);
