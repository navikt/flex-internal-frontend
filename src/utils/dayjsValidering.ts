import dayjs, { Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

export const tilDayjs = (dato?: string | null, format?: string): Dayjs | undefined => {
    if (!dato) return undefined
    const dayjsDato = format ? dayjs(dato, format, true) : dayjs(dato)
    return dayjsDato.isValid() ? dayjsDato : undefined
}

export const tilDayjsPaakrevd = (dato: string, feltnavn: string, format?: string): Dayjs => {
    const dayjsDato = tilDayjs(dato, format)
    if (!dayjsDato) {
        throw new Error(`Ugyldig datoverdi i ${feltnavn}: ${dato}`)
    }
    return dayjsDato
}
