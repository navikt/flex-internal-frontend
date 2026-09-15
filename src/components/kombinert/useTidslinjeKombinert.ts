import { addDays, differenceInCalendarDays, isAfter, isBefore } from 'date-fns'
import { useCallback, useState } from 'react'

import { KlippetSykepengesoknadRecord, Soknad } from '../../queryhooks/useSoknader'
import type { Sykmelding } from '../../queryhooks/useSykmeldinger'
import { now, tilOsloDatoFraDato } from '../../utils/dato-utils'
import { filtrerPaFilter } from '../../utils/filterlogikk'
import gruppertOgFiltrert from '../../utils/gruppering'
import { hentDatospenn, validerSykmeldingsDatoer } from '../../utils/sykmeldingValidering'
import { beregnAktivTidsvindu, erPeriodeInnenforTidsvindu } from '../../utils/tidslinjeUtils'
import type { DrawerInnhold } from '../DetaljerDrawer'
import { lagSammenlignDrawerInnhold } from '../DetaljerDrawer'
import type { Filter } from '../Filter'
import {
    grupperSykmeldingerPaArbeidsgiver,
    perioderMedDatoer,
    sorterPerioder,
} from '../sykmelding/sykmeldingTidslinjeUtils'

export interface SammenlignElement {
    kildeId: string
    objekt: object
    tittel: string
}

type Blaretning = 'bakover' | 'framover'

interface Tidsgrenser {
    grenseFra: Date
    grenseTil: Date
}

const flyttTidsvindu = (vindu: { fra: Date; til: Date }, retning: Blaretning, grenser: Tidsgrenser) => {
    const fra = tilOsloDatoFraDato(vindu.fra)
    const til = tilOsloDatoFraDato(vindu.til)
    const grenseFra = tilOsloDatoFraDato(grenser.grenseFra)
    const grenseTil = tilOsloDatoFraDato(grenser.grenseTil)
    const bredde = differenceInCalendarDays(til, fra)
    const steg = Math.max(1, Math.round(bredde / 2))
    const fortegn = retning === 'framover' ? 1 : -1

    let nyFra = addDays(fra, fortegn * steg)
    let nyTil = addDays(til, fortegn * steg)

    if (isBefore(nyFra, grenseFra)) {
        const diff = differenceInCalendarDays(grenseFra, nyFra)
        nyFra = addDays(nyFra, diff)
        nyTil = addDays(nyTil, diff)
    }
    if (isAfter(nyTil, grenseTil)) {
        const diff = differenceInCalendarDays(nyTil, grenseTil)
        nyFra = addDays(nyFra, -diff)
        nyTil = addDays(nyTil, -diff)
    }

    return { fra: nyFra, til: nyTil }
}

export const useTidslinjeKombinert = (
    sykmeldinger: Sykmelding[],
    soknader: Soknad[],
    klipp: KlippetSykepengesoknadRecord[],
) => {
    const [filter, setFilter] = useState<Filter[]>([])
    const [visningsFraDato, setVisningsFraDato] = useState<Date | null>(null)
    const [visningstilDato, setVisningstilDato] = useState<Date | null>(null)
    const [aktivPeriodeId, setAktivPeriodeId] = useState<string | null>(null)
    const [aktivDrawerKildeId, setAktivDrawerKildeId] = useState<string | null>(null)
    const [drawerInnhold, setDrawerInnhold] = useState<DrawerInnhold | null>(null)
    const [drawerPlassering, setDrawerPlassering] = useState<'bunn' | 'hoyre'>('hoyre')
    const [sammenlignModus, setSammenlignModus] = useState(false)
    const [sammenlignValgte, setSammenlignValgte] = useState<SammenlignElement[]>([])

    const gyldigeSykmeldinger = validerSykmeldingsDatoer(sykmeldinger)
    const filtrerteSykmeldinger = filtrerPaFilter(gyldigeSykmeldinger, filter)
    const datospennSyk = hentDatospenn(filtrerteSykmeldinger)
    const sykmeldingerGruppertPaArbeidsgiver = grupperSykmeldingerPaArbeidsgiver(filtrerteSykmeldinger)

    const soknaderGruppert = gruppertOgFiltrert(filter, soknader, klipp)
    const filtrerteSoknaderAntall = [...soknaderGruppert.values()].flatMap((arb) =>
        [...arb.sykmeldinger.values()].flatMap((syk) => [...syk.soknader.values()]),
    ).length

    const sykmeldingTotalAntall = filtrerteSykmeldinger.length
    const soknadTotalAntall = filtrerteSoknaderAntall

    let eldsteFra: Date | null = datospennSyk?.startDato ?? null
    let nysteTil: Date | null = datospennSyk?.sluttDato ?? null

    for (const [arbId, { sykmeldinger: sykGrp }] of soknaderGruppert.entries()) {
        for (const { soknader: sokGrp } of sykGrp.values()) {
            for (const sok of sokGrp.values()) {
                const erOppholdUtland = arbId === 'opphold_utland'
                const fom = erOppholdUtland ? sok.soknad.opprettetDato : sok.soknad.fom
                const tom = erOppholdUtland ? sok.soknad.opprettetDato : sok.soknad.tom
                if (fom && (!eldsteFra || fom < eldsteFra)) eldsteFra = fom
                if (tom && (!nysteTil || tom > nysteTil)) nysteTil = tom
            }
        }
    }

    const osloEldsteFra = eldsteFra ? tilOsloDatoFraDato(eldsteFra) : null
    const osloNysteTil = nysteTil ? tilOsloDatoFraDato(nysteTil) : null

    const grenser: Tidsgrenser | null =
        osloEldsteFra && osloNysteTil
            ? {
                  grenseFra: osloEldsteFra,
                  grenseTil: tilOsloDatoFraDato(isAfter(osloNysteTil, now()) ? osloNysteTil : now()),
              }
            : null

    const aktivTidsvindu = beregnAktivTidsvindu(visningsFraDato, visningstilDato, osloEldsteFra, osloNysteTil)

    const sykmeldingAntall = aktivTidsvindu
        ? filtrerteSykmeldinger.filter((sykmelding) => {
              const perioder = sorterPerioder(perioderMedDatoer(sykmelding))
              if (perioder.length === 0) return false
              return erPeriodeInnenforTidsvindu(
                  perioder[0].startDato,
                  perioder[perioder.length - 1].sluttDato,
                  aktivTidsvindu.fra,
                  aktivTidsvindu.til,
              )
          }).length
        : filtrerteSykmeldinger.length

    const soknadAntall = aktivTidsvindu
        ? [...soknaderGruppert.entries()].flatMap(([arbId, arb]) =>
              [...arb.sykmeldinger.values()].flatMap((syk) =>
                  [...syk.soknader.values()].filter((sok) => {
                      const erOppholdUtland = arbId === 'opphold_utland'
                      const fom = erOppholdUtland ? sok.soknad.opprettetDato : sok.soknad.fom
                      const tom = erOppholdUtland ? sok.soknad.opprettetDato : sok.soknad.tom
                      return fom && tom && erPeriodeInnenforTidsvindu(fom, tom, aktivTidsvindu.fra, aktivTidsvindu.til)
                  }),
              ),
          ).length
        : filtrerteSoknaderAntall

    const handlePeriodeValgt = useCallback(
        (periodeId: string | null, kildeId: string | null, drawer: DrawerInnhold | null) => {
            setAktivPeriodeId(periodeId)
            setAktivDrawerKildeId(kildeId)
            setDrawerInnhold(drawer)
        },
        [],
    )

    const handleDrawerValgt = useCallback((kildeId: string | null, drawer: DrawerInnhold | null) => {
        setAktivDrawerKildeId(kildeId)
        setDrawerInnhold(drawer)
    }, [])

    const handleLukkDrawer = useCallback(() => {
        setAktivDrawerKildeId(null)
        setDrawerInnhold(null)
    }, [])

    const handleSammenlignValgt = useCallback((element: SammenlignElement) => {
        setSammenlignValgte((gjeldende) => {
            const erAlleredeValgt = gjeldende.some((e) => e.kildeId === element.kildeId)
            if (erAlleredeValgt) {
                const nyListe = gjeldende.filter((e) => e.kildeId !== element.kildeId)
                setDrawerInnhold(null)
                return nyListe
            }
            if (gjeldende.length >= 2) {
                const nyListe = [gjeldende[1], element]
                setDrawerInnhold(
                    lagSammenlignDrawerInnhold(
                        nyListe[0].objekt,
                        nyListe[0].tittel,
                        nyListe[1].objekt,
                        nyListe[1].tittel,
                    ),
                )
                return nyListe
            }
            const nyListe = [...gjeldende, element]
            if (nyListe.length === 2) {
                setDrawerInnhold(
                    lagSammenlignDrawerInnhold(
                        nyListe[0].objekt,
                        nyListe[0].tittel,
                        nyListe[1].objekt,
                        nyListe[1].tittel,
                    ),
                )
            }
            return nyListe
        })
    }, [])

    const handleAvsluttSammenlign = useCallback(() => {
        setSammenlignModus(false)
        setSammenlignValgte([])
        setDrawerInnhold(null)
    }, [])

    const handleStartSammenlign = useCallback(() => {
        setSammenlignModus(true)
    }, [])

    const handleLukkSammenlignDrawer = useCallback(() => {
        setSammenlignValgte([])
        setDrawerInnhold(null)
        // sammenlignModus forblir true — brukeren kan velge nye elementer
    }, [])

    const handleBla = (retning: Blaretning) => {
        if (!aktivTidsvindu || !grenser) return
        const nyttVindu = flyttTidsvindu(aktivTidsvindu, retning, grenser)
        setVisningsFraDato(nyttVindu.fra)
        setVisningstilDato(nyttVindu.til)
    }

    return {
        grenser,
        filter,
        setFilter,
        setVisningsFraDato,
        setVisningstilDato,
        aktivPeriodeId,
        aktivDrawerKildeId,
        drawerInnhold,
        drawerPlassering,
        setDrawerPlassering,
        sykmeldingerGruppertPaArbeidsgiver,
        soknaderGruppert,
        aktivTidsvindu,
        nysteTil: osloNysteTil,
        sykmeldingAntall,
        sykmeldingTotalAntall,
        soknadAntall,
        soknadTotalAntall,
        handlePeriodeValgt,
        handleDrawerValgt,
        handleLukkDrawer,
        sammenlignModus,
        sammenlignValgte,
        handleSammenlignValgt,
        handleStartSammenlign,
        handleAvsluttSammenlign,
        handleLukkSammenlignDrawer,
        handleBla,
    }
}
