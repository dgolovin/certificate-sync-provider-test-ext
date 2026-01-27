/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import { vi, type Mock } from 'vitest';

export const certificates: {
  registerSyncTargetProvider: Mock;
  getCertificates: Mock;
  onDidChangeCertificates: Mock;
} = {
  registerSyncTargetProvider: vi.fn().mockReturnValue({ dispose: vi.fn() }),
  getCertificates: vi.fn().mockResolvedValue([]),
  onDidChangeCertificates: vi.fn().mockReturnValue({ dispose: vi.fn() }),
};

export const window = {
  showInformationMessage: vi.fn(),
  showWarningMessage: vi.fn(),
  showErrorMessage: vi.fn(),
  withProgress: vi.fn().mockImplementation(async (_options: unknown, task: () => Promise<unknown>) => task()),
};

export const commands = {
  registerCommand: vi.fn().mockReturnValue({ dispose: vi.fn() }),
};

export const ProgressLocation = {
  TASK_WIDGET: 'TASK_WIDGET',
};

export type ExtensionContext = {
  subscriptions: { dispose: () => void }[];
};

export type CertificateSyncTarget = {
  id: string;
  name: string;
};

export type CertificateSyncTargetProvider = {
  getTargets(): Promise<CertificateSyncTarget[]>;
  synchronize(targetId: string, certificates: string[]): Promise<void>;
};
