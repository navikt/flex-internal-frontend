import React, { useEffect } from 'react'
import { BodyShort, Button, HStack } from '@navikt/ds-react'
import { ArrowsSquarepathIcon } from '@navikt/aksel-icons'
import dayjs from 'dayjs'

import { BackendSoknad, KlippetSykepengesoknadRecord, Soknad, dayjsToDate } from '../queryhooks/useSoknader'
import type { Sykmelding } from '../queryhooks/useSykmeldinger'
import { ikonParForSoknad } from '../utils/tidslinjeIkonUtils'
import { useValgtFnr } from '../utils/useValgtFnr'

import { ValgteFilter } from './Filter'
import VelgZoomPeriode from './VelgZoomPeriode'
import DetaljerDrawer, { lagSykmeldingDrawerInnhold, lagSoknadDrawerInnhold } from './DetaljerDrawer'
import { useTidslinjeKombinert } from './kombinert/useTidslinjeKombinert'
import SykmeldingTidslinje from './kombinert/SykmeldingTidslinje'
import SoknadTidslinje from './kombinert/SoknadTidslinje'
import ViktigeFeltForSoknad from './periodeinfo/ViktigeFeltForSoknad'
import ViktigeFeltForSykmelding from './periodeinfo/ViktigeFeltForSykmelding'
import { perioderMedDatoer, sorterPerioder } from './sykmelding/sykmeldingTidslinjeUtils'

interface Props {
    sykmeldinger: Sykmelding[]
    soknader: Soknad[]
    klipp: KlippetSykepengesoknadRecord[]
    sammenlignModus?: boolean
    onSammenlignAvslutt?: () => void
}

const TidslinjeKombinert = ({
    sykmeldinger,
    soknader,
    klipp,
    sammenlignModus: sammenlignModusProp,
    onSammenlignAvslutt,
}: Props): React.ReactElement => {
    const {
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
        sammenlignModus,
        sammenlignValgte,
        handleSammenlignValgt,
        handleStartSammenlign,
        handleAvsluttSammenlign,
        handleLukkSammenlignDrawer,
    } = useTidslinjeKombinert(sykmeldinger, soknader, klipp, sammenlignModusProp, onSammenlignAvslutt)

    const { valgtPeriodeId, valgtDrawerKildeId, oppslagData, nullstillValgtPeriode } = useValgtFnr()

    useEffect(() => {
        if (valgtPeriodeId === undefined && valgtDrawerKildeId === undefined) return
        if (valgtPeriodeId === null && valgtDrawerKildeId === null) return

        // Marker periode som valgt og zoom tidslinjen til 6 mnd rundt perioden
        const timer = setTimeout(() => {
            let drawerContent = null
            let periodStart: Date | null = null
            let periodEnd: Date | null = null

            if (oppslagData?.sykmelding) {
                const sykmelding = oppslagData.sykmelding as Sykmelding
                const perioder = sorterPerioder(perioderMedDatoer(sykmelding))
                if (perioder.length > 0) {
                    const periodeInfo = <ViktigeFeltForSykmelding sykmelding={sykmelding} perioder={perioder} />
                    drawerContent = lagSykmeldingDrawerInnhold(sykmelding, periodeInfo)
                    periodStart = perioder[0].startDato
                    periodEnd = perioder[perioder.length - 1].sluttDato
                }
            } else if (oppslagData?.soknad) {
                const soknad = new Soknad(oppslagData.soknad as BackendSoknad)
                const fomDato = dayjsToDate(soknad.fom)
                const tomDato = dayjsToDate(soknad.tom)
                const periodeInfo = <ViktigeFeltForSoknad soknad={soknad} />
                drawerContent = lagSoknadDrawerInnhold(soknad, periodeInfo, ikonParForSoknad(soknad))
                periodStart = fomDato ?? null
                periodEnd = tomDato ?? null
            }

            if (periodStart) {
                setVisningsFraDato(dayjs(periodStart).subtract(3, 'month').toDate())
                setVisningstilDato(
                    dayjs(periodEnd ?? periodStart)
                        .add(3, 'month')
                        .toDate(),
                )
            }

            handlePeriodeValgt(valgtPeriodeId ?? null, valgtDrawerKildeId ?? null, drawerContent)
            if (typeof nullstillValgtPeriode === 'function') nullstillValgtPeriode()
        }, 0)
        return () => clearTimeout(timer)
    }, [
        valgtPeriodeId,
        valgtDrawerKildeId,
        oppslagData,
        handlePeriodeValgt,
        nullstillValgtPeriode,
        setVisningsFraDato,
        setVisningstilDato,
    ])

    const sammenlignStatusTekst = () => {
        if (sammenlignValgte.length === 0) return 'Velg første element'
        if (sammenlignValgte.length === 1) return `Valgt: ${sammenlignValgte[0].tittel} — velg ett til`
        return `Sammenligner: ${sammenlignValgte[0].tittel} vs ${sammenlignValgte[1].tittel}`
    }

    const sammenlignValgteIder = sammenlignValgte.map((e) => e.kildeId)

    return (
        <div className="min-w-[800px] min-h-[2000px] overflow-x-auto">
            <ValgteFilter filter={filter} setFilter={setFilter} />
            <HStack align="center" gap="space-4" className="mb-1">
                <BodyShort className="font-semibold">{`${sykmeldingAntall} sykmelding(er) · ${soknadAntall} søknad(er)`}</BodyShort>
                {sammenlignModusProp === undefined && !sammenlignModus && (
                    <Button
                        size="small"
                        variant="secondary"
                        icon={<ArrowsSquarepathIcon aria-hidden />}
                        onClick={handleStartSammenlign}
                    >
                        Sammenlign
                    </Button>
                )}
                {sammenlignModusProp === undefined && sammenlignModus && (
                    <Button size="small" variant="tertiary-neutral" onClick={handleAvsluttSammenlign}>
                        Avslutt sammenligning
                    </Button>
                )}
                <BodyShort
                    size="small"
                    className="text-ax-text-neutral-subtle italic"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {sammenlignModus ? sammenlignStatusTekst() : ''}
                </BodyShort>
            </HStack>
            <VelgZoomPeriode
                setFraDato={setVisningsFraDato}
                setTilDato={setVisningstilDato}
                maxTilDato={nysteTil ?? undefined}
            />
            {aktivTidsvindu && (
                <>
                    <SykmeldingTidslinje
                        sykmeldingerGruppertPaArbeidsgiver={sykmeldingerGruppertPaArbeidsgiver}
                        aktivTidsvindu={aktivTidsvindu}
                        aktivPeriodeId={aktivPeriodeId}
                        aktivDrawerKildeId={aktivDrawerKildeId}
                        onPeriodeValgt={handlePeriodeValgt}
                        sammenlignModus={sammenlignModus}
                        sammenlignValgteIder={sammenlignValgteIder}
                        onSammenlignValgt={handleSammenlignValgt}
                    />
                    <SoknadTidslinje
                        soknaderGruppert={soknaderGruppert}
                        aktivTidsvindu={aktivTidsvindu}
                        aktivPeriodeId={aktivPeriodeId}
                        aktivDrawerKildeId={aktivDrawerKildeId}
                        onPeriodeValgt={handlePeriodeValgt}
                        onDrawerValgt={handleDrawerValgt}
                        sammenlignModus={sammenlignModus}
                        sammenlignValgteIder={sammenlignValgteIder}
                        onSammenlignValgt={handleSammenlignValgt}
                    />
                </>
            )}
            <DetaljerDrawer
                innhold={drawerInnhold}
                filter={filter}
                setFilter={setFilter}
                plassering={drawerPlassering}
                setPlassering={setDrawerPlassering}
                onLukk={sammenlignModus ? handleLukkSammenlignDrawer : handleLukkDrawer}
            />
        </div>
    )
}

export default TidslinjeKombinert
