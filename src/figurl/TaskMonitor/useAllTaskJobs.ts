import { useKacheryCloudTaskManager } from 'kacheryCloudTasks/context/KacheryCloudTaskManagerContext';
import TaskJob from 'kacheryCloudTasks/TaskJob';
import { useEffect, useState } from 'react';

const useAllTaskJobs = () : TaskJob<any>[] => {
    const [taskJobs, setTaskJobs] = useState<TaskJob<any>[]>([])
    const taskManager = useKacheryCloudTaskManager()
    useEffect(() => {
        if (!taskManager) return
        // this should only get called once
        const update = () => {
            const taskJobs = taskManager.getAllTaskJobs()
            setTaskJobs(taskJobs)
        }
        let updateScheduled = false
        const scheduleUpdate = () => {
            if (updateScheduled) return
            updateScheduled = true
            setTimeout(() => {
                updateScheduled = false
                update()
            }, 100)
        }
        update()
        taskManager.onUpdate(() => {
            scheduleUpdate()
        })
    }, [taskManager])
    return taskJobs
}

export default useAllTaskJobs