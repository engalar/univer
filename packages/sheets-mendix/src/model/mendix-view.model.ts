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
import { LifecycleStages, LRUMap, OnLifecycle } from '@univerjs/core';
import { RangeProtectionRuleModel } from '@univerjs/sheets';
import type { Observable } from 'rxjs';
import { Subject } from 'rxjs';

@OnLifecycle(LifecycleStages.Starting, RangeProtectionRuleModel)
export class MendixViewModel implements IDisposable {
    private cacheResult = new LRUMap<string, string | null>(1000);
    private cacheReq = new LRUMap<string, string>(1000);
    // req subject
    private reqSubject = new Subject<string>();
    public onReq$: Observable<string> = this.reqSubject.asObservable();
    // res subject
    private resSubject = new Subject<string>();
    public onRes$: Observable<string> = this.resSubject.asObservable();

    constructor() {
        // @ts-ignore
        window.eg = this;
    }

    dispose(): void {
        this.cacheResult.clear();
        this.cacheReq.clear();
        this.reqSubject.complete();
        this.resSubject.complete();
    }

    /**
     *
     * @param row
     * @param col
     * @returns undefined loading, else loaded
     */
    public get(row: number, col: number): string | undefined {
        const key = `${row}-${col}`;
        const result = this.cacheResult.get(key);
        if (result) {
            return '';
        }

        this.setReq(row, col, 'true');

        return undefined;
    }

    public set(row: number, col: number, value: string | null): void {
        const key = `${row}-${col}`;
        this.cacheReq.delete(key);
        this.cacheResult.set(key, value);
        this.resSubject.next(key);
    }

    public setReq(row: number, col: number, value: string): void {
        const key = `${row}-${col}`;
        if (this.cacheReq.has(key)) {
            return;
        }
        this.cacheReq.set(key, value);
        this.reqSubject.next(key);
    }

    // get req cache itrator
    [Symbol.iterator](): Iterator<string> {
        return this.cacheReq.keys();
    }
}
