import * as React from 'react';
import { WrappedFieldArrayProps } from 'redux-form';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { compose } from 'recompose';
import { Switch, Tooltip } from 'antd'

import { injectDrawer } from '../../../../../components/Drawer/index';
import { AudienceExternalFeedsFieldModel } from '../domain';
import FormSection from '../../../../../components/Form/FormSection';
import RelatedRecords from '../../../../../components/RelatedRecord/RelatedRecords';
import RecordElement from '../../../../../components/RelatedRecord/RecordElement';

import { ReduxFormChangeProps } from '../../../../../utils/FormHelper';

import { InjectDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import AudienceFeedForm, { CreateAudienceFeedProps } from '../AudienceFeedForm/AudienceFeedForm';

import messages from '../messages';
import { PluginType } from '../../../../../models/Plugins';
import { McsIcon } from '../../../../../components';


export interface AudienceExternalFeedSectionProps extends ReduxFormChangeProps {}

type Props = AudienceExternalFeedSectionProps &
  WrappedFieldArrayProps<AudienceExternalFeedsFieldModel> &
  InjectedIntlProps &
  InjectDrawerProps;

class AudienceExternalFeedSection extends React.Component<Props> {
  constructor(props: Props) {
    super(props);
  }

  updateAudienceExternalFeed = (audienceFeed: AudienceExternalFeedsFieldModel, avoidCloseDrawer: boolean = false) => {
    const allfields = this.props.fields.getAll();
    const newFields: AudienceExternalFeedsFieldModel[] = [];
    if (audienceFeed.model.id) {
      allfields.forEach(f => f.key === audienceFeed.key ? newFields.push(audienceFeed) : newFields.push(f))
    } else {
      const existsAlready = allfields.find(f => f.key === audienceFeed.key)
      if (existsAlready) {
        allfields.forEach(f => f.key === audienceFeed.key ? newFields.push(audienceFeed) : newFields.push(f))
      } else {
        allfields.forEach(f => newFields.push(f))
        newFields.push(audienceFeed)
      }
    }
    if (!avoidCloseDrawer) {
      this.props.closeNextDrawer();
    }
    this.props.formChange((this.props.fields as any).name, newFields);
  };

  

  openAudienceExternalFeedSelector = (record: AudienceExternalFeedsFieldModel) => {
    
    const props = {
      onClose: this.props.closeNextDrawer,
      onSave: this.updateAudienceExternalFeed,
      edition: true,
      type: 'AUDIENCE_SEGMENT_EXTERNAL_FEED' as PluginType,
      initialValues: {
        plugin: record.model,
        properties: record.model.properties
      },
      identifier: record.key
    };

    this.props.openNextDrawer<CreateAudienceFeedProps<AudienceExternalFeedsFieldModel>>(AudienceFeedForm, { additionalProps: props })
  };

  createAudienceFeedSelector = () => {
    const props = {
      onClose: this.props.closeNextDrawer,
      onSave: this.updateAudienceExternalFeed,
      type: 'AUDIENCE_SEGMENT_EXTERNAL_FEED' as PluginType,
      edition: false,
      identifier: null,
    };

    this.props.openNextDrawer<CreateAudienceFeedProps<AudienceExternalFeedsFieldModel>>(AudienceFeedForm, { additionalProps: props })
  }


  renderSwitch = (record: AudienceExternalFeedsFieldModel) => {
    const {
      intl
    } = this.props;

    const onChange = (c: boolean) => {
      const newRecord: AudienceExternalFeedsFieldModel = { ...record, model: { ...record.model, status: c ? 'ACTIVE' : 'PAUSED' }  }
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

  getAudienceExternalFeed = () => {
    const { fields } = this.props;

    const getName = (field: AudienceExternalFeedsFieldModel) => {
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
          additionalActionButtons={this.renderSwitch}
          onRemove={removeField}
          onEdit={this.openAudienceExternalFeedSelector}
        />
      );
    });
  };

  render() {
    const { intl: { formatMessage } } = this.props;

    return (
      <div>
        <FormSection
          button={
            {
              message: formatMessage(messages.addAFeed),
              onClick: this.createAudienceFeedSelector,
            }
          }
          subtitle={messages.sectionAudienceExternalFeedSubtitle}
          title={messages.sectionAudienceExternalFeedTitle}
        />

        <RelatedRecords
          emptyOption={{
            iconType: 'optimization',
            message: formatMessage(messages.sectionEmptyAudienceExternalFeedRules),
          }}
        >
          {this.getAudienceExternalFeed()}
        </RelatedRecords>
      </div>
    );
  }
}

export default compose<AudienceExternalFeedSectionProps, Props>(injectIntl, injectDrawer)(
  AudienceExternalFeedSection,
);