import EmailCampaignService from '../../../../services/EmailCampaignService';

import {
  createFieldArrayModel,
  createFieldArrayModelWithMeta,
} from './../../../../utils/FormHelper';
import {
  Task,
  executeTasksInSequence,
} from './../../../../utils/PromiseHelper';

import {
  EmailTemplateSelectionResource,
  EmailTemplateSelectionCreateRequest,
  EmailBlastCreateRequest,
  EmailBlastResource,
  EmailCampaignResource,
  EmailCampaignCreateRequest,
} from '../../../../models/campaign/email';

import {
  AudienceSegmentSelectionResource,
  AudienceSegmentSelectionCreateRequest,
} from '../../../../models/audiencesegment';

import {
  EmailCampaignFormData,
  EmailBlastFormData,
  TemplateFieldModel,
  ConsentFieldModel,
  SegmentFieldModel,
  RouterFieldModel,
  BlastFieldModel,
  INITIAL_EMAIL_BLAST_FORM_DATA,
  INITIAL_EMAIL_CAMPAIGN_FORM_DATA,
} from './domain';

type TBlastId = string;
type TCampaignId = string;

const EmailCampaignFormService = {
  loadCampaign(emailCampaignId: string): Promise<EmailCampaignFormData> {
    return Promise.all([
      EmailCampaignService.getEmailCampaign(emailCampaignId),
      EmailCampaignFormService.loadCampaignDependencies(emailCampaignId),
    ]).then(([campaignApiResp, dependencies]) => {
      return {
        campaign: campaignApiResp.data,
        ...dependencies,
      };
    });
  },

  loadBlast(
    emailCampaignId: string,
    blastId: string,
  ): Promise<EmailBlastFormData> {
    return Promise.all([
      EmailCampaignService.getBlast(emailCampaignId, blastId),
      EmailCampaignFormService.loadBlastDependencies(emailCampaignId, blastId),
    ]).then(([blastApiResp, dependencies]) => {
      return {
        blast: blastApiResp.data,
        ...dependencies,
      };
    });
  },

  loadCampaignDependencies(
    campaignId: string,
  ): Promise<{
    blastFields: BlastFieldModel[];
    routerFields: RouterFieldModel[];
  }> {
    return Promise.all([
      EmailCampaignService.getRouters(campaignId).then(resp =>
        resp.data.map(createFieldArrayModel),
      ),
      EmailCampaignService.getBlasts(campaignId).then(resp => {
        return Promise.all(
          resp.data.map(blast => {
            return EmailCampaignFormService.loadBlastDependencies(
              campaignId,
              blast.id,
            ).then(dependencies => {
              return createFieldArrayModel({
                blast: blast,
                ...dependencies,
              });
            });
          }),
        );
      }),
    ]).then(([routerFields, blastFields]) => {
      return {
        routerFields,
        blastFields,
      };
    });
  },

  loadBlastDependencies(campaignId: string, blastId: string): Promise<any> {
    return Promise.all([
      EmailCampaignService.getEmailTemplates(campaignId, blastId).then(resp =>
        resp.data.map(template => ({
          ...createFieldArrayModelWithMeta(template, { name: template.name }),
        })),
      ),
      EmailCampaignService.getConsents(campaignId, blastId).then(resp =>
        resp.data.map(createFieldArrayModel),
      ),
      EmailCampaignService.getSegments(campaignId, blastId).then(resp =>
        resp.data.map(segment => ({
          ...createFieldArrayModelWithMeta(segment, { name: segment.name }),
        })),
      ),
    ]).then(([templateFields, consentFields, segmentFields]) => {
      return {
        templateFields,
        consentFields,
        segmentFields,
      };
    });
  },

  saveCampaign(
    organisationId: string,
    formData: EmailCampaignFormData,
    initialFormData: EmailCampaignFormData = INITIAL_EMAIL_CAMPAIGN_FORM_DATA,
  ): Promise<TCampaignId> {
    let createOrUpdateCampaignPromise;
    if (
      formData.campaign &&
      hasId<EmailCampaignResource, Partial<EmailCampaignCreateRequest>>(
        formData.campaign,
      )
    ) {
      createOrUpdateCampaignPromise = EmailCampaignService.updateEmailCampaign(
        formData.campaign.id,
        formData.campaign,
      );
    } else {
      createOrUpdateCampaignPromise = EmailCampaignService.createEmailCampaign(
        organisationId,
        formData.campaign,
      );
    }

    return createOrUpdateCampaignPromise.then(resp => {
      const campaignId = resp.data.id;

      const tasks: Task[] = [];

      tasks.push(
        ...getRouterTasks(
          campaignId,
          formData.routerFields,
          initialFormData.routerFields,
        ),
        ...getBlastTasks(
          campaignId,
          formData.blastFields,
          initialFormData.blastFields,
        ),
      );

      return executeTasksInSequence(tasks).then(() => campaignId);
    });
  },

  saveBlast(
    campaignId: string,
    formData: EmailBlastFormData,
    initialFormData: EmailBlastFormData = INITIAL_EMAIL_BLAST_FORM_DATA,
  ): Promise<TBlastId> {
    let createOrUpdateBlastPromise;

    if (
      formData.blast &&
      hasId<EmailBlastResource, Partial<EmailBlastCreateRequest>>(
        formData.blast,
      )
    ) {
      createOrUpdateBlastPromise = EmailCampaignService.updateBlast(
        campaignId,
        formData.blast.id,
        formData.blast,
      );
    } else {
      createOrUpdateBlastPromise = EmailCampaignService.createBlast(
        campaignId,
        formData.blast,
      );
    }

    return createOrUpdateBlastPromise.then(resp => {
      const blastId = resp.data.id;

      const tasks: Task[] = [];

      tasks.push(
        ...getSegmentTasks(
          campaignId,
          blastId,
          formData.segmentFields,
          initialFormData.segmentFields,
        ),
        ...getConsentTasks(
          campaignId,
          blastId,
          formData.consentFields,
          initialFormData.consentFields,
        ),
        ...getTemplateTasks(
          campaignId,
          blastId,
          formData.templateFields,
          initialFormData.templateFields,
        ),
      );

      return executeTasksInSequence(tasks).then(() => blastId);
    });
  },
};

function hasId<T extends { id: string }, Y>(resource: T | Y): resource is T {
  return (resource as T).id !== undefined;
}

function getSegmentTasks(
  campaignId: string,
  blastId: string,
  segmentFields: SegmentFieldModel[],
  initialSegmentFields: SegmentFieldModel[],
): Task[] {
  const initialSegmentIds: string[] = [];
  initialSegmentFields.forEach(field => {
    if (
      hasId<
        AudienceSegmentSelectionResource,
        AudienceSegmentSelectionCreateRequest
      >(field.model)
    ) {
      initialSegmentIds.push(field.model.id);
    }
  });
  const currentSegmentIds: string[] = [];
  segmentFields.forEach(field => {
    if (
      hasId<
        AudienceSegmentSelectionResource,
        AudienceSegmentSelectionCreateRequest
      >(field.model)
    ) {
      currentSegmentIds.push(field.model.id);
    }
  });

  const tasks: Task[] = [];
  // new segment tasks
  segmentFields.forEach(field => {
    if (
      !hasId<
        AudienceSegmentSelectionResource,
        AudienceSegmentSelectionCreateRequest
      >(field.model)
    ) {
      tasks.push(() =>
        EmailCampaignService.createSegment(campaignId, blastId, field.model),
      );
    }
  });
  // removed segment tasks
  initialSegmentIds
    .filter(id => !currentSegmentIds.includes(id))
    .forEach(id => {
      tasks.push(() =>
        EmailCampaignService.deleteSegment(campaignId, blastId, id),
      );
    });
  return tasks;
}

function getTemplateTasks(
  campaignId: string,
  blastId: string,
  templateFields: TemplateFieldModel[],
  initialTemplateFields: TemplateFieldModel[],
): Task[] {
  const initialTemplateIds: string[] = [];
  initialTemplateFields.forEach(field => {
    if (
      hasId<
        EmailTemplateSelectionResource,
        EmailTemplateSelectionCreateRequest
      >(field.model)
    ) {
      initialTemplateIds.push(field.model.id);
    }
  });
  const currentTemplateIds: string[] = [];
  templateFields.forEach(field => {
    if (
      hasId<
        EmailTemplateSelectionResource,
        EmailTemplateSelectionCreateRequest
      >(field.model)
    ) {
      currentTemplateIds.push(field.model.id);
    }
  });

  const tasks: Task[] = [];
  // new segment tasks
  templateFields.forEach(field => {
    if (
      !hasId<
        EmailTemplateSelectionResource,
        EmailTemplateSelectionCreateRequest
      >(field.model)
    ) {
      tasks.push(() =>
        EmailCampaignService.createEmailTemplate(
          campaignId,
          blastId,
          field.model,
        ),
      );
    }
  });
  // removed segment tasks
  initialTemplateIds
    .filter(id => !currentTemplateIds.includes(id))
    .forEach(id => {
      tasks.push(() =>
        EmailCampaignService.deleteEmailTemplate(campaignId, blastId, id),
      );
    });
  return tasks;
}

function getConsentTasks(
  campaignId: string,
  blastId: string,
  consentFields: ConsentFieldModel[],
  initialConsentFields: ConsentFieldModel[],
): Task[] {
  const initialConsentIds: string[] = [];
  initialConsentFields.forEach(field => {
    if (field.model.id) {
      initialConsentIds.push(field.model.id);
    }
  });
  const currentConsentIds: string[] = [];
  consentFields.forEach(field => {
    if (field.model.id) {
      currentConsentIds.push(field.model.id);
    }
  });

  const tasks: Task[] = [];
  // new segment tasks
  consentFields.forEach(field => {
    if (!field.model.id) {
      tasks.push(() =>
        EmailCampaignService.createConsent(campaignId, blastId, field.model),
      );
    }
  });
  // removed segment tasks
  initialConsentIds
    .filter(id => !currentConsentIds.includes(id))
    .forEach(id => {
      tasks.push(() =>
        EmailCampaignService.deleteConsent(campaignId, blastId, id),
      );
    });
  return tasks;
}

export function getRouterTasks(
  campaignId: string,
  routerFields: RouterFieldModel[],
  initialRouterFields: RouterFieldModel[],
): Task[] {
  const initialRouterIds: string[] = [];
  initialRouterFields.forEach(field => {
    if (field.model.id) {
      initialRouterIds.push(field.model.id);
    }
  });
  const currentRouterIds: string[] = [];
  routerFields.forEach(field => {
    if (field.model.id) {
      currentRouterIds.push(field.model.id);
    }
  });

  const tasks: Task[] = [];
  // new segment tasks
  routerFields.forEach(field => {
    if (!field.model.id) {
      tasks.push(() =>
        EmailCampaignService.createRouter(campaignId, field.model),
      );
    }
  });
  // removed segment tasks
  initialRouterIds.filter(id => !currentRouterIds.includes(id)).forEach(id => {
    tasks.push(() => EmailCampaignService.deleteRouter(campaignId, id));
  });
  return tasks;
}

export function getBlastTasks(
  campaignId: string,
  blastFields: BlastFieldModel[],
  initialBlastFields: BlastFieldModel[],
): Task[] {
  const initialBlastIds: string[] = [];
  initialBlastFields.forEach(field => {
    if (
      hasId<EmailBlastResource, Partial<EmailBlastCreateRequest>>(
        field.model.blast,
      )
    ) {
      initialBlastIds.push(field.model.blast.id);
    }
  });

  const currentBlastIds: string[] = [];
  blastFields.forEach(field => {
    if (
      hasId<EmailBlastResource, Partial<EmailBlastCreateRequest>>(
        field.model.blast,
      )
    ) {
      currentBlastIds.push(field.model.blast.id);
    }
  });

  const tasks: Task[] = [];
  // create or update blast tasks
  blastFields.forEach(field => {
    const initialField = initialBlastFields.find(f => f.key === field.key);
    tasks.push(() =>
      EmailCampaignFormService.saveBlast(
        campaignId,
        field.model,
        initialField ? initialField.model : undefined,
      ),
    );
  });

  // removed blast tasks
  initialBlastIds.filter(id => !currentBlastIds.includes(id)).forEach(id => {
    tasks.push(() => EmailCampaignService.deleteBlast(campaignId, id));
  });

  return tasks;
}

// function getFieldArrayTasks<T>(
//   fields: FieldArrayModel[],
//   initialFields: FieldArrayModel[],
//   getId: (model: T) => string,

// ): Array<{
//   deletions: T[],
//   modifications: T[],
//   creations: T[],
// }> {
//   const initialIds: string[] = [];
//   initialFields.forEach(field => {
//     if (getId(field.model)) {
//       initialIds.push(getId(field.model));
//     }
//   });
//   const currentIds: string[] = [];
//   fields.forEach(field => {
//     if (getId(field.model)) {
//       currentIds.push(getId(field.model));
//     }
//   });

//   const tasks: Task[] = [];
//   // new segment tasks
//   fields.forEach(field => {
//     if (
//       !hasId<
//         ConsentSelectionResource,
//         ConsentSelectionCreateRequest
//       >(field.model)
//     ) {
//       tasks.push(() =>
//         EmailCampaignService.createConsent(campaignId, blastId, field.model),
//       );
//     }
//   });
//   // removed segment tasks
//   initialIds
//     .filter(id => !currentIds.includes(id))
//     .forEach(id => {
//       tasks.push(() => deleteMethod());
//     });
//   return tasks;
// }

export default EmailCampaignFormService;
