import * as React from 'react';
import { WrappedFieldArrayProps } from 'redux-form';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import cuid from 'cuid';

import messages from '../../messages';
import { PlacementListFieldModel } from '../domain';
import { RecordElement } from '../../../../../../components/RelatedRecord/index';
import { FormSwitchField } from '../../../../../../components/Form/index';
import FormSwitch from '../../../../../../components/Form/FormSwitch';
import { DrawableContentProps } from '../../../../../../components/Drawer/index';
import {
  PlacementListSelector,
  PlacementListSelectorProps,
} from '../../../../Common/PlacementListSelector';
import { PlacementListResource } from '../../../../../../models/placement/PlacementListResource';
import RelatedRecords from '../../../../../../components/RelatedRecord/RelatedRecords';
import FormSection from '../../../../../../components/Form/FormSection';
import { ReduxFormChangeProps } from '../../../../../../utils/FormHelper';

export interface PlacementListFormSectionProps extends DrawableContentProps, ReduxFormChangeProps {}

type Props = PlacementListFormSectionProps &
  InjectedIntlProps &
  WrappedFieldArrayProps<PlacementListFieldModel>;

class PlacementListFormSection extends React.Component<Props> {
  updatePlacementLists = (placementLists: PlacementListResource[]) => {
    const { fields, formChange, closeNextDrawer } = this.props;
    const placementListIds = placementLists.map(s => s.id);
    const fieldPlacementListIds = fields
      .getAll()
      .map(field => field.model.placement_list_id);

    const keptFields = fields
      .getAll()
      .filter(field =>
        placementListIds.includes(field.model.placement_list_id),
      );
    const addedFields = placementLists
      .filter(s => !fieldPlacementListIds.includes(s.id))
      .map(placementList => ({
        key: cuid(),
        model: {
          placement_list_id: placementList.id,
          exclude: false,
        },
        meta: { name: placementList.name },
      }));

    formChange((fields as any).name, keptFields.concat(addedFields));
    closeNextDrawer();
  };

  openPlacementListSelector = () => {
    const { openNextDrawer, closeNextDrawer, fields } = this.props;

    const selectedPlacementListIds = fields
      .getAll()
      .map(p => p.model.placement_list_id);

    const props: PlacementListSelectorProps = {
      selectedPlacementListIds,
      close: closeNextDrawer,
      save: this.updatePlacementLists,
    };

    openNextDrawer<PlacementListSelectorProps>(PlacementListSelector, {
      additionalProps: props,
    });
  };

  getPlacementListRecords = () => {
    const { fields } = this.props;

    const getName = (placementListField: PlacementListFieldModel) =>
      placementListField.meta.name;

    return fields.map((name, index) => {
      const removeField = () => fields.remove(index);

      const excludeSwitch = (record: PlacementListFieldModel) => {
        return (
          <span>
            <FormSwitchField
              name={`${name}.exclude`}
              component={FormSwitch}
              className="mcs-table-switch m-r-10"
            />
            {record.model.exclude ? 'Exclude' : 'Target'}
          </span>
        );
      };
      const placementListField = fields.get(index);

      return (
        <RecordElement
          key={placementListField.key}
          recordIconType="question"
          record={placementListField}
          title={getName}
          additionalActionButtons={excludeSwitch}
          onRemove={removeField}
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
              id: messages.dropdownAddExisting.id,
              message: messages.dropdownAddExisting,
              onClick: this.openPlacementListSelector,
            },
          ]}
          title={messages.sectionTitlePlacement}
          subtitle={messages.sectionSubtitlePlacement}
        />

        <RelatedRecords
          emptyOption={{
            // iconType="placementLists",
            message: formatMessage(messages.contentSectionOptimizerEmptyTitle),
          }}
        >
          {this.getPlacementListRecords()}
        </RelatedRecords>
      </div>
    );
  }
}

export default injectIntl(PlacementListFormSection);
