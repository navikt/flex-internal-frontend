export const datostrengTilUtcDato = (datostreng?: string | null): Date | null => {
    if (!datostreng) return null

    const datoDel = datostreng.split('T')[0]
    const [aarStr, manedStr, dagStr] = datoDel.split('-')

    if (!aarStr || !manedStr || !dagStr) return null

    const aar = Number(aarStr)
    const maned = Number(manedStr)
    const dag = Number(dagStr)

    if (!Number.isInteger(aar) || !Number.isInteger(maned) || !Number.isInteger(dag)) return null

    const utcDato = new Date(Date.UTC(aar, maned - 1, dag))

    if (utcDato.getUTCFullYear() !== aar || utcDato.getUTCMonth() !== maned - 1 || utcDato.getUTCDate() !== dag) {
        return null
    }

    return utcDato
}

export const dagerMellomUtcDatoer = (fraDato: Date, tilDato: Date): number => {
    return (tilDato.getTime() - fraDato.getTime()) / (24 * 60 * 60 * 1000)
}
