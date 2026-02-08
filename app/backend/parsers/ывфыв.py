from openai import OpenAI

client = OpenAI(api_key="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", base_url="https://openrouter.ai/api/v1")

response = client.chat.completions.create(
    model="arcee-ai/trinity-large-preview:free",
    messages=[
        {
            "role": "system",
            "content": """у тебя есть база данных со схемой:create table renovation_type
(
    id   serial
        constraint pk_renovation_type
            primary key,
    name varchar
);


create table offer
(
    id                        serial
        constraint pk_offer
            primary key,
    url                       varchar(500),
    images_urls               varchar(500)[],
    is_new_house              boolean,
    price                     integer,
    price_history             jsonb,
    price_per_square_meter    integer,
    total_area                double precision,
    living_area               double precision,
    kitchen_area              double precision,
    ceiling_height            double precision,
    floor                     integer,
    bathrooms_count           integer,
    has_furniture             boolean,
    description               varchar,
    house_built_year          integer,
    land_area                 double precision,
    is_build_complete         boolean,
    rooms_count               integer,
    bedrooms_count            integer,
    elevators_count           integer,
    balconies_count           integer,
    house_floors_count        integer,
    title                     varchar,
    has_water_supply          boolean,
    has_electricity           boolean,
    has_gas                   boolean,
    has_sewerage              boolean,
    has_heating               boolean,
    has_garbage_chute         boolean,
    has_guard                 boolean,
    has_garage                boolean,
    has_bathhouse             boolean,
    has_pool                  boolean,
    has_terrace               boolean,
    update_date               timestamp with time zone default now(),
    update_date_source        timestamp with time zone,
    contact_phone             varchar(20),
    transport_access_score    double precision,
    transport_access_category varchar,
    elderly_score             double precision,
    elderly_category          varchar,
    family_score              double precision,
    family_category           varchar,
    price_category            varchar,
    address_id                integer
        constraint fk_offer_address_id_address
            references address
            on delete cascade,
    offer_type_id             integer
        constraint fk_offer_offer_type_id_offer_type
            references offer_type,
    property_type_id          integer
        constraint fk_offer_property_type_id_property_type
            references property_type,
    bathroom_type_id          integer
        constraint fk_offer_bathroom_type_id_bathroom_type
            references bathroom_type,
    renovation_type_id        integer
        constraint fk_offer_renovation_type_id_renovation_type
            references renovation_type,
    window_view_type_id       integer
        constraint fk_offer_window_view_type_id_window_view_type
            references window_view_type,
    parking_type_id           integer
        constraint fk_offer_parking_type_id_parking_type
            references parking_type,
    house_material_type_id    integer
        constraint fk_offer_house_material_type_id_house_material_type
            references house_material_type,
    heating_type_id           integer
        constraint fk_offer_heating_type_id_heating_type
            references heating_type,
    gas_type_id               integer
        constraint fk_offer_gas_type_id_gas_type
            references gas_type,
    sewerage_type_id          integer
        constraint fk_offer_sewerage_type_id_sewerage_type
            references sewerage_type,
    water_supply_type_id      integer
        constraint fk_offer_water_supply_type_id_water_supply_type
            references water_supply_type,
    seller_id                 integer
        constraint fk_offer_seller_id_seller
            references seller,
    land_type_id              integer
        constraint fk_offer_land_type_id_land_type
            references land_type,
    has_elevator              boolean,
    has_balcony               boolean,
    views_count               integer,
    creation_date_source      timestamp with time zone,
    views_history             jsonb,
    last_ten_days_views_count integer,
    daily_views_count         integer,
    source                    varchar,
    identical_urls            varchar(500)[],
    is_active                 boolean                  default true not null
);

create table address
(
    id                     serial
        constraint pk_address
            primary key,
    house_number           varchar,
    full_address           varchar,
    coordinates            geography(Point, 4326)
        constraint uq_address_coordinates
            unique,
    region_id              integer
        constraint fk_address_region_id_region
            references region,
    municipality_id        integer
        constraint fk_address_municipality_id_municipality
            references municipality,
    settlement_id          integer
        constraint fk_address_settlement_id_settlement
            references settlement,
    partnership_id         integer
        constraint fk_address_partnership_id_partnership
            references partnership,
    district_id            integer
        constraint fk_address_district_id_district
            references district,
    microdistrict_id       integer
        constraint fk_address_microdistrict_id_microdistrict
            references microdistrict,
    street_id              integer
        constraint fk_address_street_id_street
            references street,
    residential_complex_id integer
        constraint fk_address_residential_complex_id_residential_complex
            references residential_complex,
    search_vector          tsvector,
    super_municipality_id  integer
        constraint fk_address_super_municipality_id_super_municipality
            references super_municipality
);

create table property_type
(
    id   serial
        constraint pk_property_type
            primary key,
    name varchar
);

create table settlement
(
    id                 serial
        constraint pk_settlement
            primary key,
    name               varchar,
    full_name          varchar
        constraint uq_settlement_full_name
            unique,
    short_name         varchar,
    settlement_type_id integer
        constraint fk_settlement_settlement_type_id_settlement_type
            references settlement_type
);

alter table settlement
    owner to postgres;

create index ix_settlement_short_name
    on settlement (short_name);
    
create table address_infrastructure_link
(
    infrastructure_id integer not null
        constraint fk_address_infrastructure_link_infrastructure_id_infrastructure
            references infrastructure
            on delete cascade,
    address_id        integer not null
        constraint fk_address_infrastructure_link_address_id_address
            references address
            on delete cascade,
    distance          integer,
    constraint pk_address_infrastructure_link
        primary key (infrastructure_id, address_id)
);

alter table address_infrastructure_link
    owner to postgres;

create table infrastructure_type
(
    id   serial
        constraint pk_infrastructure_type
            primary key,
    name varchar
);

alter table infrastructure_type
    owner to postgres;


create table infrastructure
(
    id                     serial
        constraint pk_infrastructure
            primary key,
    name                   varchar,
    coordinates            geography(Point, 4326),
    infrastructure_type_id integer
        constraint fk_infrastructure_infrastructure_type_id_infrastructure_type
            references infrastructure_type,
    constraint uq_infrastructure_name_coordinates
        unique (name, coordinates)
);

alter table infrastructure
    owner to postgres;

create index idx_infrastructure_coordinates
    on infrastructure using gist (coordinates);    

    . В ответе ты должен вернуть ТОЛЬКО SQL для извелчения данных из этих таблиц исходя из вопроса. В запросе все названия начинай с большой буквы, т.е. Котедж, Евроремонт и т.д. Не добавляй к названиям административных объектов их тип т.е не Брянская область, а просто Брянская, не город Брянск, а просто Брянск. Всегда возвращай только первые 5 результатов. Если обращаешься к family_category или olderly_category или transport_access используй: medium, hight, low""",
        },
        {"role": "user", "content": "найди квартиру в брянске с площадью 50кв метров"},
    ],
)

# Обработка стрима
sql_query = response.choices[0].message.content
print(sql_query)
