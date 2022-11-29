import { Import } from '../../../models/imports/imports';

export const INITIAL_IMPORTS_FORM_DATA: Partial<Import> = {
  name: '',
  encoding: '',
  mime_type: 'APPLICATION_X_NDJSON',
  document_type: 'USER_ACTIVITY',
};
