import React, { useEffect } from 'react'
import { BodyShort } from '@navikt/ds-react'
import dayjs from 'dayjs'

import { KlippetSykepengesoknadRecord, Soknad } from '../queryhooks/useSoknader'
import type { Sykmelding } from '../queryhooks/useSykmeldinger'
import { useValgtFnr } from '../utils/useValgtFnr'

import { ValgteFilter } from './Filter'
import VelgZoomPeriode from './VelgZoomPeriode'
import DetaljerDrawer, { lagSykmeldingDrawerInnhold, lagSoknadDrawerInnhold } from './DetaljerDrawer'
import { useTidslinjeKombinert } from './kombinert/useTidslinjeKombinert'
import SykmeldingTidslinje from './kombinert/SykmeldingTidslinje'
import SoknadTidslinje from './kombinert/SoknadTidslinje'
import ViktigeFeltForSykmelding from './periodeinfo/ViktigeFeltForSykmelding'
import { perioderMedDatoer, sorterPerioder } from './sykmelding/sykmeldingTidslinjeUtils'

interface Props {
    sykmeldinger: Sykmelding[]
    soknader: Soknad[]
    klipp: KlippetSykepengesoknadRecord[]
}

const TidslinjeKombinert = ({ sykmeldinger, soknader, klipp }: Props): React.ReactElement => {
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
    } = useTidslinjeKombinert(sykmeldinger, soknader, klipp)

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
                const soknad = oppslagData.soknad as Soknad
                const fom = soknad.fom?.format('DD.MM.YYYY') ?? '–'
                const tom = soknad.tom?.format('DD.MM.YYYY') ?? '–'
                const periodeInfo = (
                    <div>
                        {fom} til {tom}
                    </div>
                )
                drawerContent = lagSoknadDrawerInnhold(soknad, periodeInfo)
                periodStart = soknad.fom?.toDate() ?? null
                periodEnd = soknad.tom?.toDate() ?? null
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

    return (
        <div className="min-w-[800px] min-h-[2000px] overflow-x-auto">
            <ValgteFilter filter={filter} setFilter={setFilter} />
            <BodyShort className="font-semibold">{`${sykmeldingAntall} sykmelding(er) · ${soknadAntall} søknad(er)`}</BodyShort>
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
                    />
                    <SoknadTidslinje
                        soknaderGruppert={soknaderGruppert}
                        aktivTidsvindu={aktivTidsvindu}
                        aktivPeriodeId={aktivPeriodeId}
                        aktivDrawerKildeId={aktivDrawerKildeId}
                        onPeriodeValgt={handlePeriodeValgt}
                        onDrawerValgt={handleDrawerValgt}
                    />
                </>
            )}
            <DetaljerDrawer
                innhold={drawerInnhold}
                filter={filter}
                setFilter={setFilter}
                plassering={drawerPlassering}
                setPlassering={setDrawerPlassering}
                onLukk={handleLukkDrawer}
            />
        </div>
    )
}

export default TidslinjeKombinert
