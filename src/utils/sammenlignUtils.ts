import { isValid } from 'date-fns'

import { erGyldigDato, formaterDato, toDate } from './dato-utils'

const erObjekt = (verdi: unknown): verdi is Record<string, unknown> =>
    typeof verdi === 'object' && verdi !== null && !Array.isArray(verdi)

const erDatoObjekt = (verdi: unknown): verdi is Date => verdi instanceof Date

const erDatostreng = (verdi: string): boolean => {
    if (!/^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d{1,9})?)?(?:Z|[+-]\d{2}:\d{2})?)?$/.test(verdi)) {
        return false
    }
    return isValid(toDate(verdi))
}

const harTidspunkt = (verdi: string): boolean => /[T ]\d{2}:\d{2}/.test(verdi)

export const formaterVerdiSammenlign = (verdi: unknown): string => {
    if (erDatoObjekt(verdi)) return erGyldigDato(verdi) ? formaterDato(verdi, 'd MMM yyyy HH:mm') : 'Invalid Date'
    if (typeof verdi === 'string') {
        if (erDatostreng(verdi)) {
            const dato = toDate(verdi)
            return formaterDato(dato, harTidspunkt(verdi) ? 'd MMM yyyy HH:mm' : 'd MMM yyyy')
        }
        return verdi
    }
    if (verdi === null) return 'null'
    if (verdi === undefined) return 'undefined'
    if (typeof verdi === 'boolean') return verdi ? 'true' : 'false'
    if (typeof verdi === 'number') return String(verdi)
    return JSON.stringify(verdi)
}

export const flatUtObjekt = (obj: unknown, prefix = ''): Record<string, string> => {
    const resultat: Record<string, string> = {}

    if (Array.isArray(obj)) {
        if (obj.length === 0) {
            resultat[prefix] = '[]'
        } else {
            obj.forEach((element, indeks) => {
                const nøkkel = prefix ? `${prefix}[${indeks}]` : `[${indeks}]`
                const nested = flatUtObjekt(element, nøkkel)
                Object.assign(resultat, nested)
            })
        }
    } else if (erDatoObjekt(obj)) {
        resultat[prefix] = formaterVerdiSammenlign(obj)
    } else if (erObjekt(obj)) {
        const entries = Object.entries(obj)
        if (entries.length === 0) {
            if (prefix) resultat[prefix] = '{}'
        } else {
            for (const [nøkkel, verdi] of entries) {
                const sti = prefix ? `${prefix}.${nøkkel}` : nøkkel
                const nested = flatUtObjekt(verdi, sti)
                Object.assign(resultat, nested)
            }
        }
    } else {
        resultat[prefix] = formaterVerdiSammenlign(obj)
    }

    return resultat
}

export interface SammenlignRad {
    nøkkel: string
    verdi1: string | undefined
    verdi2: string | undefined
    erLik: boolean
}

export const sammenlignObjekter = (obj1: object, obj2: object): SammenlignRad[] => {
    const flat1 = flatUtObjekt(obj1)
    const flat2 = flatUtObjekt(obj2)

    const alleNøkler = new Set([...Object.keys(flat1), ...Object.keys(flat2)])

    return Array.from(alleNøkler)
        .sort()
        .map((nøkkel) => {
            const verdi1 = flat1[nøkkel]
            const verdi2 = flat2[nøkkel]
            return {
                nøkkel,
                verdi1,
                verdi2,
                erLik: verdi1 === verdi2,
            }
        })
}
