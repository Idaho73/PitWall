# app/services/lap_analysis.py
import fastf1
import fastf1.plotting as f1plot


def get_lap_comparison(
    season: int,
    grand_prix: str,
    session_code: str,
    driver1: str,
    driver2: str,
):
    session = fastf1.get_session(season, grand_prix, session_code)
    session.load()

    lap1 = session.laps.pick_drivers(driver1).pick_fastest()
    lap2 = session.laps.pick_drivers(driver2).pick_fastest()

    if lap1 is None or lap2 is None:
        raise ValueError("Nem találtam leggyorsabb kört valamelyik pilótánál.")

    tel1 = lap1.get_car_data().add_distance()
    tel2 = lap2.get_car_data().add_distance()

    color1 = f1plot.get_team_color(lap1["Team"], session=session)
    color2 = f1plot.get_team_color(lap2["Team"], session=session)

    data = {
        "event": str(session.event["EventName"]),
        "year": int(session.event.year),
        "session": session.name,
        "driver1": {
            "code": driver1,
            "team": str(lap1["Team"]),
            "color": color1,
            "distance": tel1["Distance"].tolist(),
            "speed": tel1["Speed"].tolist(),
        },
        "driver2": {
            "code": driver2,
            "team": str(lap2["Team"]),
            "color": color2,
            "distance": tel2["Distance"].tolist(),
            "speed": tel2["Speed"].tolist(),
        },
    }

    return data
