import { JSONStringifyDeterministic } from "commonInterface/kacheryTypes";
import { useEffect, useMemo, useState } from "react";
import { TaskType } from "types/PubsubMessage";
import { useKacheryCloudTaskManager } from "./context/KacheryCloudTaskManagerContext";
import KacheryCloudTaskManager from "./KacheryCloudTaskManager";
import TaskJob, { TaskJobStatus } from "./TaskJob";

export const useTask = <ReturnType>(
    o: {
        taskType: TaskType,
        taskName: string | undefined,
        taskInput: {[key: string]: any}
    }
) => {
    const kacheryCloudTaskManager: KacheryCloudTaskManager | undefined = useKacheryCloudTaskManager()
    const [task, setTask] = useState<TaskJob<ReturnType> | undefined>(undefined)
    const [taskStatus, setTaskStatus] = useState<TaskJobStatus | undefined>(undefined)
    const [returnValue, setReturnValue] = useState<ReturnType | undefined>(undefined)

    const {taskType, taskName, taskInput} = o

    const taskInputString = useMemo(() => (
        JSONStringifyDeterministic(taskInput)
    ), [taskInput])
    useEffect(() => {
        setTask(undefined)
        setReturnValue(undefined)
        setTaskStatus(undefined)
        if (!taskName) return
        if (!kacheryCloudTaskManager) return

        const taskInput2 = JSON.parse(taskInputString)

        const task = kacheryCloudTaskManager.runTask<ReturnType>({taskType, taskName, taskInput: taskInput2})
        setTask(task)
        setTaskStatus(task.status)
        if (task.status === 'finished') {
            setReturnValue(task.result)
            return
        }
        else if (task.status === 'error') {
            return
        }

        const cancelOnStarted = task.onStarted(() => {
            setTaskStatus(task.status)
        })
        const cancelOnFinished = task.onFinished(() => {
            setTaskStatus(task.status)
            setReturnValue(task.result)
        })
        const cancelOnError = task.onError(() => {
            setTaskStatus(task.status)
            setReturnValue(task.result)
        })

        return () => {
            cancelOnStarted()
            cancelOnFinished()
            cancelOnError()
        }
    }, [taskName, taskInputString, taskType, kacheryCloudTaskManager])

    return useMemo(() => ({
        returnValue,
        task,
        taskStatus
    }), [returnValue, task, taskStatus])
}

export default useTask