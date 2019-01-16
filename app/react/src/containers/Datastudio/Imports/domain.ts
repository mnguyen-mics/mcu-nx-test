export function formatDocumentTypeText(docType: string): string {
  switch (docType) {
    case 'USER_ACTIVITY':
      return 'User Activity';
    case 'USER_PROFILE':
      return 'User Profile';
    case 'USER_SEGMENT':
      return 'User Segment';
    default:
      return '';
  }
}

export function formatMimeTypeText(docType: string): string {
  switch (docType) {
    case 'X_NDJSON':
      return 'NDJSON';
    case 'TEXT_CSV':
      return 'CSV';
    default:
      return '';
  }
}