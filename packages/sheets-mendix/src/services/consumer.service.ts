/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { Workbook } from '@univerjs/core';
import { Inject, IResourceLoaderService, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';

@OnLifecycle(LifecycleStages.Steady, ConsumerService)
export class ConsumerService {
    constructor(
        @Inject(IResourceLoaderService) private _resourceLoaderService: IResourceLoaderService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService

    ) {
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (workbook) {
            const snapshot = this._resourceLoaderService.saveWorkbook(workbook);
            console.error(snapshot);
        }
    }
}
