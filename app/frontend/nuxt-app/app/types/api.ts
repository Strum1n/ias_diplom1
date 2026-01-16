// ============================================================================
// API Response Models - These match the backend response_models.py
// ============================================================================

// Basic types with relations
export interface OfferType {
    id?: number
    name?: string
}

export interface PropertyType {
    id?: number
    name?: string
}

export interface BathroomType {
    id?: number
    name?: string
}

export interface RenovationType {
    id?: number
    name?: string
}

export interface WindowViewType {
    id?: number
    name?: string
}

export interface ParkingType {
    id?: number
    name?: string
}

export interface HouseMaterialType {
    id?: number
    name?: string
}

export interface HeatingType {
    id?: number
    name?: string
}

export interface GasType {
    id?: number
    name?: string
}

export interface SewerageType {
    id?: number
    name?: string
}

export interface WaterSupplyType {
    id?: number
    name?: string
}

export interface SellerType {
    id?: number
    name?: string
}

export interface LandType {
    id?: number
    name?: string
}

export interface Region {
    id?: number
    name?: string
}

export interface Municipality {
    id?: number
    name?: string
}

export interface Settlement {
    id?: number
    name?: string
}

export interface Partnership {
    id?: number
    name?: string
}

export interface District {
    id?: number
    name?: string
}

export interface Microdistrict {
    id?: number
    name?: string
}

export interface Street {
    id?: number
    name?: string
}

export interface ResidentialComplex {
    id?: number
    name?: string
}

export interface InfrastructureType {
    id?: number
    name?: string
}

// Infrastructure and related
export interface InfrastructureResponseFull {
    id?: number
    name?: string
    infrastructure_type?: InfrastructureType
    coordinates_list: number[]
}

export interface AddressInfrastructureLinkResponseFull {
    infrastructure?: InfrastructureResponseFull
    distance?: number
}

// Address
export interface AddressResponseFull {
    id?: number
    house_number?: string
    full_address: string
    coordinates_list: number[]
    region?: Region
    municipality?: Municipality
    settlement?: Settlement
    partnership?: Partnership
    district?: District
    microdistrict?: Microdistrict
    street?: Street
    residential_complex?: ResidentialComplex
    infrastructures_links?: AddressInfrastructureLinkResponseFull[]
}

export interface AddressResponseShort {
    house_number?: string
    full_address: string
    coordinates_list: number[]
}

// Seller
export interface SellerResponseFull {
    id: number
    name: string
    seller_type?: SellerType
}

// Offer - Full version
export interface OfferResponseFull {
    id?: number
    url?: string
    images_urls?: string[]
    is_new_house?: boolean
    price?: number
    price_history?: Record<string, any>[]
    views_history?: Record<string, any>[]
    price_per_square_meter?: number
    total_area?: number
    living_area?: number
    kitchen_area?: number
    ceiling_height?: number
    floor?: number
    bathrooms_count?: number
    description?: string
    house_built_year?: number
    land_area?: number
    is_build_complete?: boolean
    rooms_count?: number
    bedrooms_count?: number
    elevators_count?: number
    balconies_count?: number
    house_floors_count?: number
    title?: string
    views_count?: number
    last_ten_days_views_count?: number
    daily_views_count?: number
    has_furniture?: boolean
    has_balcony?: boolean
    has_elevator?: boolean
    has_water_supply?: boolean
    has_electricity?: boolean
    has_gas?: boolean
    has_sewerage?: boolean
    has_heating?: boolean
    has_garbage_chute?: boolean
    has_guard?: boolean
    has_garage?: boolean
    has_bathhouse?: boolean
    has_pool?: boolean
    has_terrace?: boolean
    update_date?: string | Date
    update_date_source?: string | Date
    creation_date_source?: string | Date
    contact_phone?: string
    transport_access_score?: number
    transport_access_category?: string
    elderly_score?: number
    elderly_category?: string
    family_score?: number
    family_category?: string
    price_category?: string

    address?: AddressResponseFull
    offer_type?: OfferType
    property_type?: PropertyType
    bathroom_type?: BathroomType
    renovation_type?: RenovationType
    window_view_type?: WindowViewType
    parking_type?: ParkingType
    house_material_type?: HouseMaterialType
    heating_type?: HeatingType
    gas_type?: GasType
    sewerage_type?: SewerageType
    water_supply_type?: WaterSupplyType
    seller?: SellerResponseFull
    land_type?: LandType
}

// Offer - Short version (for lists)
export interface OfferResponseShort {
    id?: number
    url?: string
    price?: number
    total_area?: number
    land_area?: number
    living_area?: number
    title?: string
    price_category?: string
    address?: AddressResponseShort
}

// Pagination
export interface PaginationInfo {
    limit: number
    offset: number
    has_more: boolean
}

// Offers with pagination
export interface OfferResponseWithPagination {
    total_count: number
    filtered_count: number
    offers: OfferResponseFull[]
    pagination: PaginationInfo
}

// User
export interface UserRequest {
    user_name: string
    password: string
    email?: string
    full_name?: string
    role_id?: number
}
