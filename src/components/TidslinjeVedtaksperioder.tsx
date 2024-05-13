import { BodyShort, DatePicker, Timeline, useDatepicker } from '@navikt/ds-react'
import React, { Fragment } from 'react'
import dayjs from 'dayjs'

import { FullVedtaksperiodeBehandling } from '../queryhooks/useVedtaksperioder'

export function TidslinjeVedtaksperioder({ vedtaksperioder }: { vedtaksperioder: FullVedtaksperiodeBehandling[] }) {
    const datoer = [] as dayjs.Dayjs[]
    vedtaksperioder.forEach((vp) => {
        datoer.push(dayjs(vp.soknad.fom))
        datoer.push(dayjs(vp.soknad.tom))
    })

    const eldsteDato = datoer.sort((a, b) => (dayjs(a).isBefore(dayjs(b)) ? -1 : 1))[0]
    const nyesteDato = datoer.sort((a, b) => (dayjs(a).isBefore(dayjs(b)) ? 1 : -1))[0]

    const {
        datepickerProps: fraDatepickerProps,
        inputProps: fraInputprops,
        selectedDay: fraSelectedDay,
    } = useDatepicker({
        defaultSelected: eldsteDato.toDate(),
    })

    const {
        datepickerProps: tilDatepickerProps,
        inputProps: tilInputprops,
        selectedDay: tilSelectedDay,
    } = useDatepicker({
        defaultSelected: nyesteDato.add(1, 'week').toDate(),
    })

    // grupper perioder per soknad.orgnummer
    // Map med orgnummer som key og FullVedtaksperiode[] som value
    const mappet = new Map<string, FullVedtaksperiodeBehandling[]>()
    vedtaksperioder.forEach((vp) => {
        const org = vp.soknad.orgnummer || 'ukjent'
        if (mappet.has(org)) {
            mappet.get(org)?.push(vp)
        } else {
            mappet.set(org, [vp])
        }
    })

    return (
        <div className="min-w-[800px] min-h-[2000px] overflow-x-auto">
            <Timeline endDate={tilSelectedDay} startDate={fraSelectedDay}>
                {Array.from(mappet.keys()).map((orgnummer) => {
                    return (
                        <Timeline.Row key={orgnummer} label={orgnummer}>
                            {vedtaksperioder.map((vp) => {
                                return (
                                    <Timeline.Period
                                        start={dayjs(vp.soknad.fom).toDate()}
                                        end={dayjs(vp.soknad.tom).toDate()}
                                        status="neutral"
                                        key={vp.soknad.id}
                                        icon={vp.vedtaksperiode?.sisteSpleisstatus || 'ukjent'}
                                    >
                                        <Fragment>
                                            <BodyShort className="font-bold" spacing>
                                                {vp.vedtaksperiode?.sisteSpleisstatus}
                                            </BodyShort>
                                            <BodyShort spacing>{vp.soknad.id}</BodyShort>
                                            <BodyShort spacing={true}>
                                                {vp.soknad.fom + ' - ' + vp.soknad.tom}
                                            </BodyShort>
                                            <BodyShort spacing>Statushistorikk</BodyShort>
                                            {vp.status.map((status) => {
                                                return (
                                                    <BodyShort spacing key={status.id}>
                                                        {status.status + ' ' + status.tidspunkt}
                                                    </BodyShort>
                                                )
                                            })}
                                        </Fragment>
                                    </Timeline.Period>
                                )
                            })}
                        </Timeline.Row>
                    )
                })}
            </Timeline>
            <div className="mt-20">
                <DatePicker {...fraDatepickerProps}>
                    <DatePicker.Input {...fraInputprops} label="Fra dato" />
                </DatePicker>
                <DatePicker {...tilDatepickerProps} className="inline">
                    <DatePicker.Input {...tilInputprops} label="Til dato" />
                </DatePicker>
            </div>
        </div>
    )
}
