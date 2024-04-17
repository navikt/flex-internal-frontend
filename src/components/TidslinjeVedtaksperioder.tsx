import { BodyShort, Heading, Table, Timeline } from '@navikt/ds-react'
import React, { Fragment } from 'react'
import dayjs from 'dayjs'

import { dayjsToDate } from '../queryhooks/useSoknader'
import { VedtaksperiodeResponse } from '../queryhooks/useVedtaksperioder'

export function TidslinjeVedtaksperioder({ vedtaksperioder }: { vedtaksperioder: VedtaksperiodeResponse[] }) {
    return (
        <div className="min-w-[800px] min-h-[2000px] overflow-x-auto">
            <Timeline>
                {vedtaksperioder.map((vp) => {
                    return (
                        <Timeline.Row key={vp.orgnr} label={vp.orgnr}>
                            {vp.statusHistorikk.map((sh) => {
                                const sisteStatus = sh.statusHistorikk[sh.statusHistorikk.length - 1]

                                return (
                                    <Timeline.Period
                                        start={dayjsToDate(sh.vedtakFom)!}
                                        end={dayjsToDate(sh.vedtakTom)!}
                                        status="neutral"
                                        key={sh.id}
                                    >
                                        <Fragment>
                                            <Heading size="small">{sisteStatus.status}</Heading>
                                            <BodyShort>{sh.orgNavn}</BodyShort>
                                            <BodyShort>{sh.vedtakFom}</BodyShort>
                                            <BodyShort>{sh.vedtakTom}</BodyShort>
                                            <BodyShort>Statushistorikk</BodyShort>
                                            <Table size="small">
                                                <Table.Body>
                                                    {sh.statusHistorikk.map((status) => {
                                                        return (
                                                            <Table.Row key={status.id}>
                                                                <Table.DataCell>
                                                                    {dayjs(status.opprettet).format()}
                                                                </Table.DataCell>
                                                                <Table.DataCell>{status.status}</Table.DataCell>
                                                            </Table.Row>
                                                        )
                                                    })}
                                                </Table.Body>
                                            </Table>
                                        </Fragment>
                                    </Timeline.Period>
                                )
                            })}
                        </Timeline.Row>
                    )
                })}

                <Timeline.Zoom>
                    <Timeline.Zoom.Button label="3 mnd" interval="month" count={3} />
                    <Timeline.Zoom.Button label="6 mnd" interval="month" count={6} />
                    <Timeline.Zoom.Button label="12 mnd" interval="month" count={12} />
                    <Timeline.Zoom.Button label="18 mnd" interval="month" count={18} />
                </Timeline.Zoom>
            </Timeline>
        </div>
    )
}
