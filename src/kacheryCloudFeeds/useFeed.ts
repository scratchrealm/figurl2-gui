import { JSONObject } from "commonInterface/kacheryTypes"
import { useCallback, useEffect, useMemo, useState } from "react"
import kacheryCloudFeedManager from "./kacheryCloudFeedManager"

const useFeed = (feedId: string) => {
    const feed = useMemo(() => (kacheryCloudFeedManager.getFeed(feedId)), [feedId])
    const [messages, setMessages] = useState<JSONObject[] | undefined>(undefined)
    const [messagesUpdateCode, setMessagesUpdateCode] = useState<number>(0)
    const incrementMessagesUpdateCode = useCallback(() => {setMessagesUpdateCode(c => (c + 1))}, [])

    useEffect(() => {
        const cancelCallback = feed.onMessagesUpdated(() => {
            incrementMessagesUpdateCode()
        })
        return () => {
            cancelCallback()
        }
    }, [feed])

    useEffect(() => {
        setMessages(feed.getMessages())
    }, [feed, messagesUpdateCode])

    useEffect(() => {
        let canceled = false
        ;(async () => {
            
        })()
        return () => {
            canceled = true
        }
    }, [messagesUpdateCode, messages, feedId])

    return {messages}
}

export default useFeed