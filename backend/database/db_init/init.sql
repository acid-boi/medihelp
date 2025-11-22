
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

CREATE INDEX idx_generic_name_trgm
ON generic_medicines USING gin (generic_name gin_trgm_ops);


COPY generic_medicines
FROM '/csv_data/genericmedicines.csv'
DELIMITER ',' CSV HEADER;

COPY medicines
FROM '/csv_data/medicines.csv'
DELIMITER ',' CSV HEADER;

