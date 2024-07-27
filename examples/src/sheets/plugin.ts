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

import type { DependencyOverride } from '@univerjs/core';
import { DependentOn, ICommandService, mergeOverrideWithDependencies, Plugin, UniverInstanceType } from '@univerjs/core';
import type { Dependency } from '@wendellhu/redi';
import { Inject, Injector } from '@wendellhu/redi';

import { CustomerService } from './services/customer.service';
import { CustomerServiceTwo } from './services/customer2.service';

export interface IUniverThreadCommentUIConfig {
    overrides?: DependencyOverride;
}

@DependentOn(MyPlugin)
export class MyPlugin extends Plugin {
    static override pluginName = 'MY_PLUGIN_NAME';
    static override type = UniverInstanceType.UNIVER_UNKNOWN;

    constructor(
        private readonly _config: IUniverThreadCommentUIConfig | undefined,
        @Inject(Injector) protected override _injector: Injector,
        @ICommandService protected _commandService: ICommandService
    ) {
        super();
    }

    override onStarting(injector: Injector): void {
        (mergeOverrideWithDependencies([
            [CustomerService],
            [CustomerServiceTwo],
        ], this._config?.overrides) as Dependency[]).forEach((dep) => {
            injector.add(dep);
        });

        [].forEach((command) => {
            this._commandService.registerCommand(command);
        });
    }
}
