from fastapi import APIRouter, Response
import fastf1
import fastf1.plotting
import matplotlib.pyplot as plt
import io
from utils.logger import logger

router = APIRouter(prefix="/api", tags=["plot"])

@router.get("/position-changes")
def position_changes(year: int, grand_prix: str, session_type: str = "R"):
    logger.info(f"year: {year}, grand_prix: {grand_prix}, session_type: {session_type}")
    # FastF1 + plotting setup
    fastf1.plotting.setup_mpl(mpl_timedelta_support=False, color_scheme='fastf1')

    session = fastf1.get_session(year, grand_prix, session_type.upper())
    session.load(telemetry=False, weather=False)

    fig, ax = plt.subplots(figsize=(8.0, 4.9))

    for drv in session.drivers:
        drv_laps = session.laps.pick_drivers(drv)

        abb = drv_laps['Driver'].iloc[0]
        style = fastf1.plotting.get_driver_style(
            identifier=abb,
            style=['color', 'linestyle'],
            session=session
        )

        ax.plot(drv_laps['LapNumber'], drv_laps['Position'], label=abb, **style)

    ax.set_ylim([20.5, 0.5])
    ax.set_yticks([1, 5, 10, 15, 20])
    ax.set_xlabel('Lap')
    ax.set_ylabel('Position')
    ax.legend(bbox_to_anchor=(1.0, 1.02))
    plt.tight_layout()

    # PNG buffer
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=150, bbox_inches="tight")
    plt.close(fig)
    buf.seek(0)

    return Response(content=buf.getvalue(), media_type="image/png")
