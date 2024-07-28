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

import type { ICellData, Nullable, Workbook } from '@univerjs/core';
import { Disposable, Inject, Injector, IResourceLoaderService, IUniverInstanceService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import type { ISheetLocation } from '@univerjs/sheets';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';

@OnLifecycle(LifecycleStages.Starting, ConsumerService)
export class ConsumerService extends Disposable {
    constructor(
        @Inject(IResourceLoaderService) private _resourceLoaderService: IResourceLoaderService,
        @Inject(IUniverInstanceService) private _univerInstanceService: IUniverInstanceService, @Inject(Injector) private _injector: Injector
    ) {
        super();
        this._init();
    }

    private _init() {
        this._interceptorForCell();
        this._interceptorForResouce();
    }

    private _interceptorForResouce() {
        const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        if (workbook) {
            const snapshot = this._resourceLoaderService.saveWorkbook(workbook);
            console.error(snapshot);
        }
    }

    private _interceptorForCell() {
        const sis = this._injector.get(SheetInterceptorService);
        this.disposeWithMe(sis.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
            priority: 100,
            handler(_cell, location: ISheetLocation, next: (v: Nullable<ICellData>) => Nullable<ICellData>) {
                if (location.row === 0 && location.col === 0) {
                    return next({ v: 'id' });
                }
                if (location.row === 0 && location.col === 1) {
                    return next({ v: 'name' });
                }
                if (location.col === 0 && location.row > 0 && location.row < 10) {
                    return next({ v: `row${location.row}` });
                }
                if (location.col === 1 && location.row > 0 && location.row < 10) {
                    return next({ v: `name-${location.row}` });
                }

                return next();
            },
        }));

        this.disposeWithMe(sis.intercept(INTERCEPTOR_POINT.ROW_FILTERED, {
            priority: 100,
            handler(isFilter, location, next) {
                if (location.row === 8) {
                    return true;
                }
                return next(isFilter);
            },
        }));
    }
}
