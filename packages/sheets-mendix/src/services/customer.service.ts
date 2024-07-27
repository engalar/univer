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

import type { IDisposable } from '@univerjs/core';
import { createIdentifier, IResourceManagerService, LifecycleStages, OnLifecycle, UniverInstanceType } from '@univerjs/core';
import { Inject } from '@wendellhu/redi';

interface IResource { testResource: string }
export interface ICustomerService {
}
export const ICustomerService = createIdentifier<CustomerService>('sheets-mendix.customer-service');

@OnLifecycle(LifecycleStages.Starting, ICustomerService)
export class CustomerService implements ICustomerService, IDisposable {
    private _model: IResource = { testResource: '' };

    constructor(
        @Inject(IResourceManagerService) private _resourceManagerService: IResourceManagerService
    ) {
        this._resourceManagerService.registerPluginResource<IResource>({
            toJson: (unitID) => this._toJson(unitID),
            parseJson: (json) => this._parseJson(json),
            pluginName: 'SHEET_CUSTOMERSERVICE_PLUGIN',
            businesses: [UniverInstanceType.UNIVER_SHEET],
            onLoad: (_unitId, resource) => {
                this._model = resource;
            },
            onUnLoad: (_unitId) => {
                this._model = { testResource: '' };
            },
        });
    }

    dispose(): void {
        this._model = { testResource: '' };
    }

    private _toJson(_unitID: string) {
        const model = this._model;
        return JSON.stringify(model);
    }

    private _parseJson(json: string) {
        return JSON.parse(json);
    }
}
