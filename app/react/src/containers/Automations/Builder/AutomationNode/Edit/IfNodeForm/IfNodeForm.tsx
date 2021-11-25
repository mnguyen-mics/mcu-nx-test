import * as React from 'react';
import { Layout, Row, Button, Alert } from 'antd';
import { Form } from '@ant-design/compatible';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages, FormattedMessage } from 'react-intl';
import { withRouter, RouteComponentProps } from 'react-router';
import { FORM_ID, QueryInputAutomationFormData } from '../domain';
import { QueryLanguage } from '../../../../../../models/datamart/DatamartResource';
import {
  MenuPresentational,
  Actionbar,
  McsIcon,
} from '@mediarithmics-private/mcs-components-library';
import { FormSection, FormTitle } from '../../../../../../components/Form';
import JSONQLBuilderContainer from '../../../../../Audience/AdvancedSegmentBuilder/AdvancedSegmentBuilderContainer';
import { OtqlConsole } from '../../../../../../components';
import { QueryDocument } from '../../../../../../models/datamart/graphdb/QueryDocument';
import { StorylineNodeModel } from '../../../domain';
import { IfNodeResource } from '../../../../../../models/automations/automations';

const { Content } = Layout;
export interface IfNodeFormProps {
  close: () => void;
  breadCrumbPaths: React.ReactNode[];
  storylineNodeModel: StorylineNodeModel;
  onSubmit: (data: QueryInputAutomationFormData) => void;
  initialValues: QueryInputAutomationFormData;
  disabled?: boolean;
}

type Props = IfNodeFormProps & InjectedIntlProps & RouteComponentProps<{ organisationId: string }>;

interface State {
  queryLanguage?: QueryLanguage;
  queryText?: string;
}

class IfNodeForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    const node = props.storylineNodeModel.node as IfNodeResource;
    this.state = {
      queryLanguage: node.formData.query_language,
      queryText: node.formData.query_text,
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

    const { queryLanguage } = this.state;

    const isDisabled = {
      disabled: disabled,
    };

    if (!queryLanguage) {
      const onSelect = (q: QueryLanguage) => () => this.setState({ queryLanguage: q });

      const descriptionSubtitle = {
        ...localMessages.descriptionSubtitle,
        values: {
          if: (
            <span className='mcs-automation_nodeName'>
              <FormattedMessage {...localMessages.if} />
            </span>
          ),
        },
      };

      return (
        <Layout>
          <div className='edit-layout ant-layout'>
            <Actionbar edition={true} pathItems={breadCrumbPaths}>
              <McsIcon
                type='close'
                className='close-icon'
                style={{ cursor: 'pointer' }}
                onClick={close}
              />
            </Actionbar>
            <Layout>
              <Content className='mcs-content-container mcs-form-container'>
                <FormSection
                  subtitle={descriptionSubtitle}
                  title={localMessages.descriptionTitle}
                />
                <FormSection title={localMessages.configurationTitle} />
                <Content className='text-center'>
                  <FormTitle title={localMessages.title} subtitle={localMessages.subtitle} />
                  <Row className='mcs-selector_container'>
                    <Row className='menu'>
                      <div className='presentation'>
                        <MenuPresentational
                          title={'Query Builder'}
                          type='data'
                          select={onSelect('JSON_OTQL')}
                        />
                        <div className='separator'>
                          <FormattedMessage {...localMessages.or} />
                        </div>
                        <MenuPresentational
                          title={'Expert Mode'}
                          type='code'
                          select={onSelect('OTQL')}
                        />
                      </div>
                    </Row>
                  </Row>
                </Content>
              </Content>
            </Layout>
          </div>
        </Layout>
      );
    }

    if (queryLanguage === 'SELECTORQL') {
      return <Alert message={intl.formatMessage(localMessages.noMoreSupported)} type='warning' />;
    }

    const node = storylineNodeModel.node as IfNodeResource;
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
          <Actionbar edition={true} pathItems={breadCrumbPaths}>
            {!disabled && (
              <Button onClick={onSave} type='primary' className={'mcs-primary'}>
                Save
              </Button>
            )}

            <McsIcon
              type='close'
              className='close-icon'
              style={{ cursor: 'pointer' }}
              onClick={close}
            />
          </Actionbar>
        );
      };

      return (
        <JSONQLBuilderContainer
          datamartId={
            node.formData.datamart_id ? node.formData.datamart_id : initialValues.datamart_id!
          }
          renderActionBar={actionBar}
          editionLayout={true}
          queryDocument={
            node.formData.query_text! ? JSON.parse(node.formData.query_text!) : undefined
          }
          {...isDisabled}
          hideCounterAndTimeline={true}
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
      <Layout className='edit-layout'>
        <Layout className={'ant-layout mcs-legacy_form_container'}>
          <Actionbar edition={true} pathItems={breadCrumbPaths}>
            <Button onClick={onOtqlSave} type='primary' className={'mcs-primary'}>
              Save
            </Button>

            <McsIcon
              type='close'
              className='close-icon'
              style={{ cursor: 'pointer' }}
              onClick={close}
            />
          </Actionbar>
          <Form className='edit-layout ant-layout' layout='vertical'>
            <Content
              id={FORM_ID}
              className='mcs-content-container mcs-form-container automation-form'
            >
              <OtqlConsole
                value={this.state.queryText ? this.state.queryText : ''}
                datamartId={datamartId}
                onChange={onChange}
                showPrintMargin={false}
                height='250px'
                width='100%'
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

export default compose<Props, IfNodeFormProps>(injectIntl, withRouter)(IfNodeForm);

const localMessages = defineMessages({
  descriptionTitle: {
    id: 'automation.builder.node.edition.form.query.presentation.description.title',
    defaultMessage: 'Description',
  },
  descriptionSubtitle: {
    id: 'automation.builder.node.edition.form.query.presentation.description.subtitle',
    defaultMessage:
      'Using {if}, you can add a check whether the user should proceed to the next step of the automation.',
  },
  if: {
    id: 'automation.builder.node.edition.form.query.presentation.description.subtitle.if',
    defaultMessage: 'If',
  },
  configurationTitle: {
    id: 'automation.builder.node.edition.form.query.presentation.configuration.title',
    defaultMessage: 'Configuration',
  },
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
    id: 'automation.builder.node.edition.form.query.legacyComponent.noMoreSupported',
    defaultMessage:
      'The query language related to this datamart is no more supported. Please select another datamart or create a new resource based on another datamart.',
  },
});
