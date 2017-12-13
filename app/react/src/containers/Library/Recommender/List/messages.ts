import { defineMessages } from 'react-intl';

export default defineMessages({
  recommender: {
    id: 'recommender.breadcrumb.title',
    defaultMessage: 'Recommenders',
  },
  newRecommender: {
    id: 'recommender.actionbar.button.new',
    defaultMessage: 'New Recommender',
  },
  recommenderArchiveTitle: {
    id: 'recommender.modal.archive.title',
    defaultMessage: 'Are you sure you want to archive this Recommender?',
  },
  recommenderArchiveMessage: {
    id: 'recommender.modal.archive.message',
    defaultMessage: 'By archiving this Recommender it will stop campaigns using it. Are you sure?',
  },
  recommenderArchiveOk: {
    id: 'recommender.modal.archive.ok',
    defaultMessage: 'Archive Now',
  },
  recommenderArchiveCancel: {
    id: 'recommender.modal.archive.cancel',
    defaultMessage: 'Cancel',
  },
  name: {
    id: 'recommender.table.column.name',
    defaultMessage: 'Name',
  },
  processor: {
    id: 'recommender.table.column.processor',
    defaultMessage: 'Recommender Processor',
  },
  provider: {
    id: 'recommender.table.column.provider',
    defaultMessage: 'Provider',
  },
  empty: {
    id: 'recommender.table.empty',
    defaultMessage: 'There is no Recommender List created yet! Click on New to get started',
  },
})
;
