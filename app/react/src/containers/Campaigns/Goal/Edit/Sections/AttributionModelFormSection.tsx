import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import cuid from 'cuid';
import { Switch, message } from 'antd';
import { FormSection } from '../../../../../components/Form';
import withValidators, { ValidatorProps } from '../../../../../components/Form/withValidators';
import { ReduxFormChangeProps } from '../../../../../utils/FormHelper';
import { WrappedFieldArrayProps } from 'redux-form';
import { injectDrawer } from '../../../../../components/Drawer/index';
import {
  EmptyRecords,
  RelatedRecords,
  RecordElement,
} from '../../../../../components/RelatedRecord/index';
import AttributionModelSelector, {
  AttributionModelSelectorProps,
} from '../../Common/AttributionModelSelector';
import {
  AttributionModelListFieldModel,
  isAttributionSelectionResource,
  AttributionModelMetaData,
} from '../domain';
import { AttributionModel, AttributionModelCreateRequest } from '../../../../../models/Plugins';
import { AttributionSelectionCreateRequest } from '../../../../../models/goal';
import { InjectedDrawerProps } from '../../../../../components/Drawer/injectDrawer';

const messages = defineMessages({
  sectionSubtitle: {
    id: 'goalEditor.section.attribution.model.subtitle',
    defaultMessage: 'Give your Goal attribution models.',
  },
  sectionTitle: {
    id: 'goalEditor.section..attribution.model.title',
    defaultMessage: 'Attribution Models',
  },
  addExistingAttributionModel: {
    id: 'goalEditor.section..attribution.model.add.existing',
    defaultMessage: 'Add existing attribution model',
  },
  emptyRecordTitle: {
    id: 'edit.goal.no.attribution.model.title',
    defaultMessage: 'Click on the pen to add an attribution model to your goal',
  },
  addDirectAttributionModel: {
    id: 'edit.goal.add.direct.attribution.model',
    defaultMessage: 'Add direct attribution model',
  },
  errorDeleteDefaultAttributionModel: {
    id: 'edit.goal.delete.default.attribution.model',
    defaultMessage:
      'Please select another default attribution model before delete the default one.',
  },
  checkedSwitchAttributionModelText: {
    id: 'edit.goal.default.switch.attribution.model.text',
    defaultMessage: 'DEFAULT',
  },
});

interface AttributionModelFormSectionState {
  initialRadioGroupValue: number;
}

interface AttributionModelFormSectionProps extends ReduxFormChangeProps {}

type Props = AttributionModelFormSectionProps &
  InjectedIntlProps &
  ValidatorProps &
  InjectedDrawerProps &
  WrappedFieldArrayProps<AttributionModelListFieldModel>;

class AttributionModelFormSection extends React.Component<Props, AttributionModelFormSectionState> {
  constructor(props: Props) {
    super(props);
    this.state = {
      initialRadioGroupValue: 1,
    };
  }

  updateExistingAttributionModels = (attributionModels: AttributionModel[]) => {
    const { fields, formChange } = this.props;
    const attributionModelIds = attributionModels.map(am => am.id);
    const keptFields: AttributionModelListFieldModel[] = [];
    if (fields && fields.getAll()) {
      fields.getAll().forEach(field => {
        if (
          isAttributionSelectionResource(field.model) &&
          attributionModelIds.includes(field.model.id)
        ) {
          keptFields.push(field);
        } else if (attributionModelIds.includes(field.model.attribution_model_id)) {
          keptFields.push(field);
        } else if (field.model.attribution_type === 'DIRECT') {
          keptFields.push(field);
        }
      });
    }

    const existingAttributionModelIds: string[] = [];
    if (fields && fields.getAll()) {
      fields.getAll().forEach(field => {
        existingAttributionModelIds.push(field.model.attribution_model_id);
      });
    }

    const newFields = attributionModels
      .filter(attributionModel => !existingAttributionModelIds.includes(attributionModel.id))
      .map((attributionModel, index) => {
        const newSelection: AttributionSelectionCreateRequest = {
          attribution_model_id: attributionModel.id,
          attribution_type: 'WITH_PROCESSOR',
          default: false,
        };
        const defaultAM = this.props.fields.getAll().length >= 1 ? false : index === 0;
        return {
          key: cuid(),
          model: newSelection,
          meta: this.buildFieldModelMeta(attributionModel, defaultAM),
        };
      });

    formChange((fields as any).name, keptFields.concat(newFields));
    this.props.closeNextDrawer();
  };

  addDirectAttributionModel = () => {
    const { fields } = this.props;
    fields.push({
      key: cuid(),
      model: { attribution_model_id: '-1', attribution_type: 'DIRECT' },
      meta: {
        name: 'DIRECT',
        default: fields.length === 0,
      },
    });
  };

  openAttributionModelSelector = () => {
    const { openNextDrawer, closeNextDrawer, fields } = this.props;

    const selectedAttributionModelIds: string[] = [];
    if (fields && fields.getAll()) {
      fields.getAll().forEach(field => {
        if (field.model.attribution_model_id && field.model.attribution_type === 'WITH_PROCESSOR') {
          selectedAttributionModelIds.push(field.model.attribution_model_id);
        }
      });
    }

    const additionalProps = {
      save: this.updateExistingAttributionModels,
      close: closeNextDrawer,
      selectedAttributionModelIds,
    };
    const options = {
      additionalProps,
    };
    openNextDrawer<AttributionModelSelectorProps>(AttributionModelSelector, options);
  };

  renderFieldArray() {
    const { intl, fields } = this.props;

    return fields.length === 0 ? (
      <EmptyRecords message={intl.formatMessage(messages.emptyRecordTitle)} />
    ) : (
      <RelatedRecords
        emptyOption={{
          iconType: 'users',
          message: intl.formatMessage(messages.emptyRecordTitle),
        }}
      >
        {this.getAttributionModelRecords()}
      </RelatedRecords>
    );
  }

  buildFieldModelMeta = (
    data: Partial<AttributionModelCreateRequest>,
    defaultAM: boolean = false,
  ): AttributionModelMetaData => {
    return {
      name: data.name,
      artifact_id: data.artifact_id,
      group_id: data.group_id,
      default: defaultAM,
    };
  };

  getAttributionModelRecords = () => {
    const { fields, formChange, intl } = this.props;

    return fields.getAll().map((attributionModelField, index) => {
      const removeField = () => {
        const keptFields: AttributionModelListFieldModel[] = [];
        if (!attributionModelField.meta.default) {
          fields.getAll().forEach((field, _index) => {
            if (_index !== index) {
              keptFields.push(field);
            }
          });
          formChange((fields as any).name, keptFields);
        } else {
          message.error(intl.formatMessage(messages.errorDeleteDefaultAttributionModel));
        }
      };
      const getName = (attributionModel: AttributionModelListFieldModel) => {
        return attributionModel.meta.name && attributionModel.meta.name !== 'DIRECT'
          ? `${attributionModel.meta.name} /
         ${attributionModel.meta.group_id} /
         ${attributionModel.meta.artifact_id}`
          : 'DIRECT';
      };

      const setDefaultAttributionModel = () => {
        const handleDefaultClick = () => {
          const newFields = fields.getAll().map(field => {
            if (field.key === attributionModelField.key) {
              return {
                ...field,
                meta: {
                  ...field.meta,
                  default: true,
                },
              };
            } else {
              return {
                ...field,
                meta: {
                  ...field.meta,
                  default: false,
                },
              };
            }
          });
          formChange((fields as any).name, newFields);
        };
        return (
          <span>
            {attributionModelField.meta.default &&
              intl.formatMessage(messages.checkedSwitchAttributionModelText)}
            <Switch
              className='mcs-table-switch m-l-10'
              checked={attributionModelField.meta.default}
              disabled={attributionModelField.meta.default}
              onChange={handleDefaultClick}
            />
          </span>
        );
      };

      return (
        <RecordElement
          key={attributionModelField.key}
          recordIconType='display'
          record={attributionModelField}
          title={getName}
          onRemove={removeField}
          additionalActionButtons={setDefaultAttributionModel}
        />
      );
    });
  };

  render() {
    const { fields } = this.props;

    const existingDirectAttribModel =
      fields && fields.getAll() && fields.getAll().find(f => f.model.attribution_type === 'DIRECT');

    return (
      <div>
        <FormSection
          subtitle={messages.sectionSubtitle}
          title={messages.sectionTitle}
          dropdownItems={[
            {
              id: messages.addExistingAttributionModel.id,
              message: messages.addExistingAttributionModel,
              onClick: this.openAttributionModelSelector,
            },
            {
              id: messages.addDirectAttributionModel.id,
              message: messages.addDirectAttributionModel,
              onClick: this.addDirectAttributionModel,
              disabled: !!existingDirectAttribModel,
            },
          ]}
        />
        {this.renderFieldArray()}
      </div>
    );
  }
}

export default compose<Props, AttributionModelFormSectionProps>(
  injectIntl,
  injectDrawer,
  withValidators,
)(AttributionModelFormSection);
