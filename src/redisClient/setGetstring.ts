import Redisclient from "./client.redis";


async function init() {
    await Redisclient.set("name:5", "sujan is cool")
    const value = await Redisclient.get("name:5")
    console.log(value)
}


init()