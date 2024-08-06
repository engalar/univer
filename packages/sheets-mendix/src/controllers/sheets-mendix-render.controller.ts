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

import type { IDisposable, IRange, Workbook } from '@univerjs/core';
import { ICommandService, Inject, Injector, RxDisposable, ThemeService } from '@univerjs/core';
import type { IRenderContext, IRenderModule, SpreadsheetSkeleton } from '@univerjs/engine-render';
import { IRenderManagerService } from '@univerjs/engine-render';
import { INTERCEPTOR_POINT, SheetInterceptorService } from '@univerjs/sheets';
import type { FilterModel } from '@univerjs/sheets-filter';
import type { SelectionShape } from '@univerjs/sheets-ui';
import { ISheetSelectionRenderService, SheetSkeletonManagerService, SheetsRenderService } from '@univerjs/sheets-ui';

import { FILTER_ICON_PADDING, FILTER_ICON_SIZE, SheetsFilterButtonShape } from '../views/widgets/filter-button.shape';

const SHEETS_FILTER_BUTTON_Z_INDEX = 5000;

export class SheetsMendixRenderController extends RxDisposable implements IRenderModule {
    private _filterRangeShape: SelectionShape | null = null;
    private _buttonRenderDisposable: IDisposable | null = null;
    private _filterButtonShapes: SheetsFilterButtonShape[] = [];

    constructor(
        private readonly _context: IRenderContext<Workbook>,
        @Inject(Injector) private readonly _injector: Injector,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @Inject(ThemeService) private readonly _themeService: ThemeService,
        @Inject(SheetInterceptorService) private readonly _sheetInterceptorService: SheetInterceptorService,
        @Inject(SheetsRenderService) private _sheetsRenderService: SheetsRenderService,
        @ICommandService private readonly _commandService: ICommandService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ISheetSelectionRenderService private readonly _selectionRenderService: ISheetSelectionRenderService
    ) {
        super();

        // this._initRenderer();
        this._renderFirstButton();
    }

    private _renderFirstButton(): void {
        const { unitId, scene } = this._context;
        const currentRenderer = this._renderManagerService.getRenderById(unitId);
        if (!currentRenderer) {
            return;
        }
        const skeleton = this._sheetSkeletonManagerService.getCurrentSkeleton();
        if (skeleton) {
            // Too little space to draw the button, just ignore it.
            const { startX, startY, endX, endY } = skeleton.getCellByIndex(0, 0);
            const cellWidth = endX - startX;
            const cellHeight = endY - startY;
            const iconStartX = endX - FILTER_ICON_SIZE - FILTER_ICON_PADDING;
            const iconStartY = endY - FILTER_ICON_SIZE - FILTER_ICON_PADDING;
            let buttonShape = this._injector.createInstance(SheetsFilterButtonShape, 'key123', {
                left: iconStartX,
                top: iconStartY,
                height: FILTER_ICON_SIZE,
                width: FILTER_ICON_SIZE,
                zIndex: SHEETS_FILTER_BUTTON_Z_INDEX,
                cellHeight,
                cellWidth,
                filterParams: { unitId, subUnitId: 'xxx', col: 0, hasCriteria: true },
            });
            scene.addObject(buttonShape);
            scene.makeDirty();

            setTimeout(() => {
                buttonShape.dispose();
                buttonShape = this._injector.createInstance(SheetsFilterButtonShape, 'key123', {
                    left: iconStartX * 3,
                    top: iconStartY,
                    height: FILTER_ICON_SIZE,
                    width: FILTER_ICON_SIZE,
                    zIndex: SHEETS_FILTER_BUTTON_Z_INDEX,
                    cellHeight,
                    cellWidth,
                    filterParams: { unitId, subUnitId: 'xxx', col: 0, hasCriteria: true },
                });
                scene.addObject(buttonShape);
                scene.makeDirty();
            }, 4000);
        }
    }

    private _interceptCellContent(range: IRange): void {
        const { startRow, startColumn, endColumn } = range;
        this._buttonRenderDisposable = this._sheetInterceptorService.intercept(INTERCEPTOR_POINT.CELL_CONTENT, {
            handler: (cell, pos, next) => {
                const { row, col } = pos;
                if (row !== startRow || col < startColumn || col > endColumn) {
                    return next(cell);
                }

                return next({
                    ...cell,
                    // @ts-ignore
                    fontRenderExtension: {
                        // @ts-ignore
                        ...cell?.fontRenderExtension,
                        rightOffset: FILTER_ICON_SIZE,
                    },
                });
            },
            priority: 10,
        });
    }

    private _disposeRendering(): void {
        this._filterRangeShape?.dispose();
        this._filterButtonShapes.forEach((s) => s.dispose());
        this._buttonRenderDisposable?.dispose();

        this._filterRangeShape = null;
        this._buttonRenderDisposable = null;
        this._filterButtonShapes = [];
    }
}
