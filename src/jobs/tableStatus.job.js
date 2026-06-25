import cron from "node-cron";
import Table from "../models/table.model.js";

cron.schedule("0 * * * *", async () => {
  const twentyFourHoursAgo = new Date(
    Date.now() - 24 * 60 * 60 * 1000
  );

  await Table.updateMany(
    {
      status: "occupied",
      updatedAt: { $lt: twentyFourHoursAgo }
    },
    {
      $set: {
        status: "vacant"
      }
    }
  );

  console.log("Expired occupied tables released");
});