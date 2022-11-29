import { Export } from '../../../models/exports/exports';

export interface ExportFormData {
  export: Partial<Export>;
  query: any;
}

export const INITIAL_EXPORTS_FORM_DATA: ExportFormData = {
  export: {
    name: '',
    output_format: 'CSV',
    type: 'QUERY',
  },
  query: null,
};
