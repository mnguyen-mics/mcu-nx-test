import * as React from 'react';
import { compose } from 'recompose';
import { injectIntl, InjectedIntlProps, defineMessages } from 'react-intl';
import cuid from 'cuid';
import { FormSection } from '../../../../../components/Form';
import withValidators, {
  ValidatorProps,
} from '../../../../../components/Form/withValidators';
import { ReduxFormChangeProps } from '../../../../../utils/FormHelper';
import { InjectDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import { WrappedFieldArrayProps } from 'redux-form';
import { injectDrawer } from '../../../../../components/Drawer/index';
import { AttributionSelectionResource } from '../../../../../models/goal/AttributionSelectionResource';
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
  addExistingAttributionModel: {
    id: 'goalEditor.section..attribution.model.add.existing',
    defaultMessage: 'Add existing attribution model',
  },
  emptyRecordTitle: {
    id: 'edit.placement.list.no.placementDescriptor.title',
    defaultMessage: 'Click on the pen to add an attribution model to your goal',
  },
});

interface AttributionModelFormSectionState {}

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
    this.state = {};
  }

  openAttributionModelForm = (
    attributionModelData?: AttributionSelectionResource,
  ) => {
    //
  };

  updateAttributionModels = (attributionModels: AttributionModelResource[]) => {
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
    // const attributionModelIds = attributionModels.map((a: any) => a.attribution_model_id);
    // const fieldAttributionModelIds = fields
    //   .getAll()
    //   .map(field => field.model.id);

    // const keptAttributionModels = fields
    //   .getAll()
    //   .filter(field =>
    //     attributionModelIds.includes(
    //       (field.model as AttributionModelResource).id,
    //     ),
    //   );
    // const addedAttributionModels = attributionModels
    //   .filter(a => !fieldAttributionModelIds.includes(a.id))
    //   .map(a => ({
    //     key: cuid(),
    //     model: {
    //       ...a,
    //     },
    //     meta: {
    //       name: a.name,
    //       group_id: a.group_id,
    //       artefact_id: a.artifact_id,
    //       attribution_model_id: a.id,
    //     },
    //   }));

    formChange((fields as any).name, keptFields.concat(newFields));
    this.props.closeNextDrawer();
  };

  openAttributionModelSelector = () => {
    const { openNextDrawer, closeNextDrawer, fields } = this.props;
    const selectedAttributionModelIds = fields
      .getAll()
      .map(field => (field.model as any).id);
    const additionalProps = {
      save: this.updateAttributionModels,
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
      //   const edit = this.openAttributionModelForm(
      //     attributionModelField.model,
      //   );

      return (
        <RecordElement
          key={cuid()}
          recordIconType="display"
          record={attributionModelField}
          title={getName}
          // onEdit={edit}
          onRemove={removeField}
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
