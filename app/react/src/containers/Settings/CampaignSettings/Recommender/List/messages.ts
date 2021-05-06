import { defineMessages } from 'react-intl';

export default defineMessages({
  recommender: {
    id: 'settings.recommender.breadcrumb.title',
    defaultMessage: 'Recommenders',
  },
  newRecommender: {
    id: 'settings.recommender.actionbar.button.new',
    defaultMessage: 'New Recommender',
  },
  recommenderArchiveTitle: {
    id: 'settings.recommender.modal.archive.title',
    defaultMessage: 'Are you sure you want to archive this Recommender?',
  },
  recommenderArchiveMessage: {
    id: 'settings.recommender.modal.archive.message',
    defaultMessage: 'By archiving this Recommender it will stop campaigns using it. Are you sure?',
  },
  recommenderArchiveOk: {
    id: 'settings.recommender.modal.archive.ok',
    defaultMessage: 'Archive Now',
  },
  recommenderArchiveCancel: {
    id: 'settings.recommender.modal.archive.cancel',
    defaultMessage: 'Cancel',
  },
  name: {
    id: 'settings.recommender.list.column.name',
    defaultMessage: 'Name',
  },
  processor: {
    id: 'settings.recommender.list.column.processor',
    defaultMessage: 'Recommender Processor',
  },
  provider: {
    id: 'settings.recommender.list.column.provider',
    defaultMessage: 'Provider',
  },
  empty: {
    id: 'settings.recommender.list.empty',
    defaultMessage: 'There is no Recommender List created yet! Click on New to get started',
  },
  edit: {
    id: 'settings.recommender.list.actionColumn.edit',
    defaultMessage: 'Edit',
  },
  archive: {
    id: 'settings.recommender.list.actionColumn.archive',
    defaultMessage: 'Archive',
  },
});
