import { DatePicker, ReadMore, Timeline, useDatepicker } from '@navikt/ds-react'
import React from 'react'
import dayjs from 'dayjs'

import { AaregResponse, Arbeidsforhold } from '../queryhooks/useAareg'

import VelgZoomPeriode from './VelgZoomPeriode'

export function TidslinjeAareg({ aaregresponse }: { aaregresponse: AaregResponse }) {
    const datoer = [] as dayjs.Dayjs[]
    aaregresponse.forEach((arbeidsforhold) => {
        if (arbeidsforhold.ansettelsesperiode.startdato) {
            datoer.push(dayjs(arbeidsforhold.ansettelsesperiode.startdato))
        }
        if (arbeidsforhold.ansettelsesperiode.sluttdato) {
            datoer.push(dayjs(arbeidsforhold.ansettelsesperiode.sluttdato))
        }
    })
    datoer.push(dayjs().add(1, 'week'))

    const sorterteDatoer = datoer.slice().sort((a, b) => a.valueOf() - b.valueOf())
    const eldsteDato = sorterteDatoer[0]
    const nyesteDato = sorterteDatoer[sorterteDatoer.length - 1]
    const defaultFraDato = eldsteDato.toDate()
    const defaultTilDato = nyesteDato.add(1, 'week').toDate()

    const {
        datepickerProps: fraDatepickerProps,
        inputProps: fraInputprops,
        selectedDay: fraSelectedDay,
        setSelected: setFraSelected,
    } = useDatepicker({
        defaultSelected: defaultFraDato,
    })

    const {
        datepickerProps: tilDatepickerProps,
        inputProps: tilInputprops,
        selectedDay: tilSelectedDay,
        setSelected: setTilSelected,
    } = useDatepicker({
        defaultSelected: defaultTilDato,
    })

    const arbeidsforholdPerOrgnummer = new Map<string, Arbeidsforhold[]>()
    aaregresponse.forEach((arbeidsforhold) => {
        const orgnummer =
            arbeidsforhold.opplysningspliktig.identer[0].ident + ' - ' + arbeidsforhold.arbeidssted.identer[0].ident

        if (arbeidsforholdPerOrgnummer.has(orgnummer)) {
            arbeidsforholdPerOrgnummer.get(orgnummer)?.push(arbeidsforhold)
        } else {
            arbeidsforholdPerOrgnummer.set(orgnummer, [arbeidsforhold])
        }
    })

    const sluttDatoEllerToUkerTil = (arbeidsforhold: Arbeidsforhold) => {
        if (arbeidsforhold.ansettelsesperiode.sluttdato) {
            return dayjs(arbeidsforhold.ansettelsesperiode.sluttdato).toDate()
        }

        return dayjs().add(2, 'week').toDate()
    }

    return (
        <div className="min-w-[800px] min-h-[2000px] overflow-x-auto">
            <VelgZoomPeriode
                setFraDato={(dato) => {
                    setFraSelected(dato ?? defaultFraDato)
                }}
                setTilDato={(dato) => {
                    setTilSelected(dato ?? defaultTilDato)
                }}
                maxTilDato={defaultTilDato}
            />
            <Timeline endDate={tilSelectedDay} startDate={fraSelectedDay}>
                {Array.from(arbeidsforholdPerOrgnummer.entries()).map(([orgnummer, arbeidsforhold]) => {
                    return (
                        <Timeline.Row key={orgnummer} label={orgnummer}>
                            {arbeidsforhold.map((ao) => {
                                if (!ao.ansettelsesperiode.startdato) {
                                    return null
                                }

                                const periodeNokkel =
                                    ao.arbeidssted.identer[0].ident +
                                    '-' +
                                    ao.ansettelsesperiode.startdato +
                                    '-' +
                                    (ao.ansettelsesperiode.sluttdato ?? 'aktiv')

                                return (
                                    <Timeline.Period
                                        start={dayjs(ao.ansettelsesperiode.startdato).toDate()}
                                        end={sluttDatoEllerToUkerTil(ao)}
                                        status="neutral"
                                        key={periodeNokkel}
                                        icon={ao.arbeidssted.identer[0].ident}
                                    >
                                        <pre className="text-ax-small">{JSON.stringify(ao, null, 2)}</pre>
                                    </Timeline.Period>
                                )
                            })}
                        </Timeline.Row>
                    )
                })}
            </Timeline>
            <ReadMore header="Velg datoer">
                <div className="mt-4 flex gap-x-2">
                    <DatePicker {...fraDatepickerProps} dropdownCaption>
                        <DatePicker.Input {...fraInputprops} label="Fra" />
                    </DatePicker>
                    <DatePicker {...tilDatepickerProps} dropdownCaption>
                        <DatePicker.Input {...tilInputprops} label="Til" />
                    </DatePicker>
                </div>
            </ReadMore>
        </div>
    )
}
