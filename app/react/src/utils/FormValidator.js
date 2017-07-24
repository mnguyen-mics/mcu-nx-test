import { defineMessages, forma } from 'react-intl';

const messages = defineMessages({
  required: {
    id: 'diojqw',
    defaultMessage: 'Required'
  }
});

export const required = value => (value ? undefined : 'Required');
