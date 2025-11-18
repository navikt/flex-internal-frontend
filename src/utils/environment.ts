export function isMockBackend(): boolean {
    return process.env.MOCK_BACKEND === 'true'
}

export function spleisSporingUrl(): string {
    return process.env.NEXT_PUBLIC_SPLEIS_SPORING_URL || process.env.SPLEIS_SPORING_URL || ''
}

export function spannerUrl(): string {
    return process.env.NEXT_PUBLIC_SPANNER_URL || process.env.SPANNER_URL || ''
}

export function isProd(): boolean {
    const cluster = process.env.NEXT_PUBLIC_NAIS_CLUSTER_NAME || process.env.NAIS_CLUSTER_NAME
    return cluster === 'prod-gcp'
}
export function isNotProd(): boolean {
    return !isProd()
}
