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

import { IUniverInstanceService, UniverInstanceType, type Workbook } from '@univerjs/core';
import { useObservable } from '@univerjs/ui';
import { useDependency } from '@univerjs/core';
import { of } from 'rxjs';

export function useActiveWorkbook(): Workbook | null {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const workbook = useObservable(() => univerInstanceService.getCurrentTypeOfUnit$<Workbook>(UniverInstanceType.UNIVER_SHEET), undefined, undefined, []);
    return workbook ?? null;
}

export function useActiveWorksheet(workbook?: Workbook | null) {
    const worksheet = useObservable(() => workbook?.activeSheet$ ?? of(null), undefined, undefined, [workbook]);
    return worksheet;
}
