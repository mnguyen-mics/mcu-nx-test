import * as React from 'react';
import { WrappedFieldArrayProps } from 'redux-form';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { Switch, Tooltip } from 'antd';

import { injectDrawer } from '../../../../../components/Drawer/index';
import { AudienceTagFeedsFieldModel } from '../domain';
import FormSection from '../../../../../components/Form/FormSection';
import RelatedRecords from '../../../../../components/RelatedRecord/RelatedRecords';
import RecordElement from '../../../../../components/RelatedRecord/RecordElement';

import { ReduxFormChangeProps } from '../../../../../utils/FormHelper';

import { InjectDrawerProps } from '../../../../../components/Drawer/injectDrawer';

import messages from '../messages';
import { PluginType } from '../../../../../models/Plugins';
import AudienceFeedForm, { CreateAudienceFeedProps } from '../AudienceFeedForm/AudienceFeedForm';
import { McsIcon } from '../../../../../components';


export interface AudienceTagFeedSectionProps extends ReduxFormChangeProps {}

type Props = AudienceTagFeedSectionProps &
  WrappedFieldArrayProps<AudienceTagFeedsFieldModel> &
  InjectedIntlProps &
  InjectDrawerProps;

class AudienceTagFeedSection extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  updateAudienceExternalFeed = (audienceFeed: AudienceTagFeedsFieldModel, avoidCloseDrawer: boolean = false) => {
    const allfields = this.props.fields.getAll();
    const newFields: AudienceTagFeedsFieldModel[] = [];
    if (audienceFeed.model.id) {
      allfields.forEach(f => f.key === audienceFeed.key ? newFields.push(audienceFeed) : newFields.push(f))
    } else {
      allfields.forEach(f => newFields.push(f))
      newFields.push(audienceFeed)
    }
    if (!avoidCloseDrawer) {
      this.props.closeNextDrawer();
    }
    this.props.formChange((this.props.fields as any).name, newFields);
  };

  

  openAudienceTagFeedSelector = (record: AudienceTagFeedsFieldModel) => {
    
    const props = {
      onClose: this.props.closeNextDrawer,
      onSave: this.updateAudienceExternalFeed,
      edition: true,
      type: 'AUDIENCE_SEGMENT_TAG_FEED' as PluginType,
      initialValues: {
        plugin: record.model,
        properties: record.model.properties
      },
    };

    this.props.openNextDrawer<CreateAudienceFeedProps<AudienceTagFeedsFieldModel>>(AudienceFeedForm, { additionalProps: props })
  };

  createAudienceFeedSelector = () => {
    const props = {
      onClose: this.props.closeNextDrawer,
      onSave: this.updateAudienceExternalFeed,
      type: 'AUDIENCE_SEGMENT_TAG_FEED' as PluginType,
      edition: false,
    };

    this.props.openNextDrawer<CreateAudienceFeedProps<AudienceTagFeedsFieldModel>>(AudienceFeedForm, { additionalProps: props })
  }

  renderSwitch = (record: AudienceTagFeedsFieldModel) => {
    const {
      intl,
    } = this.props;

    const onChange = (c: boolean) => {
      const newRecord: AudienceTagFeedsFieldModel = { ...record, model: { ...record.model, status: c ? 'ACTIVE' : 'PAUSED' }  }
      this.updateAudienceExternalFeed(newRecord, true)
    }

    const embedInInfoTooltip = (e: JSX.Element) => {
      return <Tooltip title={intl.formatMessage(messages.audienceFeedDisableExplanation)}>{e}</Tooltip>
    }

    const element = (<span>
      <Switch
        className="mcs-table-switch"
        checked={record.model.status === 'ACTIVE'}
        onChange={onChange}
        disabled={!record.model.id}
        checkedChildren={
          <McsIcon style={{ verticalAlign: 'middle' }} type="play" />
        }
        unCheckedChildren={
          <McsIcon style={{ verticalAlign: 'middle' }} type="pause" />
        }
      />
    </span>)

    return record.model.id ? element : embedInInfoTooltip(element)
  }

  getAudienceTagFeed = () => {
    const { fields } = this.props;

    const getName = (field: AudienceTagFeedsFieldModel) => {
      return field.model.artifact_id
    };

    return fields.map((name, index) => {
      const removeField = () => fields.remove(index);

      const field = fields.get(index);

      return (
        <RecordElement
          key={field.key}
          recordIconType="optimization"
          record={field}
          title={getName}
          onRemove={removeField}
          onEdit={this.openAudienceTagFeedSelector}
          additionalActionButtons={this.renderSwitch}
        />
      );
    });
  };

  render() {
    const { intl: { formatMessage } } = this.props;

    return (
      <div>
        <FormSection
          dropdownItems={[
            {
              id: messages.addExisting.id,
              message: messages.addExisting,
              onClick: this.createAudienceFeedSelector,
            },
          ]}
          subtitle={messages.sectionAudienceTagFeedSubtitle}
          title={messages.sectionAudienceTagFeedTitle}
        />

        <RelatedRecords
          emptyOption={{
            iconType: 'optimization',
            message: formatMessage(messages.sectionEmptyAudienceTagFeedRules),
          }}
        >
          {this.getAudienceTagFeed()}
        </RelatedRecords>
      </div>
    );
  }
}

export default compose<AudienceTagFeedSectionProps, Props>(injectIntl, injectDrawer)(
  AudienceTagFeedSection,
);