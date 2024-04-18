import { BodyShort, Table, Timeline } from '@navikt/ds-react'
import React, { Fragment } from 'react'
import dayjs from 'dayjs'

import { StatusHistorikk, StatusHistorikk2, VedtaksperiodeResponse } from '../queryhooks/useVedtaksperioder'

export function TidslinjeVedtaksperioder({ vedtaksperioder }: { vedtaksperioder: VedtaksperiodeResponse[] }) {
    const varslerSendt = [] as StatusHistorikk2[]
    const varselEvents = [
        'DITT_SYKEFRAVAER_MANGLER_INNTEKTSMELDING_SENDT',
        'DITT_SYKEFRAVAER_MOTTATT_INNTEKTSMELDING_SENDT',
    ]
    const datoer = [] as dayjs.Dayjs[]
    vedtaksperioder.forEach((vp) => {
        vp.statusHistorikk.forEach((sh) => {
            datoer.push(dayjs(vp.statusHistorikk[0].vedtakFom))
            datoer.push(dayjs(vp.statusHistorikk[0].vedtakTom))
            sh.statusHistorikk.forEach((status) => {
                datoer.push(dayjs(status.opprettet))
                if (varselEvents.includes(status.status)) {
                    varslerSendt.push(status)
                }
            })
        })
    })

    const eldsteDato = datoer.sort((a, b) => (dayjs(a).isBefore(dayjs(b)) ? -1 : 1))[0]
    const nyesteDato = datoer.sort((a, b) => (dayjs(a).isBefore(dayjs(b)) ? 1 : -1))[0]

    return (
        <div className="min-w-[800px] min-h-[2000px] overflow-x-auto">
            <Timeline endDate={nyesteDato.add(1, 'week').toDate()} startDate={eldsteDato.toDate()}>
                {vedtaksperioder.map((vp) => {
                    return (
                        <Timeline.Row key={vp.orgnr} label={vp.orgnr}>
                            {vp.statusHistorikk.map((sh) => {
                                const vedtaksperiodeLesbar = `${dayjs(sh.vedtakFom).format(' D MMMM')} til ${dayjs(sh.vedtakTom).format(' D MMMM')}`
                                return (
                                    <Timeline.Period
                                        start={dayjs(sh.vedtakFom).toDate()}
                                        end={dayjs(sh.vedtakTom).toDate()}
                                        status="neutral"
                                        key={sh.id}
                                        icon={<span>{sisteVedtaksperiodestatus(sh)}</span>}
                                    >
                                        <Fragment>
                                            <BodyShort className="font-bold" spacing>
                                                {vedtaksperiodeLesbar}
                                            </BodyShort>
                                            <BodyShort spacing>Statushistorikk</BodyShort>
                                            <Table size="small">
                                                <Table.Body>
                                                    {sh.statusHistorikk
                                                        .sort((a: StatusHistorikk2, b: StatusHistorikk2) =>
                                                            dayjs(a.opprettet).isBefore(dayjs(b.opprettet)) ? 1 : -1,
                                                        )
                                                        .map((status) => {
                                                            return (
                                                                <Table.Row key={status.id}>
                                                                    <Table.DataCell>
                                                                        {dayjs(status.opprettet).format(
                                                                            'D MMM YYYY HH:mm',
                                                                        )}
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

                {varslerSendt.map((vp, i) => {
                    return (
                        <Timeline.Pin key={i} date={dayjs(vp.opprettet).toDate()}>
                            <p>{vp.status}</p>
                        </Timeline.Pin>
                    )
                })}
            </Timeline>
        </div>
    )
}

const vedtaksperiodeStatuser = [
    'MANGLER_INNTEKTSMELDING',
    'HAR_INNTEKTSMELDING',
    'TRENGER_IKKE_INNTEKTSMELDING',
    'BEHANDLES_UTENFOR_SPLEIS',
    'VEDTAK_FATTET',
]

function sisteVedtaksperiodestatus(statusHistorikk: StatusHistorikk) {
    return statusHistorikk.statusHistorikk
        .sort((a: StatusHistorikk2, b: StatusHistorikk2) => (dayjs(a.opprettet).isBefore(dayjs(b.opprettet)) ? 1 : -1))
        .find((sh) => vedtaksperiodeStatuser.includes(sh.status))?.status
}
