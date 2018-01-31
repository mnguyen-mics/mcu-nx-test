export interface EmailTemplateSelectionCreateRequest {
  email_template_id: string;
}

export interface EmailTemplateSelectionResource extends EmailTemplateSelectionCreateRequest {
  id: string;
  name: string;
}
