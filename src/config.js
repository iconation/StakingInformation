import axios from "axios"

export async function trackerApiInstance() {
    const apiUrl = await getTrackerApiUrl()
    return axios.create({
        baseURL: apiUrl
    })
}

export async function walletApiInstance() {
    const apiUrl = await getWalletApiUrl()
    return axios.create({
        baseURL: apiUrl
    })
}

export async function getTrackerApiUrl() {
    return "https://tracker.icon.foundation"
}

export async function getWalletApiUrl() {
    return "https://wallet.icon.foundation"
}

export async function getIsSoloVersion() {
    const configFile = await getConfigJsonFile()
    if (configFile && configFile.IS_SOLO_VERSION) {
        return !!configFile.IS_SOLO_VERSION
    }

    if (process.env.REACT_APP_ENV) {
        switch (process.env.REACT_APP_ENV) {
            case "mainnet":
            case "testnet":
            case "testnet1":
            case "custom":
            case "prep":
            case "qa":
                return false
            default:
        }
    }

    return false
}

async function getConfigJsonFile() {
    try {
        const response = await fetch("/config.json")
        const responseJson = await response.json()
        return responseJson
    } catch (e) {
        console.error(e)
        return {}
    }
}