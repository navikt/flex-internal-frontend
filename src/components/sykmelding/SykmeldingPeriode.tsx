import React, { Fragment, useState } from 'react'
import { Timeline } from '@navikt/ds-react'

import { Sykmelding, SykmeldingStatusType } from '../../queryhooks/useSykmeldinger'
import { datostrengTilUtcDato } from '../../utils/dato'

import SykmeldingDetaljer from './SykmeldingDetaljer'

const sykmeldingStatus = (status?: SykmeldingStatusType): 'success' | 'warning' | 'info' => {
    if (!status) return 'info'
    if (['SENDT', 'BEKREFTET'].includes(status)) return 'success'
    if (['AVVIST', 'UTGATT', 'AVBRUTT'].includes(status)) return 'warning'
    return 'info'
}

const SykmeldingPeriode = ({
    periode,
    sykmelding,
    idx,
}: {
    periode: { fom: string; tom: string }
    sykmelding: Sykmelding
    idx: number
}) => {
    const [erHover, setErHover] = useState(false)

    const startDato = datostrengTilUtcDato(periode.fom)
    const sluttDato = datostrengTilUtcDato(periode.tom)
    const status = sykmeldingStatus(sykmelding.sykmeldingStatus?.statusEvent)

    if (!startDato || !sluttDato || sluttDato < startDato) {
        return <Fragment />
    }

    return (
        <Timeline.Period
            key={`${sykmelding.id}-${idx}`}
            start={startDato}
            end={sluttDato}
            status={status}
            onMouseEnter={() => setErHover(true)}
            onMouseLeave={() => setErHover(false)}
        >
            {erHover && <SykmeldingDetaljer sykmelding={sykmelding} />}
        </Timeline.Period>
    )
}

export default SykmeldingPeriode
