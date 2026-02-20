-- biztos UTF-8 kliens
SET client_encoding TO 'UTF8';

-- psql meta-parancsokkal beinclude-olod a fájlokat
\echo Loading driver standings...
\ir driver_standings/driver_standings_1950_upsert.sql
\ir driver_standings/driver_standings_1951_upsert.sql
\ir driver_standings/driver_standings_2025_upsert.sql
\echo Done.
