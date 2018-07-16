import * as React from 'react';
import { WrappedFieldArrayProps } from 'redux-form';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import cuid from 'cuid';
import { compose } from 'recompose';

import messages from '../../messages';
import { PlacementListFieldModel } from '../domain';
import { RecordElement } from '../../../../../../components/RelatedRecord/index';
import { FormSwitchField } from '../../../../../../components/Form/index';
import FormSwitch from '../../../../../../components/Form/FormSwitch';
import PlacementListSelector, {
  PlacementListSelectorProps,
} from '../../../../Common/PlacementListSelector';
import { PlacementListResource } from '../../../../../../models/placement/PlacementListResource';
import RelatedRecords from '../../../../../../components/RelatedRecord/RelatedRecords';
import FormSection from '../../../../../../components/Form/FormSection';
import { ReduxFormChangeProps } from '../../../../../../utils/FormHelper';
import { injectDrawer } from '../../../../../../components/Drawer/index';
import { InjectedDrawerProps } from '../../../../../../components/Drawer/injectDrawer';

export interface PlacementListFormSectionProps extends ReduxFormChangeProps {}

type Props = PlacementListFormSectionProps &
  InjectedIntlProps &
  InjectedDrawerProps &
  WrappedFieldArrayProps<PlacementListFieldModel>;

class PlacementListFormSection extends React.Component<Props> {
  updatePlacementLists = (placementLists: PlacementListResource[]) => {
    const { fields, formChange } = this.props;
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
    this.props.closeNextDrawer();
  };

  openPlacementListSelector = () => {
    const { fields } = this.props;

    const selectedPlacementListIds = fields
      .getAll()
      .map(p => p.model.placement_list_id);

    const props: PlacementListSelectorProps = {
      selectedPlacementListIds,
      close: this.props.closeNextDrawer,
      save: this.updatePlacementLists,
    };

    this.props.openNextDrawer(PlacementListSelector, {
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
              name={`${name}.model.exclude`}
              component={FormSwitch}
              invert={true}
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
            message: formatMessage(messages.contentSectionPlacementEmptyTitle),
          }}
        >
          {this.getPlacementListRecords()}
        </RelatedRecords>
      </div>
    );
  }
}

export default compose<PlacementListFormSectionProps, Props>(
  injectIntl,
  injectDrawer,
)(PlacementListFormSection);
