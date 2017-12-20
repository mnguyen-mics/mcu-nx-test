export interface AdResource {
    id: string;
    status: string;
    name: string;
    creative_id: string;
    technical_name: string;
}

// TODO: use PropertyResource in models/plugin
export interface FormattedPropertiesProps {
    deletable: boolean;
    origin: string;
    property_type: string;
    technical_name: string;
    value: {
        url: string;
    };
    writable: boolean;
}

export interface RendererDataProps {
    renderer_artifact_id: string;
    renderer_group_id: string;
}

export interface AdRendererProps {
    id: string;
    version_id: string;
    artifact_id: string;
    group_id: string;
}
