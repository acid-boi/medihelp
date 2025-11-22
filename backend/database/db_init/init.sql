
CREATE EXTENSION IF NOT EXISTS pg_trgm;


CREATE TABLE generic_medicines (
    sr_no INTEGER,
    drug_code INTEGER,
    generic_name TEXT,
    unit_size TEXT,
    mrp NUMERIC,
    group_name TEXT
);

CREATE TABLE medicines (
    id INTEGER,
    name TEXT,
    price NUMERIC,
    is_discontinued BOOLEAN,
    manufacturer_name TEXT,
    type TEXT,
    pack_size_label TEXT,
    short_composition1 TEXT,
    short_composition2 TEXT
);

CREATE TABLE stores (
    id INTEGER PRIMARY KEY,
    contact_person TEXT,
    contact_number TEXT,
    store_code TEXT,
    pin_code INTEGER,
    state_id INTEGER,
    district_id INTEGER,
    state_name TEXT,
    district_name TEXT,
    kendra_address TEXT,
    latitude TEXT,
    longitude TEXT,
    status INTEGER,
    s2_cell_id_level_15 BIGINT,
    s2_cell_id_level_14 BIGINT,
    s2_cell_id_level_13 BIGINT,
    s2_cell_id_level_12 BIGINT
);

COPY stores
FROM '/csv_data/stores.csv'
DELIMITER ',' CSV HEADER;


CREATE INDEX idx_generic_name_trgm
ON generic_medicines USING gin (generic_name gin_trgm_ops);


COPY generic_medicines
FROM '/csv_data/genericmedicines.csv'
DELIMITER ',' CSV HEADER;

COPY medicines
FROM '/csv_data/medicines.csv'
DELIMITER ',' CSV HEADER;

