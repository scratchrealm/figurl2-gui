import KacheryCloudFeed from "./KacheryCloudFeed"

export class KacheryCloudFeedManager {
    #feeds: {[key: string]: KacheryCloudFeed} = {}
    getFeed(feedId: string) {
        if (!(feedId in this.#feeds)) {
            this.#feeds[feedId] = new KacheryCloudFeed(feedId)
        }
        return this.#feeds[feedId]
    }
}

const kacheryCloudFeedManager = new KacheryCloudFeedManager()

export default kacheryCloudFeedManager