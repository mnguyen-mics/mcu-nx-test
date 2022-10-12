import { defineMessages } from 'react-intl';

const messages = defineMessages({
  firstPartyDeviceIdRegistries: {
    id: 'settings.organisation.device.registries.firstParty.list.title',
    defaultMessage: 'First-party device registries',
  },
  emptyDeviceIdRegistries: {
    id: 'settings.organisation.device.registries.list.empty',
    defaultMessage: 'There are no device registries.',
  },
  newDeviceIdRegistry: {
    id: 'settings.organisation.device.registries.list.newDeviceIdRegistry',
    defaultMessage: 'New Registry',
  },
  deviceIdRegistryId: {
    id: 'settings.organisation.device.registries.list.id',
    defaultMessage: 'id',
  },
  deviceIdRegistryName: {
    id: 'settings.organisation.device.registries.list.name',
    defaultMessage: 'Name',
  },
  deviceIdRegistryType: {
    id: 'settings.organisation.device.registries.list.type',
    defaultMessage: 'Type',
  },
  noDatamartsSelectionWarningTooltipText: {
    id: 'settings.organisation.device.registries.list.warning.tooltip.text',
    defaultMessage: "This registry isn't enabled on any datamart.",
  },
  editRegistryDatamartsSelection: {
    id: 'settings.organisation.device.registries.list.edit.datamarts',
    defaultMessage: 'Edit linked datamarts',
  },
  editDeviceIdRegistry: {
    id: 'settings.organisation.device.registries.list.edit',
    defaultMessage: 'Edit registry',
  },
  registryEditionSuccess: {
    id: 'settings.organisation.device.registries.edit.success',
    defaultMessage: 'Device registry successfully updated.',
  },
  registryDeletionConfirmationTitle: {
    id: 'settings.organisation.device.registries.delete.confirm.title',
    defaultMessage: 'Are you sure you want to continue?',
  },
  registryDeletionConfirmationMessage: {
    id: 'settings.organisation.device.registries.delete.confirm.message',
    defaultMessage:
      'You are about to delete the device registry {registryName}. Are you sure you want to continue?',
  },
  registryDeletionSuccess: {
    id: 'settings.organisation.device.registries.delete.success',
    defaultMessage: 'Device registry successfully deleted.',
  },
  datamartSelectionsExistTitle: {
    id: 'settings.organisation.device.registries.delete.selections.exist.title',
    defaultMessage: 'Device registry enabled on datamarts',
  },
  datamartSelectionsExistMessage: {
    id: 'settings.organisation.device.registries.delete.selections.exist.message',
    defaultMessage: 'Cannot delete this device registry since it is enabled on some datamarts.',
  },
  deleteDeviceIdRegistry: {
    id: 'settings.organisation.device.registries.list.delete',
    defaultMessage: 'Delete registry',
  },
  newFirstPartyRegistryDrawerTitle: {
    id: 'settings.organisation.device.registries.firstParty.new.title',
    defaultMessage: 'New Device Registry',
  },
  editFirstPartyRegistryDrawerTitle: {
    id: 'settings.organisation.device.registries.firstParty.edit.title',
    defaultMessage: 'Edit Device Registry',
  },
  newThirdPartyRegistryDrawerTitle: {
    id: 'settings.organisation.device.registries.new.thirdParty.title',
    defaultMessage: 'Device Registries > New Third-party Device Registry',
  },
  firstPartyDatamartSelectionsDrawerTitle: {
    id: 'settings.organisation.device.registries.new.thirdParty.title',
    defaultMessage: 'Edit linked datamarts for device registry: {registryName}',
  },
  generalInformation: {
    id: 'settings.organisation.device.registries.new.generalInformation',
    defaultMessage: 'General Information',
  },
  namePlaceholder: {
    id: 'settings.organisation.device.registries.new.name.placeholder',
    defaultMessage: 'Device registry name',
  },
  description: {
    id: 'settings.organisation.device.registries.new.description',
    defaultMessage: 'Description',
  },
  descritpionPlaceholder: {
    id: 'settings.organisation.device.registries.new.description.placeholder',
    defaultMessage: 'Device registry description',
  },
  enableDatamarts: {
    id: 'settings.organisation.device.registries.new.enableDatamarts',
    defaultMessage: 'Enable Datamarts',
  },
  save: {
    id: 'settings.organisation.device.registries.new.save',
    defaultMessage: 'Save',
  },
  organisationName: {
    id: 'settings.organisation.device.registries.new.datamarts.organisation.name',
    defaultMessage: 'Organisation',
  },
  datamartName: {
    id: 'settings.organisation.device.registries.new.datamarts.name',
    defaultMessage: 'Datamart',
  },
  formNotComplete: {
    id: 'settings.organisation.device.registries.new.formNotComplete',
    defaultMessage: 'Please fill in the required fields',
  },
  newRegistryCreationSuccess: {
    id: 'settings.organisation.device.registries.new.creation.success',
    defaultMessage: 'Device registry successfully created.',
  },
  datamartsSelectionModalTitle: {
    id: 'settings.organisation.device.registries.datamarts.selection.modal.title',
    defaultMessage: 'This device registry is not enabled on any datamart yet.',
  },
  datamartsSelectionModalMessage: {
    id: 'settings.organisation.device.registries.datamarts.selection.modal.message',
    defaultMessage:
      'To use your new device registry in a datamart, you need to edit your device registry and select the datamarts on which you want to use it.',
  },
  modalCancel: {
    id: 'settings.organisation.device.registries.modal.cancel',
    defaultMessage: 'Cancel',
  },
  datamartSelectionsEditionSuccess: {
    id: 'settings.organisation.device.registries.new.creation.success',
    defaultMessage: 'Linked datamarts list successfully updated.',
  },
  deviceIdRegistryOffers: {
    id: 'settings.organisation.device.registry.offers.list.title',
    defaultMessage: 'Third-party device registries',
  },
  deviceIdRegistryOfferId: {
    id: 'settings.organisation.device.registry.offers.list.id',
    defaultMessage: 'id',
  },
  deviceIdRegistryOfferName: {
    id: 'settings.organisation.device.registry.offers.list.name',
    defaultMessage: 'Name',
  },
  deviceIdRegistryOfferSubscription: {
    id: 'settings.organisation.device.registry.offers.list.subscription',
    defaultMessage: 'Subscription',
  },
  subscribeToDeviceIdRegistryOffer: {
    id: 'settings.organisation.device.registry.offers.list.subscribe',
    defaultMessage: 'Subscribe',
  },
  unsubscribeFromDeviceIdRegistryOffer: {
    id: 'settings.organisation.device.registry.offers.list.unsubscribe',
    defaultMessage: 'Subscribe',
  },
});

export default messages;
