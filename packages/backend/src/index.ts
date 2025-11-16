import Fastify from "fastify";
import autoload from "@fastify/autoload";
import axios from "fastify-axios";
import jwt from "@fastify/jwt";
import "dotenv/config";

export type App = ReturnType<typeof buildApp>;

function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.register(axios);

  // app.register(jwt, {
  //   secret: process.env.JWT_SECRET,
  // });

  app.register(autoload, {
    dir: `${__dirname}/plugins`,
  });

  app.get("/my/:userId/trips", async (request, reply) => {
    const userId = (request.params as any).userId;

    const tripsResult = await app.db.query(
      `select ID, DESTINATION, START_DATE, END_DATE from PROD.PUBLIC.TRIPS where USER_ID = ?`,
      [userId]
    );

    reply.send(
      await Promise.all(
        tripsResult.data.map(async (r) => {
          const placesResult = await app.db.query(
            `select ID, NAME, LOCATION, STATUS, SCHEDULED_TIME, TYPE from PROD.PUBLIC.PLACES where TRIP_ID = ?`,
            [r[0]]
          );
          const dailyTimesResult = await app.db.query(
            `select DATE, TIMES from PROD.PUBLIC.DAILY_TRAVEL_TIMES where TRIP_ID = ?`,
            [r[0]]
          );

          return {
            id: r[0],
            details: {
              destination: r[1],
              startDate: r[2] ? new Date(parseFloat(r[2]) * 1000 * 60 * 60 * 24).toISOString().split("T")[0] : null,
              endDate: r[3] ? new Date(parseFloat(r[3]) * 1000 * 60 * 60 * 24).toISOString().split("T")[0] : null,
            },
            places: placesResult.data.map((pr) => ({
              id: pr[0],
              name: pr[1],
              location: JSON.parse(pr[2]),
              status: pr[3],
              scheduledTime: new Date(parseFloat(pr[4]) * 1000).toISOString(),
              type: pr[5],
            })),
            dailyTravelTimes: Object.fromEntries(
              dailyTimesResult.data.map((dr) => [
                new Date(parseFloat(dr[0]) * 1000 * 60 * 60 * 24)
                  .toISOString()
                  .split("T")[0],
                JSON.parse(dr[1]),
              ])
            ),
          };
        })
      )
    );
  });

  app.delete("/places/:placeId", async (request, reply) => {
    const placeId = (request.params as any).placeId;

    await app.db.query("delete from PROD.PUBLIC.PLACES where ID = ?", [
      placeId,
    ]);

    reply.send({ status: "success" });
  });

  app.post("/trips", async (request, reply) => {
    const trip = (request.body as any).itineraryData;
    const userId = (request.body as any).userId;

    const tripId = crypto.randomUUID();

    await app.db.query(
      "insert into PROD.PUBLIC.TRIPS (ID, DESTINATION, START_DATE, END_DATE, USER_ID) VALUES (?, ?, ?, ?, ?)",
      [
        tripId,
        trip.details.destination,
        trip.details.startDate,
        trip.details.endDate,
        userId,
      ]
    );

    for (const place of trip.places) {
      await app.db.query(
        "insert into PROD.PUBLIC.PLACES (ID, NAME, LOCATION, STATUS, SCHEDULED_TIME, TYPE, TRIP_ID) select ?, ?, parse_json(?), ?, ?, ?, ?",
        [
          crypto.randomUUID(),
          place.name,
          JSON.stringify(place.location),
          place.status,
          place.scheduledTime,
          place.type,
          tripId,
        ]
      );
    }

    for (const [date, times] of Object.entries(trip.dailyTravelTimes)) {
      await app.db.query(
        "insert into PROD.PUBLIC.DAILY_TRAVEL_TIMES (ID, DATE, TIMES, TRIP_ID) select ?, ?, parse_json(?), ?",
        [crypto.randomUUID(), date, JSON.stringify(times), tripId]
      );
    }

    reply.send({ status: "success" });
  });

  app.put("/trips/:tripId", async (request, reply) => {
    const tripId = (request.params as any).tripId;
    const trip = (request.body as any).itineraryData;

    await app.db.query(
      "update PROD.PUBLIC.TRIPS set DESTINATION = ?, START_DATE = ?, END_DATE = ? where ID = ?",
      [
        trip.details.destination,
        trip.details.startDate,
        trip.details.endDate,
        tripId,
      ]
    );

    for (const place of trip.places) {
      await app.db.query(
        "update PROD.PUBLIC.PLACES (ID, NAME, LOCATION, STATUS, SCHEDULED_TIME, TYPE, TRIP_ID) select ?, ?, parse_json(?), ?, ?, ?, ?",
        [
          crypto.randomUUID(),
          place.name,
          JSON.stringify(place.location),
          place.status,
          place.scheduledTime,
          place.type,
          tripId,
        ]
      );
    }

    for (const [date, times] of Object.entries(trip.dailyTravelTimes)) {
      await app.db.query(
        "insert into PROD.PUBLIC.DAILY_TRAVEL_TIMES (ID, DATE, TIMES, TRIP_ID) select ?, ?, parse_json(?), ?",
        [crypto.randomUUID(), date, JSON.stringify(times), tripId]
      );
    }

    reply.send({ status: "success" });
  });

  return app;
}

const fastify = buildApp();

fastify.listen(
  { port: process.env.PORT || 3000, host: "0.0.0.0" },
  function (err, address) {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  }
);
