import * as React from 'react';
import ActionBar, { Path } from '../../../../../../components/ActionBar';
import { Layout, Form, Row, Button } from 'antd';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages, FormattedMessage } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import { FORM_ID, QueryAutomationFormData } from '../domain';
import { QueryInputNodeResource } from '../../../../../../models/automations/automations';
import { QueryLanguage } from '../../../../../../models/datamart/DatamartResource';
import { MenuPresentational } from '../../../../../../components/FormMenu';
import { FormTitle } from '../../../../../../components/Form';
import JSONQLBuilderContainer from '../../../../../QueryTool/JSONOTQL/JSONQLBuilderContainer';
import { McsIcon, OtqlConsole } from '../../../../../../components';
import { QueryDocument } from '../../../../../../models/datamart/graphdb/QueryDocument';


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
});

export interface QueryAutomationFormProps {
  close: () => void;
  breadCrumbPaths: Path[];
  node: QueryInputNodeResource;
  onSubmit: (data: QueryAutomationFormData) => void;
  initialValues: QueryAutomationFormData;
  disabled?: boolean;
}


type Props = 
  QueryAutomationFormProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string }>;

interface State {
  queryLanguage?: QueryLanguage;
  queryText?: string
}

class QueryAutomationForm extends React.Component<Props, State> {
  
  constructor(props: Props) {
    super(props);
    this.state = {
      queryLanguage: props.node.formData.query_language,
      queryText: props.node.formData.query_text
    }
  }


  render() {
    const { breadCrumbPaths, close, node, initialValues, onSubmit, disabled } = this.props;

    const { queryLanguage } = this.state;

    const isDisabled: any = {
      disabled: disabled
    }

    if (!queryLanguage) {

      const onSelect = (q: QueryLanguage) => () => this.setState({ queryLanguage: q })

      return (
        <Layout>
          <div className="edit-layout ant-layout">
            <Layout>
              <Content className="mcs-content-container mcs-form-container text-center">
                <FormTitle
                  title={localMessages.title}
                  subtitle={localMessages.subtitle}
                />
                <Row style={{ width: '650px', display: 'inline-block' }}>
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
      )
    }


    if (queryLanguage === 'SELECTORQL') {
      return 'not supported'
    }

    const datamartId = node.formData.datamart_id ? node.formData.datamart_id : initialValues.datamart_id!;

    if (queryLanguage === 'JSON_OTQL') {


      const actionBar = (query: QueryDocument) => {
        const onSave = () => {
          const formData: QueryAutomationFormData = {
            ...initialValues,
            query_language: queryLanguage,
            query_text: JSON.stringify(query),
            name: node.name
          };
          onSubmit(formData)
        }

        return (
        <ActionBar
          edition={true}
          paths={breadCrumbPaths}
        >
          <Button onClick={onSave} type="primary" className={"mcs-primary"}>
            Save
          </Button>
          
          <McsIcon
            type="close"
            className="close-icon"
            style={{ cursor: 'pointer' }}
            onClick={close}
          />
        </ActionBar>
      )}

      return <JSONQLBuilderContainer 
        datamartId={node.formData.datamart_id ? node.formData.datamart_id : initialValues.datamart_id!}
        renderActionBar={actionBar}
        editionLayout={true}
        queryDocument={node.formData.query_text! ? JSON.parse(node.formData.query_text!) : undefined}
        isTrigger={true}
        {...isDisabled}
      />
    }


    const onChange = (val: string) => this.setState({ queryText: val })

    const onOtqlSave = () => {
      const formData: QueryAutomationFormData = {
        ...initialValues,
        query_language: queryLanguage,
        query_text: this.state.queryText,
        name: node.name
      };
      onSubmit(formData)
    }

    return (
      <Layout className="edit-layout">
        <Layout className={'ant-layout'}>
          <ActionBar
            edition={true}
            paths={breadCrumbPaths}
          >
            <Button onClick={onOtqlSave} type="primary" className={"mcs-primary"}>
              Save
            </Button>
            
            <McsIcon
              type="close"
              className="close-icon"
              style={{ cursor: 'pointer' }}
              onClick={close}
            />
          </ActionBar>
          <Form
            className="edit-layout ant-layout"
            layout="vertical"
          >
            <Content
              id={FORM_ID}
              className="mcs-content-container mcs-form-container automation-form"
            >
              <OtqlConsole
                value={this.state.queryText}
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
