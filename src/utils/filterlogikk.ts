import { Filter } from '../components/Filter'

export interface StiOppslag {
    finnes: boolean
    verdi: unknown
}

export const hentVerdiFraSti = (objekt: unknown, sti: string): StiOppslag => {
    const deler = sti.match(/[^.[\]]+/g) ?? []
    let verdi: unknown = objekt

    for (const del of deler) {
        if (verdi === null || verdi === undefined) return { finnes: false, verdi: undefined }

        if (Array.isArray(verdi)) {
            const indeks = Number(del)
            if (Number.isNaN(indeks) || !(indeks in verdi)) return { finnes: false, verdi: undefined }
            verdi = verdi[indeks]
            continue
        }

        if (typeof verdi === 'object') {
            if (!(del in (verdi as Record<string, unknown>))) return { finnes: false, verdi: undefined }
            verdi = (verdi as Record<string, unknown>)[del]
            continue
        }

        return { finnes: false, verdi: undefined }
    }

    return { finnes: true, verdi }
}

export const passerAlleFilter = (objekt: unknown, filter: Filter[]): boolean => {
    return filter.every((f) => {
        const oppslag = hentVerdiFraSti(objekt, f.prop)
        if (!oppslag.finnes) return false

        const verdi = JSON.stringify(oppslag.verdi)
        return (f.inkluder && f.verdi === verdi) || (!f.inkluder && f.verdi !== verdi)
    })
}

export const filtrerPaFilter = <T>(objekter: T[], filter: Filter[]): T[] => {
    return objekter.filter((objekt) => passerAlleFilter(objekt, filter))
}
