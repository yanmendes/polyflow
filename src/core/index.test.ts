import { runQuery } from ".";
import { Mediator } from "../models/polyflow";
import bigdawgInterface from "./databases/interfaces/bigdawgInterface";
jest.mock("../models/polyflow");
jest.mock("./databases/interfaces/bigdawgInterface");

describe("run query BigDAWG query", () => {
  beforeEach(() => spyOn(bigdawgInterface, "query").and.returnValue(Promise.resolve("ok!")));
  afterEach(() => jest.clearAllMocks());

  it("should throw with mediators from different data sources", () => {
    spyOn(Mediator, "find").and.returnValue(
      Promise.resolve([fooMediator, { slug: "bar", dataSource: { uri: "not-the-same-uri" } }])
    );

    return expect(runQuery("bdrel(select * from foo[bar] bar[zaz])")).rejects.toThrowError(
      /uses mediators with different data sources/
    );
  });

  it("should throw with no valid mediators", () => {
    spyOn(Mediator, "find").and.returnValue(Promise.resolve([fooMediator]));

    return expect(runQuery("bdrel(select * from bar[zaz])")).rejects.toThrowError(
      /is not a valid query or mediator does not exist/
    );
  });

  it("should throw with an invalid mediator", async () => {
    spyOn(Mediator, "find").and.returnValue(Promise.resolve([fooMediator]));
    return expect(runQuery("bdrel(select * from foo[bar], bar[zaz])")).rejects.toThrow(
      /__bar___zaz__ not found in existing mediators/
    );
  });

  it("should parse with just one valid mediator", async () => {
    spyOn(Mediator, "find").and.returnValue(Promise.resolve([fooMediator]));
    await runQuery("bdrel(select * from foo[bar])");
    return expect(bigdawgInterface.query).toHaveBeenCalledWith(
      fooMediator.dataSource.uri,
      "bdrel(SELECT * FROM ( SELECT * FROM local_schema_table as lst ) as table_0)"
    );
  });

  it("should parse with multiple valid mediators", async () => {
    spyOn(Mediator, "find").and.returnValue(Promise.resolve([fooMediator, zazMediator]));
    await runQuery("bdrel(select * from foo[bar], zaz[bar])");
    expect(bigdawgInterface.query).toHaveBeenCalledWith(
      fooMediator.dataSource.uri,
      "bdrel(SELECT * FROM ( SELECT * FROM local_schema_table as lst ) as table_0, ( SELECT * FROM local_schema_table as lst ) as table_1)"
    );
  });
});

const fooMediator = {
  slug: "foo",
  dataSource: {
    type: "bigdawg",
    uri: "http://localhost:8080/query"
  },
  entities: [
    {
      slug: "bar",
      entityMapper: {
        name: "local_schema_table",
        alias: "lst"
      }
    }
  ]
};

const zazMediator = {
  slug: "zaz",
  dataSource: {
    type: "bigdawg",
    uri: "http://localhost:8080/query"
  },
  entities: [
    {
      slug: "bar",
      entityMapper: {
        name: "local_schema_table",
        alias: "lst"
      }
    }
  ]
};
