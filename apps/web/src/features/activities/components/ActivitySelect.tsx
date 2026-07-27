// import { useState, type FormEvent } from "react";

import { useMemo } from "react";
import type { Activity } from "@helpsenior/core";

import {
  classNames,
  Select,
} from "../../../shared/ui";

interface ActivitySelectProps {
    value?: string
    activities: Activity[];
    onSelected: (activityId: string) => void;
}

interface ActivitySelected {
    id: string,
    title: string,
}

export function ActivitySelect({
    value,
    activities,
    onSelected
}: ActivitySelectProps) {
    
    const ActivityOptions = useMemo(
        () => [{ id: '', title: 'Anexe uma atividade para ajudar a realizara tarefa'}, ...activities.map((activity) => {
            return {
                id: activity.id,
                title: activity.title,
            }
        })],
        [activities],
    );

    if (activities.length === 0) {
        return;
    }

    return (
        <div className={classNames(`gap-6 overflow-y-auto`)}>
            <Select
                value={value}
                onChange={(event) => onSelected(event.target.value)}
            >
                { ActivityOptions.map((activity: ActivitySelected) => (
                    <option className="mt-2" key={activity.id} value={activity.id}>{activity.title}</option>
                ))}
            </Select>
        </div>
    );
}
