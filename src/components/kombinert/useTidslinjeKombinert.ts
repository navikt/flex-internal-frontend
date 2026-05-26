import { useCallback, useState } from 'react'

import { KlippetSykepengesoknadRecord, Soknad, dayjsToDate } from '../../queryhooks/useSoknader'
import type { Sykmelding } from '../../queryhooks/useSykmeldinger'
import { filtrerPaFilter } from '../../utils/filterlogikk'
import gruppertOgFiltrert from '../../utils/gruppering'
import { hentDatospenn, validerSykmeldingsDatoer } from '../../utils/sykmeldingValidering'
import { beregnAktivTidsvindu, erPeriodeInnenforTidsvindu } from '../../utils/tidslinjeUtils'
import type { DrawerInnhold } from '../DetaljerDrawer'
import type { Filter } from '../Filter'
import {
    grupperSykmeldingerPaArbeidsgiver,
    perioderMedDatoer,
    sorterPerioder,
} from '../sykmelding/sykmeldingTidslinjeUtils'

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
    const [drawerPlassering, setDrawerPlassering] = useState<'bunn' | 'hoyre'>('bunn')

    const gyldigeSykmeldinger = validerSykmeldingsDatoer(sykmeldinger)
    const filtrerteSykmeldinger = filtrerPaFilter(gyldigeSykmeldinger, filter)
    const datospennSyk = hentDatospenn(filtrerteSykmeldinger)
    const sykmeldingerGruppertPaArbeidsgiver = grupperSykmeldingerPaArbeidsgiver(filtrerteSykmeldinger)

    const soknaderGruppert = gruppertOgFiltrert(filter, soknader, klipp)
    const filtrerteSoknaderAntall = [...soknaderGruppert.values()].flatMap((arb) =>
        [...arb.sykmeldinger.values()].flatMap((syk) => [...syk.soknader.values()]),
    ).length

    let eldsteFra: Date | null = datospennSyk?.startDato ?? null
    let nysteTil: Date | null = datospennSyk?.sluttDato ?? null

    for (const [arbId, { sykmeldinger: sykGrp }] of soknaderGruppert.entries()) {
        for (const { soknader: sokGrp } of sykGrp.values()) {
            for (const sok of sokGrp.values()) {
                const erOppholdUtland = arbId === 'opphold_utland'
                const fom = erOppholdUtland ? dayjsToDate(sok.soknad.opprettetDato) : dayjsToDate(sok.soknad.fom!)
                const tom = erOppholdUtland ? dayjsToDate(sok.soknad.opprettetDato) : dayjsToDate(sok.soknad.tom!)
                if (fom && (!eldsteFra || fom < eldsteFra)) eldsteFra = fom
                if (tom && (!nysteTil || tom > nysteTil)) nysteTil = tom
            }
        }
    }

    const aktivTidsvindu = beregnAktivTidsvindu(visningsFraDato, visningstilDato, eldsteFra, nysteTil)

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
                      const fom = erOppholdUtland ? dayjsToDate(sok.soknad.opprettetDato) : dayjsToDate(sok.soknad.fom!)
                      const tom = erOppholdUtland ? dayjsToDate(sok.soknad.opprettetDato) : dayjsToDate(sok.soknad.tom!)
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

    return {
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
        nysteTil,
        sykmeldingAntall,
        soknadAntall,
        handlePeriodeValgt,
        handleDrawerValgt,
        handleLukkDrawer,
    }
}
