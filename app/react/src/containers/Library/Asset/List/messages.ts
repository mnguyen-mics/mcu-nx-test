import { defineMessages } from 'react-intl';

export default defineMessages({
  assets: {
    id: 'assets.breadcrumb.title',
    defaultMessage: 'Assets',
  },
  newAsset: {
    id: 'assets.actionbar.button.new',
    defaultMessage: 'New Asset',
  },
  assetArchiveTitle: {
    id: 'asssets.modal.archive.title',
    defaultMessage: 'Are you sure you want to archive this Asset?',
  },
  assetArchiveMessage: {
    id: 'asssets.modal.archive.message',
    defaultMessage: 'By archiving this Asset it will stop creatives using it. Are you sure?',
  },
  assetArchiveOk: {
    id: 'asssets.modal.archive.ok',
    defaultMessage: 'Archive Now',
  },
  assetArchiveCancel: {
    id: 'asssets.modal.archive.cancel',
    defaultMessage: 'Cancel',
  },
  preview: {
    id: 'asssets.table.column.preview',
    defaultMessage: 'Preview',
  },
  name: {
    id: 'asssets.table.column.name',
    defaultMessage: 'Name',
  },
  type: {
    id: 'asssets.table.column.type',
    defaultMessage: 'Type',
  },
  dimensions: {
    id: 'asssets.table.column.dimensions',
    defaultMessage: 'Dimensions',
  },
  empty: {
    id: 'asssets.table.empty',
    defaultMessage: 'There is no Assets created yet! Click on New to get started',
  },
  uploadMessage: {
    id: 'assets.modal.upload.message',
    defaultMessage: `You can upload one or multiple file at the time.
You can only upload image files with the following format .jpg,.jpeg,.png,.gif,.svg with a maximum size of 200kB`,
  },
  uploadTitle: {
    id: 'assets.modal.upload.title',
    defaultMessage: 'Click or drag file to this area to upload',
  },
  uploadError: {
    id: 'assets.modal.upload.error',
    defaultMessage: 'is above 200kB!',
  },
  uploadButton: {
    id: 'assets.modal.upload.button',
    defaultMessage: 'Upload',
  },
  archive: {
    id: 'assets.list.actionColumn.archive',
    defaultMessage: 'Archive',
  },
});
