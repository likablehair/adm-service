import { test } from 'vitest';
import AdmRobotProcessAutomationManager from 'src/managers/admRobotProcessAutomation.manager';

test('MRN List', { timeout: 200000 }, async () => {
  const dichiarante = import.meta.env.VITE_DICHIARANTE_TEST;
  const admUsername = import.meta.env.VITE_ADM_USERNAME;
  const admPassword = import.meta.env.VITE_ADM_PASSWORD;

  if (!dichiarante) {
    console.error('Dichiarante not found');
    return;
  }

  if (!admUsername) {
    console.error('ADM Username not found');
    return;
  }

  if (!admPassword) {
    console.error('ADM Password not found');
    return;
  }

  const admRPA = new AdmRobotProcessAutomationManager();
  await admRPA.getMRNList({
    dichiarante,
    dateFrom: new Date('2024-11-29'),
    security: {
      username: admUsername,
      password: admPassword,
    },
    type: 'import',
  });

  await admRPA.getMRNList({
    dichiarante,
    dateFrom: new Date('2024-11-29'),
    security: {
      username: admUsername,
      password: admPassword,
    },
    type: 'export',
  });
});

test('Print MRN Export Status', { timeout: 200000 }, async () => {
  const mrn = import.meta.env.VITE_MRN_IVISTO_TEST;

  if (!mrn) {
    console.error('MRN not found');
    return;
  }

  const admRPA = new AdmRobotProcessAutomationManager();
  const result = await admRPA.printMrnExportStatus({
    mrn,
  });

  console.log(result);
});
