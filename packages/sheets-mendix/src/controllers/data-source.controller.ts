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
import { DesktopLogService, Disposable, DisposableCollection, ICommandService, Inject, Injector, IUniverInstanceService, LifecycleStages, ObjectMatrix, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import type { ISetRangeValuesCommandParams, ISheetLocation } from '@univerjs/sheets';
import { INTERCEPTOR_POINT, SetRangeValuesCommand, SheetInterceptorService } from '@univerjs/sheets';
import { throttleTime } from 'rxjs';
import { IRenderManagerService } from '@univerjs/engine-render';
import type { ISetSheetsFilterRangeMutationParams } from '@univerjs/sheets-filter';
import { SetSheetsFilterRangeMutation } from '@univerjs/sheets-filter';
import { MendixViewModel } from '../model/mendix-view.model';

@OnLifecycle(LifecycleStages.Rendered, SheetsMendixDataSourceController)
export class SheetsMendixDataSourceController extends Disposable {
    constructor(
        @Inject(Injector) private _injector: Injector,
        @Inject(DesktopLogService) private _logService: DesktopLogService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(MendixViewModel) private _mendixViewModel: MendixViewModel) {
        super();
        this._init();
    }

    private _init() {
        const ds = new DisposableCollection();

        this._interceptorForCell(ds);
        this._subscribeToViewModel(ds);
        ds.add(this._mendixViewModel);

        this.disposeWithMe(ds);
    }

    private _subscribeToViewModel(ds: DisposableCollection) {
        // throttle 500ms delay to simulate async
        ds.add(this._mendixViewModel.onReq$.pipe(
            throttleTime(500, undefined, { leading: false, trailing: true })
        ).subscribe(() => {
            // loop on pending requests
            const rangeMatrix = new ObjectMatrix<Nullable<ICellData>>();
            for (const rcString of this._mendixViewModel) {
                let value = null;
                const [row, col] = rcString.split('-').map(Number);

                if (row === 0 && col === 0) {
                    value = 'id';
                }
                if (row === 0 && col === 1) {
                    value = 'name';
                }
                if (col === 0 && row > 0) {
                    value = `row${row + 1}`;
                }
                if (col === 1 && row > 0) {
                    value = `name-${row + 1}`;
                }

                // mock fetching data from server into result cache
                this._mendixViewModel.set(row, col, value);
                rangeMatrix.setValue(row, col, { v: value });
            }

            // rewrite to model
            const workbook = this._univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET);
            const unitId = workbook?.getUnitId();
            if (unitId) {
                const sheetId = workbook?.getActiveSheet().getSheetId();
                if (sheetId) {
                    const params: ISetRangeValuesCommandParams = {
                        unitId,
                        subUnitId: sheetId,
                        range: rangeMatrix.getRange(),
                        value: rangeMatrix.getMatrix(),
                    };
                    this._commandService.executeCommand(SetRangeValuesCommand.id, params);
                }
            }
        }));
    }

    private _interceptorForCell(ds: DisposableCollection) {
        const vm = this._mendixViewModel;
        const sis = this._injector.get(SheetInterceptorService);

        ds.add(sis.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
            priority: 105,
            handler(cell, location: ISheetLocation, next: (v: Nullable<ICellData>) => Nullable<ICellData>) {
                if (location.col > 1) {
                    return next(cell);
                }
                if (cell?.v) {
                    return next(cell);
                }
                const value = vm.get(location.row, location.col);
                if (value === undefined) {
                    return next({ v: 'Loading...' });
                }

                // loaded and fallback to default
                return next(cell);
            },
        }));

        /* ds.add(sis.intercept(INTERCEPTOR_POINT.ROW_FILTERED, {
            priority: 100,
            handler(isFilter, location, next) {
                if (location.row === 8) {
                    return true;
                }
                return next(isFilter);
            },
        })); */
    }
}
