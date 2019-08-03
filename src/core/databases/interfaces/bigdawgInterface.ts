import fetch from "node-fetch";
import logger, { categories } from "../../../logger";

const log = logger.child({
  category: categories.DATABASE_INTERFACE,
  interface: "bigdawg"
});

const bigdawgInterface = {
  assertConnection: url =>
    fetch(url, {
      method: "post",
      body: "bdcatalog(SELECT * FROM catalog.engines)"
    })
      .then(_ => true)
      .catch(e =>
        log
          .child({
            action: "asserting connection",
            error: e.stack || e
          })
          .error("Something went wrong while asserting the connection")
      ),

  query: async (url: string, query: string) => {
    if (!query) {
      throw new Error("No query issued to this interface");
    }

    return fetch(url, {
      method: "post",
      body: query
    })
      .then(res => res.text())
      .then(parseResponseToJSON)
      .catch(e =>
        log
          .child({
            action: "resolving query",
            error: e.stack || e,
            query
          })
          .error("Something went wrong while submiting a query to this interface")
      );
  }
};

const parseResponseToJSON = (results: string) => {
  const [firstRow, ...rest] = results.split("\n");
  const dimensions = firstRow.split("\t");
  const instances = rest.map(instance => instance.split("\t"));

  return dimensions.map((_, i) => {
    const instance = instances[i];
    return dimensions.reduce((aggr, curr, index) => ({ ...aggr, [curr]: instance[index] }), {});
  });
};

export default bigdawgInterface;
