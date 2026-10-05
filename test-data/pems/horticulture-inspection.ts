/**
 * horticulture-inspection.ts
 *
 * Form values used to fill out a PEMS Horticulture inspection.
 * Ported from the standalone PEMS automation project.
 */

export const horticultureInspection = {
  placeOfOrigin: 'Australia',
  flowPath: {
    result: 'Passed',
    resultTime: '07:00',
  },
  outcome: {
    samplingRate: '2 % (two percent)',
  },
  lineResult: {
    line: '1',
    sampled: '3',
    result: 'Passed',
  },
  timeEntry: {
    start: '07:00',
    end: '07:15',
  },
};
