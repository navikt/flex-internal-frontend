import React, { useEffect } from 'react'
import { BodyShort } from '@navikt/ds-react'

import { KlippetSykepengesoknadRecord, Soknad } from '../queryhooks/useSoknader'
import type { Sykmelding } from '../queryhooks/useSykmeldinger'

import { ValgteFilter } from './Filter'
import VelgZoomPeriode from './VelgZoomPeriode'
import DetaljerDrawer from './DetaljerDrawer'
import { useTidslinjeKombinert } from './kombinert/useTidslinjeKombinert'
import { useValgtFnr } from '../utils/useValgtFnr'
import SykmeldingTidslinje from './kombinert/SykmeldingTidslinje'
import SoknadTidslinje from './kombinert/SoknadTidslinje'

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

    const { valgtPeriodeId, valgtDrawerKildeId, nullstillValgtPeriode } = useValgtFnr()

    useEffect(() => {
        if (valgtPeriodeId === undefined && valgtDrawerKildeId === undefined) return
        if (valgtPeriodeId === null && valgtDrawerKildeId === null) return

        // Marker periode som valgt som om brukeren klikket på den
        const timer = setTimeout(() => {
            handlePeriodeValgt(valgtPeriodeId ?? null, valgtDrawerKildeId ?? null, null)
            if (typeof nullstillValgtPeriode === 'function') nullstillValgtPeriode()
        }, 0)
        return () => clearTimeout(timer)
    }, [valgtPeriodeId, valgtDrawerKildeId, handlePeriodeValgt, nullstillValgtPeriode])

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
