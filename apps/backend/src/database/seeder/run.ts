import { runSeeders } from "typeorm-extension";
import dataSource from "../../data-source";

async function run() {
  console.log("1. Initializing DataSource...");
  await dataSource.initialize();
  console.log("2. DataSource initialized");

  console.log("3. Running seeders...");
  await runSeeders(dataSource);
  console.log("4. Seeders completed");

  await dataSource.destroy();
  console.log("5. DataSource destroyed");
}

run()
  .then(() => {
    console.log("Seeded completed..!!");
  })
  .catch((e) => {
    console.log("Error in seeding:- ", e);
  });
