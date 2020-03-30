import { IOrganisationService } from './../../../../services/OrganisationService';
import { ProcessingSelectionResource } from './../../../../models/consent/UserConsentResource';
import { DataListResponse } from './../../../../services/ApiService';
import { IAudienceSegmentService } from './../../../../services/AudienceSegmentService';
import moment from 'moment';
import { AudienceSegmentFormData } from './domain';
import {
  QueryResource,
  QueryLanguage,
} from '../../../../models/datamart/DatamartResource';
import {
  UserQuerySegment,
  AudienceSegmentShape,
} from '../../../../models/audiencesegment/AudienceSegmentResource';
import { DataResponse } from '../../../../services/ApiService';
import { injectable, inject } from 'inversify';
import { TYPES } from '../../../../constants/types';
import { IQueryService } from '../../../../services/QueryService';
import { createFieldArrayModel } from '../../../../utils/FormHelper';

export interface IAudienceSegmentFormService {
  loadSegmentInitialValue: (
    segmentId: string,
  ) => Promise<AudienceSegmentFormData>;

  saveOrCreateAudienceSegment: (
    organisationId: string,
    audienceSegmentFormData: AudienceSegmentFormData,
    queryLanguage?: QueryLanguage,
  ) => Promise<DataResponse<AudienceSegmentShape> | void>;

  getProcessingSelectionsByAudienceSegment: (
    segmentId: string,
  ) => Promise<DataListResponse<ProcessingSelectionResource>>;
  createProcessingSelectionForAudienceSegment: (
    segmentId: string,
    body: Partial<ProcessingSelectionResource>,
  ) => Promise<DataResponse<ProcessingSelectionResource>>;
  getAudienceSegmentProcessingSelection: (
    segmentId: string,
    processingSelectionId: string,
  ) => Promise<DataResponse<ProcessingSelectionResource>>;
  deleteAudienceSegmentProcessingSelection: (
    segmentId: string,
    processingSelectionId: string,
  ) => Promise<DataResponse<ProcessingSelectionResource>>;
}

@injectable()
export class AudienceSegmentFormService implements IAudienceSegmentFormService {
  @inject(TYPES.IAudienceSegmentService)
  private _audienceSegmentService: IAudienceSegmentService;
  @inject(TYPES.IQueryService)
  private _queryService: IQueryService;
  @inject(TYPES.IOrganisationService)
  private _organisationService: IOrganisationService;
  loadSegmentInitialValue(segmentId: string): Promise<AudienceSegmentFormData> {
    const getSegment = this._audienceSegmentService.getSegment(segmentId);
    const getProcessingSelections = this._audienceSegmentService
      .getProcessingSelectionsByAudienceSegment(segmentId)
      .then(res => {
        const processingSelectionResources = res.data;

        return Promise.all(
          processingSelectionResources.map(processingSelectionResource => {
            return this._organisationService
              .getProcessing(processingSelectionResource.processing_id)
              .then(resProcessing => {
                const processingResource = resProcessing.data;
                return {
                  processingSelectionResource: processingSelectionResource,
                  processingResource: processingResource,
                };
              });
          }),
        );
      });

    return Promise.all([getSegment, getProcessingSelections]).then(res => {
      const resSegment = res[0];
      const resProcessingSelections = res[1];
      const initialProcessingSelectionResources = resProcessingSelections.map(
        processingAndSelection =>
          processingAndSelection.processingSelectionResource,
      );
      const processingActivities = resProcessingSelections.map(processingAndSelection =>
        createFieldArrayModel(processingAndSelection.processingResource),
      );

      if (
        (resSegment.data.type === 'USER_QUERY' ||
        resSegment.data.type === 'USER_LIST') &&
        resSegment.data.query_id
      ) {
        return this._queryService
          .getQuery(resSegment.data.datamart_id, resSegment.data.query_id)
          .then(r => r.data)
          .then(r => {
            const formattedResponse: AudienceSegmentFormData = {
              audienceSegment: resSegment.data,
              query: r,
              initialProcessingSelectionResources: initialProcessingSelectionResources,
              processingActivities: processingActivities,
            };
            return formattedResponse;
          });
      }
      const response: AudienceSegmentFormData = {
        audienceSegment: resSegment.data,
        initialProcessingSelectionResources: initialProcessingSelectionResources,
        processingActivities: processingActivities,
      };
      return response;
    });
  }

  saveOrCreateAudienceSegment(
    organisationId: string,
    audienceSegmentFormData: AudienceSegmentFormData,
    queryLanguage?: QueryLanguage,
  ): Promise<DataResponse<AudienceSegmentShape> | void> {
    switch (audienceSegmentFormData.audienceSegment.type) {
      case 'USER_LOOKALIKE':
        return this.createOrUpdateAudienceSegmentUserLookAlike(
          organisationId,
          audienceSegmentFormData,
        );
      case 'USER_LIST':
        return audienceSegmentFormData.audienceSegment.subtype === 'USER_CLIENT'
          ? this.createOrUpdateAudienceSegmentUserQuery(
              organisationId,
              audienceSegmentFormData,
              queryLanguage as QueryLanguage,
            )
          : this.createOrUpdateAudienceSegmentUserList(
              organisationId,
              audienceSegmentFormData,
            );
      case 'USER_QUERY':
        return this.createOrUpdateAudienceSegmentUserQuery(
          organisationId,
          audienceSegmentFormData,
          queryLanguage as QueryLanguage,
        );
      default:
        return Promise.resolve();
    }
  }
  createOrUpdateAudienceSegmentUserList = (
    organisationId: string,
    audienceSegmentFormData: AudienceSegmentFormData,
  ): Promise<DataResponse<AudienceSegmentShape>> => {
    const formattedResponse = {
      ...audienceSegmentFormData.audienceSegment,
      techincal_name: this.fillTechnicalNameForUserPixel(
        audienceSegmentFormData,
      ),
    };
    return this._audienceSegmentService
      .saveSegment(organisationId, formattedResponse)
      .then(response => {
        if (audienceSegmentFormData.userListFiles !== undefined) {
          Promise.all(
            audienceSegmentFormData.userListFiles.map(item => {
              const formData = new FormData();
              formData.append('file', item as any, item.name);
              return this._audienceSegmentService.importUserListForOneSegment(
                audienceSegmentFormData.audienceSegment.datamart_id as string,
                audienceSegmentFormData.audienceSegment.id as string,
                formData,
              );
            }),
          ).then(() => response);
        }
        return response;
      });
  };

  createOrUpdateAudienceSegmentUserLookAlike = (
    organisationId: string,
    audienceSegmentFormData: AudienceSegmentFormData,
  ) => {
    return this._audienceSegmentService.saveSegment(
      organisationId,
      audienceSegmentFormData.audienceSegment,
    );
  };

  createOrUpdateAudienceSegmentUserQuery = (
    organisationId: string,
    audienceSegmentFormData: AudienceSegmentFormData,
    queryLanguage: QueryLanguage,
  ) => {
    return this.createOrUpdateQuery(
      queryLanguage,
      audienceSegmentFormData,
    ).then(query => {
      const formattedResponse: Partial<UserQuerySegment> = {
        ...(audienceSegmentFormData.audienceSegment as Partial<
          UserQuerySegment
        >),
        query_id: query.id,
      };
      return this._audienceSegmentService.saveSegment(
        organisationId,
        formattedResponse,
      );
    });
  };

  createOrUpdateQuery = (
    queryLanguage: QueryLanguage,
    audienceSegmentFormData: AudienceSegmentFormData,
  ) => {
    const datamartId = audienceSegmentFormData.audienceSegment
      .datamart_id as string;

    if (audienceSegmentFormData.query && audienceSegmentFormData.query.id) {
      return this._queryService
        .updateQuery(
          datamartId,
          audienceSegmentFormData.query.id,
          audienceSegmentFormData.query,
        )
        .then(query => query.data);
    }
    return this._queryService
      .createQuery(datamartId, {
        query_language: queryLanguage,
        query_text: (audienceSegmentFormData.query as QueryResource).query_text,
        datamart_id: datamartId,
      })
      .then(query => query.data);
  };

  fillTechnicalNameForUserPixel = (formData: AudienceSegmentFormData) => {
    const technicalName = formData.audienceSegment.technical_name;
    if (
      formData.audienceSegment.type === 'USER_LIST' &&
      formData.audienceSegment.feed_type === 'TAG'
    ) {
      if (
        technicalName === undefined ||
        technicalName === null ||
        technicalName === ''
      ) {
        return `${formData.audienceSegment.name}-${moment().unix()}`;
      }
    }

    return technicalName;
  };

  getProcessingSelectionsByAudienceSegment(
    segmentId: string,
  ): Promise<DataListResponse<ProcessingSelectionResource>> {
    return this._audienceSegmentService.getProcessingSelectionsByAudienceSegment(
      segmentId,
    );
  }
  createProcessingSelectionForAudienceSegment(
    segmentId: string,
    body: Partial<ProcessingSelectionResource>,
  ): Promise<DataResponse<ProcessingSelectionResource>> {
    return this._audienceSegmentService.createProcessingSelectionForAudienceSegment(
      segmentId,
      body,
    );
  }
  getAudienceSegmentProcessingSelection(
    segmentId: string,
    processingSelectionId: string,
  ): Promise<DataResponse<ProcessingSelectionResource>> {
    return this._audienceSegmentService.getAudienceSegmentProcessingSelection(
      segmentId,
      processingSelectionId,
    );
  }
  deleteAudienceSegmentProcessingSelection(
    segmentId: string,
    processingSelectionId: string,
  ): Promise<DataResponse<ProcessingSelectionResource>> {
    return this._audienceSegmentService.deleteAudienceSegmentProcessingSelection(
      segmentId,
      processingSelectionId,
    );
  }
}
