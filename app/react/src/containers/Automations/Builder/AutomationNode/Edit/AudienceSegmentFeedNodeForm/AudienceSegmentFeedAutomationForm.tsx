import * as React from 'react';
import { StorylineNodeModel } from '../../../domain';
import { FeedNodeFormData, FORM_ID } from '../domain';
import { ConfigProps, getFormValues, InjectedFormProps, reduxForm } from 'redux-form';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { Layout } from 'antd';
import { Form } from '@ant-design/compatible';
import { FormLayoutActionbar } from '../../../../../../components/Layout';
import { FormLayoutActionbarProps } from '../../../../../../components/Layout/FormLayoutActionbar';
import PluginInstanceFormSection from './PluginInstanceFormSection';
import messages from './messages';
import { McsFormSection } from '../../../../../../utils/FormHelper';
import { MicsReduxState } from '../../../../../../utils/ReduxHelper';

const { Content } = Layout;

export interface AudienceSegmentFeedAutomationFormProps
  extends Omit<ConfigProps<FeedNodeFormData>, 'form'> {
  close: () => void;
  breadCrumbPaths: React.ReactNode[];
  storylineNodeModel: StorylineNodeModel;
  disabled?: boolean;
}

interface MapStateToProps {
  formValues: FeedNodeFormData;
}

type Props = InjectedFormProps<FeedNodeFormData, AudienceSegmentFeedAutomationFormProps> &
  AudienceSegmentFeedAutomationFormProps &
  MapStateToProps &
  InjectedIntlProps;

class AudienceSegmentFeedAutomationForm extends React.Component<Props> {
  buildFormSections = () => {
    const {
      storylineNodeModel: { node },
      disabled,
    } = this.props;

    const sections: McsFormSection[] = [];

    if (node.type === 'SCENARIO_AUDIENCE_SEGMENT_FEED_NODE' && node.strictlyLayoutablePlugin) {
      const calculatedDisabled = node.strictlyLayoutablePlugin?.disabled
        ? node.strictlyLayoutablePlugin?.disabled
        : disabled;
      const strictlyLayoutablePlugin = node.strictlyLayoutablePlugin;
      const pluginVersionId = strictlyLayoutablePlugin.plugin_preset
        ? strictlyLayoutablePlugin.plugin_preset.plugin_version_id
        : strictlyLayoutablePlugin.current_version_id;

      if (pluginVersionId) {
        const generalSection = {
          id: 'generalSection',
          title: messages.sectionGeneralTitle,
          component: (
            <PluginInstanceFormSection
              strictlyLayoutablePlugin={strictlyLayoutablePlugin}
              pluginVersionId={pluginVersionId}
              disabled={calculatedDisabled}
            />
          ),
        };
        sections.push(generalSection);
      }
    }

    return sections;
  };

  render() {
    const { breadCrumbPaths, handleSubmit, close, disabled } = this.props;

    const actionBarProps: FormLayoutActionbarProps = {
      formId: FORM_ID,
      pathItems: breadCrumbPaths,
      message: messages.save,
      onClose: close,
      disabled: disabled,
    };

    const sections = this.buildFormSections();

    const renderedSections = sections.map((section, index) => {
      return (
        <div key={section.id}>
          <div key={section.id} id={section.id}>
            {section.component}
          </div>
          {index !== sections.length - 1 && <hr />}
        </div>
      );
    });

    return (
      <Layout className='edit-layout'>
        <FormLayoutActionbar {...actionBarProps} />
        <Layout className={'ant-layout-has-sider'}>
          <Form
            id={FORM_ID}
            className='edit-layout ant-layout'
            onSubmit={handleSubmit}
            layout='vertical'
          >
            <Content className='mcs-content-container mcs-form-container automation-form'>
              {renderedSections}
            </Content>
          </Form>
        </Layout>
      </Layout>
    );
  }
}

const mapStateToProps = (state: MicsReduxState) => ({
  formValues: getFormValues(FORM_ID)(state),
});

export default compose<Props, AudienceSegmentFeedAutomationFormProps>(
  injectIntl,
  connect(mapStateToProps),
  reduxForm({
    form: FORM_ID,
    enableReinitialize: true,
  }),
)(AudienceSegmentFeedAutomationForm);
