import { getContexts } from ".";

test("should get query context at root level", () => {
  expect(getContexts("mediator[foo]")).toContain("mediator");
});
