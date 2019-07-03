import bigdawgInterface from "./bigdawgInterface";

test("it should assert connection", () =>
  bigdawgInterface
    .assertConnection("http://localhost:8080/bigdawg/query/")
    .then(res => expect(res).toBeTruthy()));

test("it should resolve a query", () =>
  bigdawgInterface
    .query(
      "http://localhost:8080/bigdawg/query/",
      "bdcatalog(SELECT * FROM catalog.engines)"
    )
    .then(res =>
      expect(res).toContainEqual({
        eid: "0",
        name: "postgres0",
        host: "bigdawg-postgres-catalog",
        port: "5400",
        connection_properties: "PostgreSQL 9.4.5"
      })
    ));
