import * as React from 'react';
import { compose } from 'recompose';
import {
  RelatedRecords,
  RecordElement,
} from '../../../../../components/RelatedRecord';
import cuid from 'cuid';
import { InjectedIntlProps, defineMessages, injectIntl } from 'react-intl';
import { WrappedFieldArrayProps } from 'redux-form';
import {
  FieldArrayModel,
  ReduxFormChangeProps,
} from '../../../../../utils/FormHelper';
import { PlacementDescriptorResource } from '../../../../../models/placement/PlacementDescriptorResource';
import { EmptyRecords } from '../../../../../components/index';
import { injectDrawer } from '../../../../../components/Drawer/index';
import PlacementDescriptorForm from '../PlacementDescriptorForm';
import { InjectDrawerProps } from '../../../../../components/Drawer/injectDrawer';
import { RouteComponentProps } from 'react-router';
import { INITIAL_PLACEMENT_DESCRIPTOR, PlacementDescriptorListFieldModel } from '../domain';

const messages = defineMessages({
  emptyRecordTitle: {
    id: 'edit.placement.list.no.placementDescriptor.title',
    defaultMessage:
      'Click on the pen to add a placement to your placement list',
  },
  addNewPlacement: {
    id: 'edit.placement.descriptor.form.text.button',
    defaultMessage: 'Add',
  },
});

interface PlacementDescriptorProps extends ReduxFormChangeProps {}

interface PlacementDescriptorState {}

type JoinedProps = PlacementDescriptorProps &
  InjectDrawerProps &
  InjectedIntlProps &
  RouteComponentProps<{ organisationId: string; placementListId: string }> &
  WrappedFieldArrayProps<FieldArrayModel<PlacementDescriptorResource>>;

class PlacementDescriptor extends React.Component<
  JoinedProps,
  PlacementDescriptorState
> {
  updatePlacementDescriptors = (
    formData: Partial<PlacementDescriptorResource>,
    existingKey?: string,
  ) => {
    const { fields, formChange, closeNextDrawer } = this.props;
    const newFields: PlacementDescriptorListFieldModel[]= [];
    if (existingKey) {
      fields.getAll().forEach(field => {
        if (field.key === existingKey) {
          newFields.push({
            key: existingKey,
            model: formData,
          });
        } else {
          newFields.push(field);
        }
      });
    } else {
      newFields.push(...fields.getAll());
      newFields.push({
        key: cuid(),
        model: formData,
      });
    }
    formChange((fields as any).name, newFields);
    closeNextDrawer();
  };

  openPlacementDescriptorForm = (
    field?: FieldArrayModel<Partial<PlacementDescriptorResource>>,
  ) => {
    const { openNextDrawer, closeNextDrawer, intl } = this.props;
    const handleSave = (formData: Partial<PlacementDescriptorResource>) =>
      this.updatePlacementDescriptors(formData, field && field.key);
    const additionalProps = {
      initialValues: field ? field.model : INITIAL_PLACEMENT_DESCRIPTOR,
      onSave: handleSave,
      actionBarButtonText: intl.formatMessage(messages.addNewPlacement),
      close: closeNextDrawer,
    };

    const options = {
      additionalProps,
    };

    openNextDrawer(PlacementDescriptorForm, options);
  };

  getSegmentRecords = () => {
    const { fields } = this.props;

    return fields.getAll().map((placementDescriptorField, index) => {
      const removeField = () => fields.remove(index);
      const getName = (placementDescriptor: FieldArrayModel<PlacementDescriptorResource>) =>
        placementDescriptor.model.value;
      const edit = () =>
        this.openPlacementDescriptorForm(placementDescriptorField);

      return (
        <RecordElement
          key={cuid()}
          recordIconType="display"
          record={placementDescriptorField}
          title={getName}
          onEdit={edit}
          onRemove={removeField}
        />
      );
    });
  };

  render() {
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
        {this.getSegmentRecords()}
      </RelatedRecords>
    );
  }
}

export default compose<JoinedProps, PlacementDescriptorProps>(
  injectIntl,
  injectDrawer,
)(PlacementDescriptor);
