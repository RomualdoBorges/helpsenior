// import { useState, type FormEvent } from "react";

import { useMemo } from "react";
import type { Task } from "@helpsenior/core";

import {
  classNames,
  Select,
} from "../../../shared/ui";

interface TaskSelectProps {
    value?: string
    tasks: Task[];
    onSelected: (taskId: string) => void;
}

interface TaskSelected {
    id: string,
    title: string,
}

export function TaskSelect({
    value,
    tasks,
    onSelected
}: TaskSelectProps) {
    
    const TaskOptions = useMemo(
        () => [{ id: '', title: 'Anexe uma de suas tarefas'}, ...tasks.map((task) => {
            return {
                id: task.id,
                title: task.title,
            }
        })],
        [tasks],
    );

    if (tasks.length === 0) {
        return;
    }

    return (
        <div className={classNames(`gap-6 overflow-y-auto`)}>
            <Select
                value={value}
                onChange={(event) => onSelected(event.target.value)}
            >
                { TaskOptions.map((task: TaskSelected) => (
                    <option className="mt-2" key={task.id} value={task.id}>{task.title}</option>
                ))}
            </Select>
        </div>
    );
}
