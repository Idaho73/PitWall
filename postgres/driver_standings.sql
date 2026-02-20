CREATE TABLE IF NOT EXISTS driver_standings (
    id SERIAL PRIMARY KEY,
    season_year INTEGER NOT NULL,
    driver VARCHAR(100) NOT NULL,
    team VARCHAR(100) NOT NULL,
    points FLOAT DEFAULT 0,
    position INTEGER NOT NULL,
    last_updated TIMESTAMP DEFAULT NOW()
);

ALTER TABLE driver_standings ADD CONSTRAINT uix_driver_standings_season_driver UNIQUE (season_year, driver);