import Hyperlink from 'components/Hyperlink/Hyperlink';
import React, { FunctionComponent, useMemo } from 'react';
import useAllTaskJobs from './useAllTaskJobs';

type Props = {
    onOpen: () => void
    color: string
}

const TaskMonitorControl: FunctionComponent<Props> = ({ onOpen, color }) => {
    const taskJobs = useAllTaskJobs()
    const { waitingTasks, runningTasks, finishedTasks, erroredTasks } = useMemo(() => ({
        waitingTasks: taskJobs.filter(j => (j.status === 'waiting')),
        runningTasks: taskJobs.filter(j => (j.status === 'started')),
        finishedTasks: taskJobs.filter(j => (j.status === 'finished')),
        erroredTasks: taskJobs.filter(j => (j.status === 'error')),
    }), [taskJobs])
    const numWaiting = waitingTasks.length;
    const numRunning = runningTasks.length;
    const numFinished = finishedTasks.length;
    const numErrored = erroredTasks.length;
    // const numCacheHits = taskJobs.filter(j => (j.isCacheHit)).length
    const title = `Tasks: ${numWaiting} waiting | ${numRunning} running | ${numFinished} finished | ${numErrored} errored`
    const errored = numErrored > 0 ? (
        <span>:<span style={{color: 'pink'}}>{numErrored}</span></span>
    ) : <span></span>
    return (
        <Hyperlink onClick={onOpen}>
            <span style={{ fontFamily: "courier", color }} title={title}>{numWaiting}:{numRunning}:{numFinished}{errored}</span>
        </Hyperlink>
    );
}

export default TaskMonitorControl