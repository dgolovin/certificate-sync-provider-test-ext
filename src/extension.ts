/**********************************************************************
 * Copyright (C) 2026 Red Hat, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * SPDX-License-Identifier: Apache-2.0
 ***********************************************************************/

import type {
  CertificateSyncTarget,
  CertificateSyncTargetProvider,
  ExtensionContext,
  Progress,
} from '@podman-desktop/api';
import * as extensionApi from '@podman-desktop/api';

/** Number of simulated certificates to sync */
const SIMULATED_CERT_COUNT = 77;

/** Delay in ms between each simulated certificate upload */
const UPLOAD_DELAY_MS = 500;

/**
 * Helper to sleep for a given number of milliseconds.
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Test Certificate Sync Provider
 *
 * This provider registers certificate sync targets.
 * When loaded as an external/user-installed extension, these targets
 * should NOT appear in the UI because untrusted extensions are filtered out.
 */
class TestCertificateSyncProvider implements CertificateSyncTargetProvider {
  /**
   * Get test sync targets.
   * These targets should only be visible if the extension is trusted (preinstalled).
   */
  async getTargets(): Promise<CertificateSyncTarget[]> {
    return [
      {
        id: 'test-target-success',
        name: 'Test Target Success',
      },
      {
        id: 'test-target-fail',
        name: 'Test Target Fail',
      },
    ];
  }

  /**
   * Synchronize certificates to a target.
   * Simulates syncing 77 certificates with progress reporting.
   */
  async synchronize(targetId: string, _certificates: string[]): Promise<void> {
    console.log(
      `[certificate-sync-provider-test] synchronize called for ${targetId}`,
    );

    await extensionApi.window.withProgress(
      {
        location: extensionApi.ProgressLocation.TASK_WIDGET,
        title: `Synchronizing certificates to ${targetId}`,
      },
      async (progress: Progress<{ message?: string; increment?: number }>) => {
        await this.doSynchronize(targetId, progress);
      },
    );
  }

  /**
   * Perform the simulated certificate synchronization with progress reporting.
   * Note: progress.report({ increment }) SETS the progress value, doesn't add to it.
   */
  private async doSynchronize(
    targetId: string,
    progress: Progress<{ message?: string; increment?: number }>,
  ): Promise<void> {
    const totalCerts = SIMULATED_CERT_COUNT;
    const shouldFail = targetId === 'test-target-fail';
    const failAtCert = Math.floor(totalCerts / 2); // Fail at 50%
    let currentPercent = 0;

    try {
      // Simulate creating anchors directory (0% -> 5%)
      currentPercent = 5;
      progress.report({ message: `Creating anchors directory on ${targetId}`, increment: currentPercent });
      await sleep(100);

      // Simulate uploading each certificate (5% -> 85%)
      for (let i = 0; i < totalCerts; i++) {
        // Update progress at the START of each certificate upload
        currentPercent = 5 + Math.floor(((i + 1) / totalCerts) * 80);
        progress.report({
          message: `(${i + 1}/${totalCerts}) Uploading certificate to ${targetId}`,
          increment: currentPercent,
        });

        // Simulate upload delay
        await sleep(UPLOAD_DELAY_MS);

        // Throw error at 50% for the fail target
        if (shouldFail && i === failAtCert) {
          throw new Error(`Simulated failure: Connection to ${targetId} lost while uploading certificate ${i + 1}`);
        }
      }

      // Simulate updating CA trust store (85% -> 90%)
      progress.report({ message: `Updating CA trust store on ${targetId}`, increment: 90 });
      await sleep(200);

      // Simulate restarting services (90% -> 95%)
      progress.report({ message: `Restarting services on ${targetId}`, increment: 95 });
      await sleep(200);

      // Complete (100%)
      progress.report({ message: `Synchronized ${totalCerts} certificates to ${targetId}`, increment: 100 });
    } finally {
      // Mark task as complete
      progress.report({ increment: -1 });
    }
  }
}

/**
 * Activates the extension.
 */
export async function activate(context: ExtensionContext): Promise<void> {
  console.log('[certificate-sync-provider-test] Starting extension');

  const provider = new TestCertificateSyncProvider();

  // Register the certificate sync target provider
  const registration = extensionApi.certificates.registerSyncTargetProvider(
    'test-external-provider',
    provider,
  );

  context.subscriptions.push(registration);

  console.log(
    '[certificate-sync-provider-test] Registered certificate sync provider "test-external-provider"',
  );
  console.log(
    '[certificate-sync-provider-test] Targets should NOT appear in Certificates Preferences if loaded as external extension (untrusted)',
  );
}

/**
 * Deactivates the extension.
 */
export function deactivate(): void {
  console.log('[certificate-sync-provider-test] Extension deactivated');
}
