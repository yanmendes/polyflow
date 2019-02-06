'use strict'

import Kepler from '../mediators/Kepler'
import { validateMediator } from './sql'

test('remove special characters', () => {
  for (const mediator of Kepler) {
    try {
      expect(validateMediator(mediator)).toBeCalled()
    } catch (e) {
      expect(e).toBeUndefined()
    }
  }
})
