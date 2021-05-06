import { Field, GenericField } from 'redux-form';
import FormDataFile, { FormDataFileProps } from './FormDataFile';

export { FormDataFile };

export const FormDataFileField = Field as new () => GenericField<FormDataFileProps>;
