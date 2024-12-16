import { Pagination } from "../responsePagination"

export interface DataCluster {
    id: number
    city_id: number
    name: string
}

export interface SuccessGetApiCluster {
    message: string,
    data: DataCluster[]
    paging: Pagination
}

export type AddressNominatim = {
    road: string;
    city_block: string;
    neighbourhood: string;
    suburb: string;
    city_district: string;
    city: string;
    "ISO3166-2-lvl4": string;
    region: string;
    "ISO3166-2-lvl3": string;
    postcode: string;
    country: string;
    country_code: string;
};

export type LocationDataNominatim = {
    place_id: number;
    licence: string;
    osm_type: string;
    osm_id: number;
    lat: string;
    lon: string;
    class: string;
    type: string;
    place_rank: number;
    importance: number;
    addresstype: string;
    name: string;
    display_name: string;
    address: AddressNominatim;
    boundingbox: [string, string, string, string];
};
