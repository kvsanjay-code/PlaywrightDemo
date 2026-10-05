/**
 * grain-inspection.ts
 *
 * Form values used to fill out a PEMS Grain and Plant Product inspection.
 * Ported from the standalone PEMS automation project.
 */

export const grainInspection = {
  flowPath: {
    result: 'Passed',
    resultTime: '07:00',
  },
  outcome: {
    outcomeType: 'Packaged',
    rate: '2.25L/33.33 tonnes',
  },
  lineResult: {
    line: '1',
    weightPerPackage: '10',
    unit: 'KILOGRAM',
    result: 'Passed',
    // The test REXes have 10 packages on line 1.
    expectedLineWeight: '100',
  },
  timeEntry: {
    start: '07:00',
    end: '07:15',
  },
};
