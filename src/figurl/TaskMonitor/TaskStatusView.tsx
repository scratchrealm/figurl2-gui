import TaskJob from 'kacheryCloudTasks/TaskJob'
import React, { FunctionComponent } from 'react'

type Props = {
    label: string
    task: TaskJob<any> | undefined
}

const TaskStatusView: FunctionComponent<Props> = ({label, task}) => {
    if (!task) return (
        <div>Waiting for task: {label}</div>
    )
    if ((task.status === 'waiting') || (task.status === 'started') || (task.status === 'finished')) {
        return <div>{label}: {task.status}</div>
    }
    else if (task.status === 'error') {
        return <div>Error running {label}: {task.errorMessage}</div>
    }
    else {
        return <div>{label}: Unexpected status: {task.status}</div>
    }
}

export default TaskStatusView