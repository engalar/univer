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

import type { Dependency } from '@univerjs/core';
import { DependentOn, DesktopLogService, Inject, Injector, Plugin, UniverInstanceType } from '@univerjs/core';
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import { CustomerService } from './services/customer.service';
import { SheetsMendixDataSourceController } from './controllers/data-source.controller';
import { MendixViewModel } from './model/mendix-view.model';

@DependentOn(UniverSheetsUIPlugin)
export class SheetsMendixPlugin extends Plugin {
    static override pluginName = 'SHEETS_MENDIX_PLUGIN';
    static override type = UniverInstanceType.UNIVER_SHEET;

    constructor(
        private readonly _config = {},
        @Inject(Injector) override readonly _injector: Injector
    ) {
        super();
    }

    override onStarting(injector: Injector): void {
        this._initDependencies(injector);
    }

    private _initDependencies(injector: Injector) {
        const dependencies: Dependency[] = [
            [CustomerService],
            [SheetsMendixDataSourceController],
            [MendixViewModel],
            [DesktopLogService],
        ];
        dependencies.forEach((d) => {
            injector.add(d);
        });
    }
}
