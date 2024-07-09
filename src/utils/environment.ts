import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

export function isMockBackend(): boolean {
    return publicRuntimeConfig.mockBackend === 'true'
}
export function spleisSporingUrl(): boolean {
    return publicRuntimeConfig.spleisSporingUrl
}
export function spannerUrl(): boolean {
    return publicRuntimeConfig.spannerUrl
}

export function isProd(): boolean {
    return publicRuntimeConfig.naisClusterName === 'prod-gcp'
}
export function isNotProd(): boolean {
    return !isProd()
}
