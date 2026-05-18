import React, { useState } from 'react'
import { BodyShort, Box, Timeline } from '@navikt/ds-react'

import { KlippetSykepengesoknadRecord, Soknad, dayjsToDate } from '../queryhooks/useSoknader'
import type { Sykmelding } from '../queryhooks/useSykmeldinger'
import gruppertOgFiltrert from '../utils/gruppering'
import { filtrerPaFilter } from '../utils/filterlogikk'
import { hentDatospenn, validerSykmeldingsDatoer } from '../utils/sykmeldingValidering'
import { beregnAktivTidsvindu, erPeriodeInnenforTidsvindu } from '../utils/tidslinjeUtils'

import { Filter, ValgteFilter } from './Filter'
import VelgZoomPeriode from './VelgZoomPeriode'
import {
    grupperSykmeldingerPaArbeidsgiver,
    perioderMedDatoer,
    sorterPerioder,
} from './sykmelding/sykmeldingTidslinjeUtils'
import DetaljerDrawer, { DrawerInnhold } from './DetaljerDrawer'
import { lagSykmeldingRader } from './kombinert/SykmeldingRader'
import { lagSoknadRader } from './kombinert/SoknadRader'
import { lagOppholdUtlandPins } from './kombinert/OppholdUtlandPins'

interface Props {
    sykmeldinger: Sykmelding[]
    soknader: Soknad[]
    klipp: KlippetSykepengesoknadRecord[]
}

export default function TidslinjeKombinert({ sykmeldinger, soknader, klipp }: Props) {
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

    const handlePeriodeValgt = (periodeId: string | null, kildeId: string | null, drawer: DrawerInnhold | null) => {
        setAktivPeriodeId(periodeId)
        setAktivDrawerKildeId(kildeId)
        setDrawerInnhold(drawer)
    }

    const handleDrawerValgt = (kildeId: string | null, drawer: DrawerInnhold | null) => {
        setAktivDrawerKildeId(kildeId)
        setDrawerInnhold(drawer)
    }

    const labelKlasse = 'kombinert-tidslinje-boks'

    return (
        <div className="min-w-[800px] min-h-[2000px] overflow-x-auto">
            <ValgteFilter filter={filter} setFilter={setFilter} />
            <BodyShort className="font-semibold">{`${sykmeldingAntall} sykmelding(er) · ${soknadAntall} søknad(er)`}</BodyShort>
            <VelgZoomPeriode setFraDato={setVisningsFraDato} setTilDato={setVisningstilDato} />
            {aktivTidsvindu && (
                <>
                    <Box
                        borderColor="brand-blue"
                        borderWidth="2"
                        padding="space-16"
                        borderRadius="12"
                        className={`mb-4 ${labelKlasse}`}
                    >
                        <BodyShort className="font-semibold mb-2">Sykmeldinger</BodyShort>
                        <Timeline
                            endDate={aktivTidsvindu.til}
                            startDate={aktivTidsvindu.fra}
                            key={`syk-${aktivTidsvindu.fra.toISOString()}-${aktivTidsvindu.til.toISOString()}`}
                        >
                            {lagSykmeldingRader({
                                sykmeldingerGruppertPaArbeidsgiver,
                                aktivTidsvindu,
                                aktivPeriodeId,
                                aktivDrawerKildeId,
                                onPeriodeValgt: handlePeriodeValgt,
                            })}
                        </Timeline>
                    </Box>
                    <Box
                        borderColor="brand-blue"
                        borderWidth="2"
                        padding="space-16"
                        borderRadius="12"
                        className={labelKlasse}
                    >
                        <BodyShort className="font-semibold mb-2">Søknader</BodyShort>
                        <Timeline
                            endDate={aktivTidsvindu.til}
                            startDate={aktivTidsvindu.fra}
                            key={`sok-${aktivTidsvindu.fra.toISOString()}-${aktivTidsvindu.til.toISOString()}`}
                        >
                            {lagSoknadRader({
                                soknaderGruppert,
                                aktivTidsvindu,
                                aktivPeriodeId,
                                aktivDrawerKildeId,
                                onPeriodeValgt: handlePeriodeValgt,
                            })}
                            {lagOppholdUtlandPins({
                                soknaderGruppert,
                                aktivDrawerKildeId,
                                onDrawerValgt: handleDrawerValgt,
                            })}
                        </Timeline>
                    </Box>
                </>
            )}
            <DetaljerDrawer
                innhold={drawerInnhold}
                filter={filter}
                setFilter={setFilter}
                plassering={drawerPlassering}
                setPlassering={setDrawerPlassering}
                onLukk={() => {
                    setAktivDrawerKildeId(null)
                    setDrawerInnhold(null)
                }}
            />
        </div>
    )
}
