export interface Marker {
    name: string;
    lat: number;
    lon: number;
    clusterGroup?: string;
    clusterExpand?: boolean;
    timeline?: { year: string }[];
    modalWidth?: number;
    modalHeight?: number;
    [key: string]: any;
}
