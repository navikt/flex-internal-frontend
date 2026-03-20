import React, { Fragment } from 'react'
import { BodyShort, Timeline } from '@navikt/ds-react'
import dayjs from 'dayjs'

import { Sykmelding, SykmeldingStatusType } from '../queryhooks/useSykmeldinger'

function sykmeldingStatus(status: SykmeldingStatusType): 'success' | 'warning' | 'info' {
    if (['SENDT', 'BEKREFTET'].includes(status)) return 'success'
    if (['AVVIST', 'UTGATT', 'AVBRUTT'].includes(status)) return 'warning'
    return 'info'
}

function behandlerNavn(sykmelding: Sykmelding): string {
    if (sykmelding.behandler) {
        const deler = [
            sykmelding.behandler.fornavn,
            sykmelding.behandler.mellomnavn,
            sykmelding.behandler.etternavn,
        ].filter(Boolean)
        if (deler.length > 0) return deler.join(' ')
    }
    return sykmelding.navnFastlege ?? 'Sykmelding'
}

function SykmeldingDetaljer({ sykmelding }: { sykmelding: Sykmelding }) {
    return (
        <Fragment>
            {Object.entries(sykmelding).map(([key, val], idx) => (
                <div key={key + idx}>{`${key}: ${JSON.stringify(val)}`}</div>
            ))}
        </Fragment>
    )
}

export default function TidslinjeSykmeldinger({ sykmeldinger }: { sykmeldinger: Sykmelding[] }) {
    if (sykmeldinger.length === 0) {
        return <Fragment />
    }

    return (
        <div className="min-w-[800px] overflow-x-auto">
            <BodyShort className="mb-2 font-semibold">{`${sykmeldinger.length} sykmelding(er)`}</BodyShort>
            <Timeline>
                {sykmeldinger.map((sykmelding) => (
                    <Timeline.Row key={sykmelding.id} label={behandlerNavn(sykmelding)}>
                        {sykmelding.sykmeldingsperioder.map((periode, idx) => (
                            <Timeline.Period
                                key={`${sykmelding.id}-${idx}`}
                                start={dayjs(periode.fom).toDate()}
                                end={dayjs(periode.tom).toDate()}
                                status={sykmeldingStatus(sykmelding.sykmeldingStatus.statusEvent)}
                            >
                                <SykmeldingDetaljer sykmelding={sykmelding} />
                            </Timeline.Period>
                        ))}
                    </Timeline.Row>
                ))}
                <Timeline.Zoom>
                    <Timeline.Zoom.Button label="3 mnd" interval="month" count={3} />
                    <Timeline.Zoom.Button label="7 mnd" interval="month" count={7} />
                    <Timeline.Zoom.Button label="9 mnd" interval="month" count={9} />
                    <Timeline.Zoom.Button label="1.5 år" interval="year" count={1.5} />
                </Timeline.Zoom>
            </Timeline>
        </div>
    )
}
