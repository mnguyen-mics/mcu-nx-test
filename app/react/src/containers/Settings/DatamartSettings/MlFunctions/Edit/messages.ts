import { defineMessages } from 'react-intl';

export default defineMessages({
  listTitle: {
    id: 'mlFunction.edit.list.title',
    defaultMessage: 'Ml Function',
  },
  listSubTitle: {
    id: 'mlFunction.edit.list.subtitle',
    defaultMessage: 'New Ml Function',
  },
  createBreadcrumb: {
    id: 'mlFunction.create.breadcrumb.newtitle',
    defaultMessage: 'New Ml Function',
  },
  editBreadcrumb: {
    id: 'mlFunction.create.breadcrumb.editTitle',
    defaultMessage: 'Edit {name}',
  },
  labelHostingObjectType: {
    id: 'mlFunction.create.field.hosting_object_type.label',
    defaultMessage: 'Hosting Object Type',
  },
  tootltipHostingObjectType: {
    id: 'mlFunction.create.field.hosting_object_type.tooltip',
    defaultMessage:
      'The Hosting Object Type is the name of the object on which you want to create the field for your new Ml Function. Typically it is UserPoint.',
  },
  labelFieldTypeName: {
    id: 'mlFunction.create.field.field_type_name.label',
    defaultMessage: 'Field Type Name',
  },
  tootltipFieldTypeName: {
    id: 'mlFunction.create.field.field_type_name.tooltip',
    defaultMessage: 'The Field Type Name is the name of the Node for your new Ml Function.',
  },
  labelFieldName: {
    id: 'mlFunction.create.field.field_name.label',
    defaultMessage: 'Field Name',
  },
  tootltipFieldName: {
    id: 'mlFunction.create.field.field_name.tooltip',
    defaultMessage:
      ' The Field Name is the name of the field on which you want to attach your new Ml Function.',
  },
  labelQuery: {
    id: 'mlFunction.create.field.query.label',
    defaultMessage: 'Query',
  },
  tootltipQuery: {
    id: 'mlFunction.create.field.query.tooltip',
    defaultMessage:
      ' The GraphQL Query that will be executed before each call to your Ml Function.',
  },
});
