import { DatePicker, ReadMore, Timeline, useDatepicker } from '@navikt/ds-react'
import React, { Fragment } from 'react'
import dayjs from 'dayjs'

import { AaregResponse, Arbeidsforholdoversikter } from '../queryhooks/useAareg'

import { VelgManederKnapp } from './VelgManederKnapp'

export function TidslinjeAareg({ aaregresponse }: { aaregresponse: AaregResponse }) {
    const datoer = [] as dayjs.Dayjs[]
    const ao = aaregresponse.arbeidsforholdoversikter
    ao.forEach((vp) => {
        vp.startdato && datoer.push(dayjs(vp.startdato))
        vp.sluttdato && datoer.push(dayjs(vp.sluttdato))
    })
    datoer.push(dayjs().add(1, 'week'))

    const eldsteDato = datoer.sort((a, b) => (dayjs(a).isBefore(dayjs(b)) ? -1 : 1))[0]
    const nyesteDato = datoer.sort((a, b) => (dayjs(a).isBefore(dayjs(b)) ? 1 : -1))[0]

    const {
        datepickerProps: fraDatepickerProps,
        inputProps: fraInputprops,
        selectedDay: fraSelectedDay,
        setSelected: setFraSelected,
    } = useDatepicker({
        defaultSelected: eldsteDato.toDate(),
    })

    const {
        datepickerProps: tilDatepickerProps,
        inputProps: tilInputprops,
        selectedDay: tilSelectedDay,
        setSelected: setTilSelected,
    } = useDatepicker({
        defaultSelected: nyesteDato.add(1, 'week').toDate(),
    })

    // grupper perioder per soknad.orgnummer
    // Map med orgnummer som key og FullVedtaksperiode[] som value
    const mappet = new Map<string, Arbeidsforholdoversikter[]>()
    ao.forEach((a) => {
        const org = a.opplysningspliktig.identer[0].ident + ' - ' + a.arbeidssted.identer[0].ident
        if (mappet.has(org)) {
            mappet.get(org)?.push(a)
        } else {
            mappet.set(org, [a])
        }
    })

    return (
        <div className="min-w-[800px] min-h-[2000px] overflow-x-auto">
            <Timeline endDate={tilSelectedDay} startDate={fraSelectedDay}>
                {Array.from(mappet.keys()).map((orgnummer) => {
                    const gruppert = mappet.get(orgnummer)

                    return (
                        <Timeline.Row key={orgnummer} label={orgnummer}>
                            {gruppert?.map((ao, i) => {
                                function sluttDatoEllerToUkerTil() {
                                    if (ao.sluttdato) {
                                        return dayjs(ao.sluttdato).toDate()
                                    }

                                    return dayjs(ao.startdato).add(2, 'week').toDate()
                                }

                                return (
                                    <Timeline.Period
                                        start={dayjs(ao.startdato).toDate()}
                                        end={sluttDatoEllerToUkerTil()}
                                        status="neutral"
                                        key={i}
                                        icon={ao.yrke.beskrivelse}
                                    >
                                        <Fragment>
                                            <pre className="text-small">{JSON.stringify(ao, null, 2)}</pre>
                                        </Fragment>
                                    </Timeline.Period>
                                )
                            })}
                        </Timeline.Row>
                    )
                })}
            </Timeline>
            <div>
                <ul className="flex navds-timeline__zoom" style={{ float: 'none' }}>
                    <VelgManederKnapp maneder={1} setFraSelected={setFraSelected} setTilSelected={setTilSelected} />
                    <VelgManederKnapp maneder={3} setFraSelected={setFraSelected} setTilSelected={setTilSelected} />
                    <VelgManederKnapp maneder={6} setFraSelected={setFraSelected} setTilSelected={setTilSelected} />
                    <VelgManederKnapp maneder={12} setFraSelected={setFraSelected} setTilSelected={setTilSelected} />
                </ul>
            </div>
            <ReadMore header="Velg datoer">
                <div className="mt-4 flex gap-x-2">
                    <DatePicker {...fraDatepickerProps}>
                        <DatePicker.Input {...fraInputprops} label="Fra" />
                    </DatePicker>
                    <DatePicker {...tilDatepickerProps}>
                        <DatePicker.Input {...tilInputprops} label="Til" />
                    </DatePicker>
                </div>
            </ReadMore>
        </div>
    )
}
