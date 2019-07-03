import { defineMessages } from "react-intl";

export default defineMessages({
  listTitle: {
    id: 'storedProcedure.edit.list.title',
    defaultMessage: 'Stored Procedure',
  },
  listSubTitle: {
    id: 'storedProcedure.edit.list.subtitle',
    defaultMessage: 'New Stored Procedure',
  },
  createBreadcrumb: {
    id: 'storedProcedure.create.breadcrumb.newtitle',
    defaultMessage: 'New Stored Procedure',
  },
  editBreadcrumb: {
    id: 'storedProcedure.create.breadcrumb.editTitle',
    defaultMessage: 'Edit {name}',
  },
  labelHostingObjectType: {
    id: 'storedProcedure.create.field.hosting_object_type.label',
    defaultMessage: 'Hosting Object Type',
  },
  tootltipHostingObjectType: {
    id: 'storedProcedure.create.field.hosting_object_type.tooltip',
    defaultMessage: 'The Hosting Object Type is the name of the object on which you want to create the field for your new Stored Procedure. Typically it is UserPoint.',
  },
  labelFieldTypeName: {
    id: 'storedProcedure.create.field.field_type_name.label',
    defaultMessage: 'Field Type Name',
  },
  tootltipFieldTypeName: {
    id: 'storedProcedure.create.field.field_type_name.tooltip',
    defaultMessage: 'The Field Type Name is the name of the Node for your new Stored Procedure.',
  },
  labelFieldName: {
    id: 'storedProcedure.create.field.field_name.label',
    defaultMessage: 'Field Name',
  },
  tootltipFieldName: {
    id: 'storedProcedure.create.field.field_name.tooltip',
    defaultMessage: ' The Field Name is the name of the field on which you want to attach your new Stored Procedure.',
  },
  labelQuery: {
    id: 'storedProcedure.create.field.query.label',
    defaultMessage: 'Query',
  },
  tootltipQuery: {
    id: 'storedProcedure.create.field.query.tooltip',
    defaultMessage: ' The GraphQL Query that will be executed before each call to your Stored Procedure.',
  }
})