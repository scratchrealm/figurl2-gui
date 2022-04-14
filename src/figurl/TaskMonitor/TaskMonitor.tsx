import { Button, IconButton, Link as LinkMui, Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import NiceTable from 'components/NiceTable/NiceTable';
import TaskJob from 'kacheryCloudTasks/TaskJob';
import React, { FunctionComponent, useState } from 'react';
import useAllTaskJobs from './useAllTaskJobs';
type Props = {
    onClose: () => void
}

const TaskMonitor: FunctionComponent<Props> = ({onClose}) => {
    const taskJobs = useAllTaskJobs()

    const [currentTask, setCurrentTask] = useState<TaskJob<any> | null>(null);

    const handleCancelTask = (t: TaskJob<any>) => {
        console.warn('Cancel task not implemented')
    }

    return (
        <div style={{padding: 20}}>
            {
                currentTask ? (
                    <div>
                        <div><Button onClick={() => setCurrentTask(null)}>Back to table</Button></div>
                        <TaskInfoView task={currentTask} />
                    </div>
                ) : (
                    <TaskMonitorTable
                        taskJobs={taskJobs}
                        onViewTask={t => setCurrentTask(t)}
                        onCancelTask={t => handleCancelTask(t)}
                    />
                )
            }
        </div>
    )
}

const TaskInfoView: FunctionComponent<{task: TaskJob<any>}> = ({ task }) => {
    const argumentsCollapsable = (task.taskInput && niceStringify(task.taskInput).length > 50);
    const logArgumentsToConsole = (task.taskInput && niceStringify(task.taskInput).length > 1000);
    const [argumentsExpanded, setArgumentsExpanded] = useState<boolean>(!argumentsCollapsable);

    const resultCollapsable = (task.result && niceStringify(task.result).length > 50);
    const logResultToConsole = (task.result && niceStringify(task.result).length > 1000);
    const [resultExpanded, setResultExpanded] = useState(!resultCollapsable);

    const argumentsElement = argumentsExpanded ? (
        <div>
            {
                argumentsCollapsable && <Button onClick={() => setArgumentsExpanded(false)}>Collapse</Button>
            }
            <pre>{task.taskInput ? niceStringify(task.taskInput): ''}</pre>
        </div>
    ) : (
        logArgumentsToConsole ? (
            <Button onClick={() => {console.info(task.taskInput)}}>Write arguments to console</Button>
        ) : (
            <Button onClick={() => {console.info(task.taskInput); setArgumentsExpanded(true)}}>Expand</Button>
        )
    )

    const resultElement = resultExpanded ? (
        <div>
            {
                resultCollapsable && <Button onClick={() => setResultExpanded(false)}>Collapse</Button>
            }
            <pre>{task.result ? niceStringify(task.result): ''}</pre>
        </div>
    ) : (
        logResultToConsole ? (
            <Button onClick={() => {console.info(task.result)}}>Write result to console</Button>
        ) : (
            <Button onClick={() => {console.info(task.result); setResultExpanded(true)}}>Expand</Button>
        )
    )

    const fields = [
        {
            label: 'Task ID',
            value: task.taskJobId
        },
        {
            label: 'Task name',
            value: task.taskName
        },
        {
            label: 'Input arguments',
            value: argumentsElement
        },
        {
            label: 'Status',
            value: task.status
        },
        {
            label: 'Initiated',
            value: task.timestampCreated ? formatTime(new Date(Number(task.timestampCreated))) : ''
        },
        // {
        //     label: 'Completed',
        //     value: task.timestampCompleted ? formatTime(new Date(Number(task.timestampCompleted))) : ''
        // },
        {
            label: 'Result',
            value: resultElement
        },
        {
            label: 'Message',
            value: task.errorMessage
        }
    ]
    return (
        <div>
            <Table className="NiceTable">
                <TableHead></TableHead>
                <TableBody>
                    {
                        fields.map(f => (
                            <TableRow key={f.label}>
                                <TableCell>{f.label}</TableCell>
                                <TableCell>{f.value}</TableCell>
                            </TableRow>
                        ))
                    }
                </TableBody>
            </Table>
            {/* <ConsoleOutView consoleOut={(task.runtime_info || {}).console_out} includeTimestamps={true} /> */}
        </div>
    )
}

const TaskMonitorTable: FunctionComponent<{
    taskJobs: TaskJob<any>[],
    onViewTask: (task: TaskJob<any>) => void,
    onCancelTask: (task: TaskJob<any>) => void
}> = ({
    taskJobs,
    onViewTask,
    onCancelTask
}) => {
    const columns = [
        {
            key: 'taskHash',
            label: 'Task'
        },
        {
            key: 'functionName',
            label: 'Function'
        },
        {
            key: 'status',
            label: 'Status'
        },
        // {
        //     key: 'cacheHit',
        //     label: 'Cache hit'
        // },
        {
            key: 'initiated',
            label: 'Initiated'
        },
        // {
        //     key: 'completed',
        //     label: 'Completed'
        // },
        {
            key: 'message',
            label: 'Message'
        }
    ];
    const sortedTasks = taskJobs;
    sortedTasks.sort((j1: TaskJob<any>, j2: TaskJob<any>) => {
        if ((j1.status === 'started') && (j2.status !== 'started'))
            return -1;
        else if ((j2.status === 'started') && (j1.status !== 'started'))
            return 1;
        if ((j1.timestampCreated) && (j2.timestampCreated)) {
            if (j1.timestampCreated < j2.timestampCreated) return 1;
            else if (j2.timestampCreated < j1.timestampCreated) return -1;
            else return 0;
        }
        else return 0
    })
    const rows = sortedTasks.map((j) => ({
        key: (j.taskJobId || 'undefined-' + j).toString(),
        columnValues: {
            taskHash: {
                text: j.taskJobId,
                element: <LinkMui href="#" onClick={() => {onViewTask && onViewTask(j)}}>{j.taskJobId}</LinkMui>
            },
            functionName: {
                text: j.taskName
            },
            status: {
                text: j.status,
                element: j.status === 'started' ? (
                    <span><span>{j.status} </span><CancelTaskButton onClick={() => {onCancelTask && onCancelTask(j)}}/></span>
                ) : <span>{j.status}</span>
            },
            // cacheHit: {text: j.isCacheHit === true ? 'yes' : j.isCacheHit === false ? 'no' : ''},
            initiated: {text: j.timestampCreated ? formatTime(new Date(Number(j.timestampCreated))) : ''},
            // completed: {text: j.timestampCompleted ? formatTime(new Date(Number(j.timestampCompleted))) : ''},
            message: {text: j.errorMessage || ''}
        }
    }));
    return (
        <NiceTable
            rows={rows}
            columns={columns}
        />
    )
}

const CancelTaskButton: FunctionComponent<{onClick: () => void}> = ({ onClick }) => {
    return (
        <IconButton title={"Cancel task"} onClick={onClick}><Delete /></IconButton>
    )
}

// const ConsoleOutView: FunctionComponent<{consoleOut: {lines: {timestamp: string, text: string}[]}, includeTimestamps: boolean}> = ({ consoleOut, includeTimestamps=true }) => {
//     if (!consoleOut) return <div></div>;
//     if (!consoleOut.lines) return <div></div>;
//     let txt;
//     if (includeTimestamps) {
//         txt = consoleOut.lines.map(line => `${line.timestamp}: ${line.text}`).join('\n');
//     }
//     else {
//         txt = consoleOut.lines.map(line => `${line.text}`).join('\n');
//     }
//     return (
//         <div style={{backgroundColor: 'black', color: 'white'}}>
//             <pre>
//                 {txt}
//             </pre>
//         </div>
//     )
// }

function niceStringify(x: any) {
    // TODO: figure out how to keep numeric arrays on one line in this expansion
    return JSON.stringify(x, null, 4);
}

function formatTime(d: Date) {
    const datesAreOnSameDay = (first: Date, second: Date) =>
        first.getFullYear() === second.getFullYear() &&
        first.getMonth() === second.getMonth() &&
        first.getDate() === second.getDate();
    let ret = '';
    if (!datesAreOnSameDay(d, new Date())) {
        ret += `${(d.getMonth() + 1)}/${d.getDate()}/${d.getFullYear()}} `;
    }
    ret += `${d.toLocaleTimeString()}`
    return ret;
}

export default TaskMonitor