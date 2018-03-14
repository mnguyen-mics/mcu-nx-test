import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import cuid from 'cuid';
import { Radio } from 'antd';
import { FormSection } from '../../../../../components/Form';
import withValidators, {
  ValidatorProps,
} from '../../../../../components/Form/withValidators';
import { ReduxFormChangeProps } from '../../../../../utils/FormHelper';
import { InjectDrawerProps } from '../../../../../components/Drawer/injectDrawer';
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
import { AttributionModelResource } from '../../../../../models/goal/index';
import { AttributionModelListFieldModel } from '../domain';
import { CreateEditAttributionModel } from '../../../../Library/AttributionModel/Edit/index';

const messages = defineMessages({
  sectionSubtitle: {
    id: 'goalEditor.section.attribution.model.subtitle',
    defaultMessage: 'Give your Goal attribution models.',
  },
  sectionTitle: {
    id: 'goalEditor.section..attribution.model.title',
    defaultMessage: 'Attribution Models',
  },
  addNewAttributionModel: {
    id: 'goalEditor.section..attribution.model.add.new',
    defaultMessage: 'Add new attribution model',
  },
  editAttributionModel: {
    id: 'goalEditor.section..attribution.model.edit',
    defaultMessage: 'Edit',
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
});

interface AttributionModelFormSectionState {
  initialRadioGroupValue: number;
}

interface AttributionModelFormSectionProps extends ReduxFormChangeProps {}

type Props = AttributionModelFormSectionProps &
  InjectedIntlProps &
  ValidatorProps &
  InjectDrawerProps &
  WrappedFieldArrayProps<AttributionModelListFieldModel>;

class AttributionModelFormSection extends React.Component<
  Props,
  AttributionModelFormSectionState
> {
  constructor(props: Props) {
    super(props);
    this.state = {
      initialRadioGroupValue: 1,
    };
  }

  openAttributionModelForm = (
    attributionModelData?: AttributionModelListFieldModel,
  ) => {
    const { openNextDrawer, closeNextDrawer, intl } = this.props;
    const handleSave = (formData: Partial<AttributionModelResource>) => {
      // this.updateAttributionModels(formData, field && field.key);
    };

    const additionalProps = {
      initialValues: attributionModelData
        ? attributionModelData.model
        : undefined,
      onSave: handleSave,
      actionBarButtonText: attributionModelData
        ? intl.formatMessage(messages.editAttributionModel)
        : intl.formatMessage(messages.addExistingAttributionModel),
      close: closeNextDrawer,
    };

    const options = {
      additionalProps,
    };

    openNextDrawer(CreateEditAttributionModel, options);
  };

  addExistingAttributionModel = (
    attributionModels: AttributionModelResource[],
    existingKey?: string,
  ) => {
    const { fields, formChange } = this.props;
    const attributionModelIds: string[] = [];
    attributionModels.forEach(am => {
      if (am && am.id) {
        attributionModelIds.push(am.id);
      }
    });
    const keptFields: AttributionModelListFieldModel[] = [];
    fields.getAll().forEach(field => {
      if ((field.model as any).id) {
        if (attributionModelIds.includes((field.model as any).id)) {
          keptFields.push(field);
        }
      } else if ((field.model as any).attribution_model_id) {
        if (
          attributionModelIds.includes(
            (field.model as any).attribution_model_id,
          )
        ) {
          keptFields.push(field);
        }
      }
    });

    const existingAttributionModelIds: string[] = [];
    fields.getAll().forEach(field => {
      if ((field.model as any).id) {
        existingAttributionModelIds.push((field.model as any).id);
      } else if ((field.model as any).attribution_model_id) {
        existingAttributionModelIds.push(
          (field.model as any).attribution_model_id,
        );
      }
    });
    const newFields = attributionModels
      .filter(
        attributionModel =>
          attributionModel &&
          attributionModel.id &&
          !existingAttributionModelIds.includes(attributionModel.id),
      )
      .map(attributionModel => ({
        key: cuid(),
        model: {
          ...attributionModel,
        },
        meta: {
          name: attributionModel.name,
          group_id: attributionModel.group_id,
          artefact_id: attributionModel.artifact_id,
        },
      }));

    formChange((fields as any).name, keptFields.concat(newFields));
    this.props.closeNextDrawer();
  };

  addDirectAttributionModel = () => {
    //
  };

  openAttributionModelSelector = () => {
    const { openNextDrawer, closeNextDrawer, fields } = this.props;
    const selectedAttributionModelIds = fields
      .getAll()
      .map(
        field =>
          (field.model as any).attribution_model_id || (field.model as any).id,
      );
    const additionalProps = {
      save: this.addExistingAttributionModel,
      close: closeNextDrawer,
      selectedAttributionModelIds,
    };
    const options = {
      additionalProps,
    };
    openNextDrawer<AttributionModelSelectorProps>(
      AttributionModelSelector,
      options,
    );
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

  getAttributionModelRecords = () => {
    const { fields } = this.props;

    return fields.getAll().map((attributionModelField, index) => {
      const removeField = () => {
        const newIndex = fields.getAll().indexOf(attributionModelField);
        fields.remove(newIndex);
      };
      const getName = (attributionModel: AttributionModelListFieldModel) => {
        return attributionModel.meta.name
          ? `${attributionModel.meta.name} /
         ${attributionModel.meta.group_id} /
         ${attributionModel.meta.artefact_id}`
          : `${attributionModel.meta.attribution_model_type}`;
      };
      const edit = () => this.openAttributionModelForm(attributionModelField);

      const setDefaultAttributionModel = (
        attributionModel: AttributionModelListFieldModel,
      ) => {
        const handleCheckboxAction = () => {
          // const newIndex = fields.getAll().indexOf(attributionModelField);
          // const fieldDefaultValue = fields.get(newIndex).meta.default;
          // const newField = {
          //   ...fields.get(newIndex),
          //   default: !fieldDefaultValue,
          // };
          // formChange((fields.get(newIndex) as any).name, newField);
        };
        return (
          <Radio
            // checked={
            //   fields.getAll().length === 1
            //     ? true
            //     : attributionModel.meta.default
            //       ? attributionModel.meta.default
            //       : false
            // }
            onChange={handleCheckboxAction}
          />
        );
      };

      return (
        <RecordElement
          key={cuid()}
          recordIconType="display"
          record={attributionModelField}
          title={getName}
          onEdit={edit}
          onRemove={removeField}
          additionalActionButtons={setDefaultAttributionModel}
        />
      );
    });
  };

  render() {
    return (
      <div>
        <FormSection
          subtitle={messages.sectionSubtitle}
          title={messages.sectionTitle}
          dropdownItems={[
            {
              id: messages.addNewAttributionModel.id,
              message: messages.addNewAttributionModel,
              onClick: this.openAttributionModelForm,
            },
            {
              id: messages.addExistingAttributionModel.id,
              message: messages.addExistingAttributionModel,
              onClick: this.openAttributionModelSelector,
            },
            {
              id: messages.addDirectAttributionModel.id,
              message: messages.addDirectAttributionModel,
              onClick: this.addDirectAttributionModel,
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
