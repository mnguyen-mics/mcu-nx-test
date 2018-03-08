import * as React from 'react';
import { compose } from 'recompose';
import {
  injectIntl,
  InjectedIntlProps,
  defineMessages,
  FormattedMessage,
} from 'react-intl';
import { Checkbox, Button, Modal } from 'antd';
import { FormSection } from '../../../../../components/Form';
import withValidators, {
  ValidatorProps,
} from '../../../../../components/Form/withValidators';
import { QueryLanguage } from '../../../../../models/datamart/DatamartResource';
import {
  injectDatamart,
  InjectedDatamartProps,
} from '../../../../Datamart/index';
import OTQLInputEditor, {
  OTQLInputEditorProps,
} from '../../../../Audience/Segments/Edit/Sections/query/OTQL';
import { FieldCtor } from '../../../../../components/Form/index';
import SelectorQL from '../../../../../containers/Audience/Segments/Edit/Sections/query/SelectorQL';
import { Field } from 'redux-form';
import { RouteComponentProps } from 'react-router';

const FormOTQL: FieldCtor<OTQLInputEditorProps> = Field;

const messages = defineMessages({
  sectionSubtitle1: {
    id: 'goalEditor.section.trigger.subtitle1',
    defaultMessage: 'Conversion tracking through a trigger',
  },
  sectionTitle1: {
    id: 'goalEditor.section.trigger.subtitle2',
    defaultMessage: 'Trigger',
  },
  formCheckBoxText1: {
    id: 'goalEditor.section.trigger.formcheckbox.query',
    defaultMessage: 'Trigger via query',
  },
  formCheckBoxText2: {
    id: 'goalEditor.section.trigger.formcheckbox.pixel',
    defaultMessage: 'Trigger via pixel',
  },
  triggerQueryModalTitle: {
    id: 'goalEditor.section.trigger.query.modal.title',
    defaultMessage: 'Add user activity trigger',
  },
  triggerPixelModalTitle: {
    id: 'goalEditor.section.trigger.pixel.modal.title',
    defaultMessage: 'Pixel for goal',
  },
  triggerPixelModalMessage: {
    id: 'goalEditor.section.trigger.pixel.modal.message',
    defaultMessage:
      'Use this pixel url tracking to capture a conversion goal :',
  },
  audienceSegmentSectionQueryTitle: {
    id: 'edit.goal.form.section.query.title',
    defaultMessage: 'User Query',
  },
  audienceSegmentCreationUserQueryFieldHelper: {
    id: 'edit.goal.form.section.general.field.query.helper',
    defaultMessage:
      'Start your query with "SELECT \\{ id \\} FROM UserPoint WHERE" and add your conditions after the WHERE clause.',
  },
});

interface State {
  displaySection: boolean;
  isTriggerQueryModalVisible: boolean;
  isTriggerPixelModalVisible: boolean;
}

interface TriggerFormSectionProps {
  queryContainer?: any;
  queryLanguage?: QueryLanguage;
}

type Props = TriggerFormSectionProps &
  InjectedIntlProps &
  ValidatorProps &
  InjectedDatamartProps &
  RouteComponentProps<{ organisationId: string; goalId: string }>;

class TriggerFormSection extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      displaySection: false,
      isTriggerQueryModalVisible: false,
      isTriggerPixelModalVisible: false,
    };
  }

  renderPropertiesField = () => {
    const {
      datamart,
      queryLanguage,
      match: { params: { organisationId } },
      intl,
    } = this.props;

    return queryLanguage === 'OTQL' ? (
      <FormOTQL
        name={'query.query_text'}
        component={OTQLInputEditor}
        formItemProps={{
          label: intl.formatMessage(messages.audienceSegmentSectionQueryTitle),
        }}
        helpToolTipProps={{
          title: intl.formatMessage(
            messages.audienceSegmentCreationUserQueryFieldHelper,
          ),
        }}
      />
    ) : (
      <SelectorQL
        datamartId={datamart.id}
        organisationId={organisationId}
        queryContainer={this.props.queryContainer}
      />
    );
  };

  toggleSections = () => {
    this.setState({
      displaySection: !this.state.displaySection,
    });
  };
  closeModals = () => {
    this.setState({
      isTriggerQueryModalVisible: false,
      isTriggerPixelModalVisible: false,
    });
  };

  openTriggerModal = () => {
    this.setState({
      isTriggerQueryModalVisible: true,
    });
  };

  openPixelModal = () => {
    this.setState({
      isTriggerPixelModalVisible: true,
    });
  };

  render() {
    const {
      intl: { formatMessage },
      match: { params: { goalId } },
    } = this.props;

    return (
      <div>
        <Modal
          title={formatMessage(messages.triggerQueryModalTitle)}
          visible={this.state.isTriggerQueryModalVisible}
          onOk={this.closeModals}
          onCancel={this.closeModals}
          width={'60%'}
        >
          {this.renderPropertiesField()}
        </Modal>
        <FormSection
          subtitle={messages.sectionSubtitle1}
          title={messages.sectionTitle1}
        />
        <Checkbox
          checked={!this.state.displaySection}
          onChange={this.toggleSections}
        >
          {formatMessage(messages.formCheckBoxText1)}
        </Checkbox>

        {goalId && (
          <div>
            <br />
            <Checkbox
              checked={this.state.displaySection}
              onChange={this.toggleSections}
            >
              {formatMessage(messages.formCheckBoxText2)}
            </Checkbox>
            <Modal
              title={formatMessage(messages.triggerPixelModalTitle)}
              visible={this.state.isTriggerPixelModalVisible}
              onCancel={this.closeModals}
            >
              {formatMessage(messages.triggerPixelModalMessage)}
              <br />
              <br />
              <b>
                {`<img src='//events.mediarithmics.com/v1/touches/pixel?$ev=$conversion&$dat_token=meddf17&$goal_id=${goalId}' />`}
              </b>
            </Modal>
          </div>
        )}
        <div
          className={
            this.state.displaySection
              ? 'hide-section'
              : 'optional-section-content'
          }
        >
          <Button onClick={this.openTriggerModal}>
            <FormattedMessage
              id="edit.goal.form.section.trigger.button.trigger"
              defaultMessage="Add a trigger"
            />
          </Button>
        </div>
        <div
          className={
            !this.state.displaySection
              ? 'hide-section'
              : 'optional-section-content'
          }
        >
          <Button onClick={this.openPixelModal}>
            <FormattedMessage
              id="edit.goal.form.section.trigger.button.pixel"
              defaultMessage="Get pixel tracking url"
            />
          </Button>
        </div>
      </div>
    );
  }
}

export default compose<Props, TriggerFormSectionProps>(
  injectIntl,
  withValidators,
  injectDatamart,
)(TriggerFormSection);
