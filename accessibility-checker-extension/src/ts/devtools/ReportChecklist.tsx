/******************************************************************************
     Copyright:: 2020- IBM, Inc

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
  *****************************************************************************/
 
import React from "react";

import {
} from 'carbon-components-react';

import { IReport, IReportItem, valueMap, IRuleset } from "./Report";
import ReportRow from "./ReportRow";

interface IReportChecklistState {
}
interface IReportChecklistProps {
    ruleset: IRuleset,
    report: IReport,
    selectItem: (item: IReportItem) => void
}

export default class ReportChecklist extends React.Component<IReportChecklistProps, IReportChecklistState> {
    state: IReportChecklistState = {};
    
    render() {
        let itemIdx = 0;
        let ruleToGroups : {
            [key: string]: {
                title: string,
                counts: { [key: string]: number }
                items: IReportItem[]
            }[]
        } = {};
        let groups = [];

        for (const checkpoint of this.props.ruleset.checkpoints) {
            let cpGroup = {
                // TODO: Change out for passive rule message
                title: `${checkpoint.num} ${checkpoint.name}`,
                checkpoint: checkpoint,
                counts: {},
                items: []
            }
            groups.push(cpGroup);
            for (const rule of checkpoint.rules) {
                ruleToGroups[rule.id] = ruleToGroups[rule.id] || []
                ruleToGroups[rule.id].push(cpGroup);
            }
        }

        for (const item of this.props.report.results) {
            if (item.value[1] === "PASS") {
                continue;
            }
            item.itemIdx = itemIdx++;

            if (item.ruleId in ruleToGroups) {
                let val = valueMap[item.value[0]][item.value[1]] || item.value[0] + "_" + item.value[1];
                for (const group of ruleToGroups[item.ruleId]) {
                    group.items.push(item);
                    group.counts[val] = (group.counts[val] || 0) + 1;
                }
            }
        }

        // this.props.report.sort((a,b) => {
        //     return a.path.aria.localeCompare(b.path.aria);
        // })
        return <div className="bx--grid report">
            <div className="bx--row reportHeader">
                <div className="bx--col-sm-1">
                    Issues                    
                </div>
                <div className="bx--col-sm-3">
                    Checkpoint
                </div>
            </div>
            {groups.map(group => {
                if (group.items.length > 0) {
                    return <ReportRow report={this.props.report} selectItem={this.props.selectItem} group={group} />;
                } else {
                    return null;
                }
            })}
        </div>
    }
}