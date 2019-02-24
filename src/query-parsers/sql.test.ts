"use strict";

import Kepler from "../mediators/Kepler";
import { validateMediator, validateSQLTable } from "./sql";

test("remove special characters", () => {
  for (const mediator of Kepler) {
    try {
      if (mediator instanceof MediationEntity) {
        expect(validateMediator(mediator)).toBeCalled();
      } else if (mediator instanceof SQLTable) {
        expect(validateSQLTable(mediator)).toBeCalled();
      } else {
        throw new Error("Invalid type of mediator");
      }
    } catch (e) {
      expect(e).toBeUndefined();
    }
  }
});
