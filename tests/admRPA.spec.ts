import { test } from 'vitest';
import AdmRobotProcessAutomationManager from 'src/managers/admRobotProcessAutomation.manager';

test('MRN List', { timeout: 200000 }, async () => {
  const dichiarante = import.meta.env.VITE_DICHIARANTE_TEST;
  const admUsername = import.meta.env.VITE_ADM_USERNAME;
  const admPassword = import.meta.env.VITE_ADM_PASSWORD;

  const admRPA = new AdmRobotProcessAutomationManager();
  const cookies = await admRPA.getMRNList({
    dichiarante,
    dateFrom: new Date('2024-11-11'),
    security: {
      username: admUsername,
      password: admPassword,
    },
  });

  console.log(cookies);
});
