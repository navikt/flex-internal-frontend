export interface AktivTidsvindu {
    fra: Date
    til: Date
}

export const erPeriodeInnenforTidsvindu = (
    periodeFra: Date,
    periodeTil: Date,
    visningsFra: Date,
    visningstil: Date,
): boolean => {
    return periodeFra <= visningstil && periodeTil >= visningsFra
}

export const beregnAktivTidsvindu = (
    visningsFraDato: Date | null,
    visningstilDato: Date | null,
    defaultFra: Date | null,
    defaultTil: Date | null,
): AktivTidsvindu | null => {
    if (visningsFraDato && visningstilDato) {
        return { fra: visningsFraDato, til: visningstilDato }
    }
    if (defaultFra && defaultTil) {
        return { fra: defaultFra, til: defaultTil }
    }
    return null
}
