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

import type {
  CertificateSyncTarget,
  CertificateSyncTargetProvider,
  ExtensionContext,
} from '@podman-desktop/api';
import * as extensionApi from '@podman-desktop/api';

/**
 * Test Certificate Sync Provider
 *
 * This provider registers certificate sync targets that would normally be enabled.
 * When loaded as an external/user-installed extension, the trust model should
 * force these targets to be disabled with the reason:
 * "Extension not authorized for certificate sync"
 */
class TestCertificateSyncProvider implements CertificateSyncTargetProvider {
  /**
   * Get test sync targets.
   * Returns targets with enabled=true, but the registry will override
   * this to enabled=false for user-installed extensions.
   */
  async getTargets(): Promise<CertificateSyncTarget[]> {
    return [
      {
        id: 'test-target-1',
        name: 'Test Target 1 (External)',
        enabled: true,
      },
      {
        id: 'test-target-2',
        name: 'Test Target 2 (External)',
        enabled: true,
      },
      {
        id: 'test-target-disabled',
        name: 'Test Target (Already Disabled)',
        enabled: false,
        disabledReason: 'Intentionally disabled by provider',
      },
    ];
  }

  /**
   * Synchronize certificates to a target.
   * This should never be called for external extensions due to trust restrictions.
   */
  async synchronize(targetId: string, certificates: string[]): Promise<void> {
    // Log for debugging - this should never be reached for external extensions
    console.log(
      `[certificate-sync-provider-test] synchronize called for ${targetId} with ${certificates.length} certificates`,
    );
    console.log(
      '[certificate-sync-provider-test] WARNING: This should not happen for external extensions!',
    );

    // Simulate what would happen if sync was allowed
    await extensionApi.window.showInformationMessage(
      `Test sync to ${targetId}: Would sync ${certificates.length} certificates`,
    );
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
    '[certificate-sync-provider-test] Targets should appear DISABLED in Certificates Preferences if loaded as external extension',
  );
}

/**
 * Deactivates the extension.
 */
export function deactivate(): void {
  console.log('[certificate-sync-provider-test] Extension deactivated');
}
