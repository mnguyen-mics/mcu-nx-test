export function formatDocumentTypeText(docType: string): string {
  switch (docType) {
    case 'USER_ACTIVITY':
      return 'User Activity';
    case 'USER_PROFILE':
      return 'User Profile';
    case 'USER_SEGMENT':
      return 'User Segment';
    case 'USER_IDENTIFIERS_ASSOCIATION_DECLARATIONS':
      return 'User Identifiers Association';
    case 'USER_IDENTIFIERS_DISSOCIATION_DECLARATIONS':
      return 'User Identifiers Dissociation';
    case 'USER_IDENTIFIERS_DELETION':
      return 'User Identifiers Deletion';
    default:
      return '';
  }
}

export function formatMimeTypeText(docType: string): string {
  switch (docType) {
    case 'APPLICATION_X_NDJSON':
      return 'NDJSON';
    case 'TEXT_CSV':
      return 'CSV';
    default:
      return '';
  }
}
