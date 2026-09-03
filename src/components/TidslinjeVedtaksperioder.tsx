import { BodyShort, DatePicker, Link, ReadMore, Switch, Table, Timeline, useDatepicker } from '@navikt/ds-react'
import { addWeeks, isBefore } from 'date-fns'
import React, { Fragment, useState } from 'react'

import {
    ForelagteOpplysningerDbRecord,
    FullVedtaksperiodeBehandling,
    VedtaksperiodeBehandlingStatusDbRecord,
} from '../queryhooks/useVedtaksperioderMedInntektsmeldinger'
import { formaterDato, toDate } from '../utils/dato-utils'
import { sporingUrl } from '../utils/environment'
import { formatterTimestamp } from '../utils/formatterDatoer'

import { VelgManederKnapp } from './VelgManederKnapp'

export function TidslinjeVedtaksperioder({
    vedtaksperioder,
    forelagteOpplysninger,
}: {
    vedtaksperioder: FullVedtaksperiodeBehandling[]
    forelagteOpplysninger: ForelagteOpplysningerDbRecord[]
}) {
    const datoer: Date[] = []
    vedtaksperioder.forEach((vp) => {
        vp.soknader.forEach((soknad) => {
            datoer.push(toDate(soknad.fom))
            datoer.push(toDate(soknad.tom))
        })
        vp.statuser.forEach((status) => {
            datoer.push(toDate(status.tidspunkt))
        })
    })
    forelagteOpplysninger.forEach((fo) => {
        if (fo.statusEndret != null) {
            datoer.push(toDate(fo.statusEndret))
        }
        datoer.push(toDate(fo.opprettet))
        datoer.push(toDate(fo.opprinneligOpprettet))
    })

    const eldsteDato = datoer.sort((a, b) => (isBefore(a, b) ? -1 : 1))[0]
    const nyesteDato = datoer.sort((a, b) => (isBefore(a, b) ? 1 : -1))[0]
    const [fjernDuplikatStatus, setFjernDuplikatStatus] = useState(true)

    const {
        datepickerProps: fraDatepickerProps,
        inputProps: fraInputprops,
        selectedDay: fraSelectedDay,
        setSelected: setFraSelected,
    } = useDatepicker({
        defaultSelected: eldsteDato,
    })

    const {
        datepickerProps: tilDatepickerProps,
        inputProps: tilInputprops,
        selectedDay: tilSelectedDay,
        setSelected: setTilSelected,
    } = useDatepicker({
        defaultSelected: addWeeks(nyesteDato, 1),
    })

    // grupper perioder per soknad.orgnummer
    // Map med orgnummer som key og FullVedtaksperiode[] som value
    const mappet = new Map<string, FullVedtaksperiodeBehandling[]>()
    vedtaksperioder.forEach((vp) => {
        const org = vp.soknader[0].orgnummer || vp.soknader[0].soknadstype
        if (mappet.has(org)) {
            mappet.get(org)?.push(vp)
        } else {
            mappet.set(org, [vp])
        }
    })

    const varslinger: VedtaksperiodeBehandlingStatusDbRecord[] = []
    vedtaksperioder.forEach((vp) => {
        vp.statuser.forEach((status) => {
            if (
                [
                    'VARSLET_MANGLER_INNTEKTSMELDING_FØRSTE',
                    'VARSLET_MANGLER_INNTEKTSMELDING_ANDRE',
                    'VARSLET_VENTER_PÅ_SAKSBEHANDLER_FØRSTE',
                    'REVARSLET_VENTER_PÅ_SAKSBEHANDLER',
                ].includes(status.status)
            ) {
                varslinger.push(status)
            }
        })
    })

    const forelagteMap = new Map<string, ForelagteOpplysningerDbRecord>()
    forelagteOpplysninger.forEach((fo) => {
        forelagteMap.set(`${fo.vedtaksperiodeId}-${fo.behandlingId}`, fo)
    })

    return (
        <div className="min-w-[800px] min-h-[2000px] overflow-x-auto">
            <Timeline endDate={tilSelectedDay} startDate={fraSelectedDay}>
                {varslinger.map((status) => {
                    return (
                        <Timeline.Pin key={status.id} date={toDate(status.tidspunkt)}>
                            <p>{status.status}</p>
                            <p>{formatterTimestamp(status.tidspunkt)}</p>
                        </Timeline.Pin>
                    )
                })}
                {forelagteOpplysninger.map((fo) => {
                    const pinDato = fo.status === 'SENDT' ? fo.statusEndret : fo.opprinneligOpprettet
                    if (!pinDato) return null
                    return (
                        <Timeline.Pin key={fo.id} date={toDate(pinDato)}>
                            <p>Forelagt opplysninger fra A-Ordningen</p>
                            <p>Status: {fo.status}</p>
                            <p>{formatterTimestamp(pinDato)}</p>
                            {fo.forelagteOpplysningerMelding && (
                                <ReadMore header="Inntektsdata">
                                    <p>
                                        Omregnet årsinntekt:{' '}
                                        {fo.forelagteOpplysningerMelding.omregnetÅrsinntekt.toLocaleString('nb-NO')} kr
                                    </p>
                                    <ul>
                                        {fo.forelagteOpplysningerMelding.skatteinntekter.map((si) => (
                                            <li key={si.måned}>
                                                {si.måned}: {si.beløp.toLocaleString('nb-NO')} kr
                                            </li>
                                        ))}
                                    </ul>
                                </ReadMore>
                            )}
                        </Timeline.Pin>
                    )
                })}
                {Array.from(mappet.keys()).map((orgnummer) => {
                    const filtrertePerioder = vedtaksperioder.filter(
                        (vp) => (vp.soknader[0].orgnummer || vp.soknader[0].soknadstype) === orgnummer,
                    )
                    const gruppert = Object.values(
                        Object.groupBy(filtrertePerioder, (d) => d.soknader[0].fom + ' - ' + d.soknader[0].tom),
                    )

                    return (
                        <Timeline.Row key={orgnummer} label={orgnummer}>
                            {gruppert.map((vp) => {
                                if (!vp) return null

                                const sortertEtterOppdatert = vp.sort((a, b) => {
                                    const oppdatertB = b.vedtaksperiode.oppdatert
                                        ? toDate(b.vedtaksperiode.oppdatert)
                                        : new Date(0)
                                    return (
                                        toDate(a.vedtaksperiode.oppdatert).getTime() / 1000 -
                                        oppdatertB.getTime() / 1000
                                    )
                                })
                                const nyeste = sortertEtterOppdatert[sortertEtterOppdatert.length - 1]
                                const vedtaksperiodeLesbar = `${formaterDato(toDate(nyeste.soknader[0].fom), ' d MMMM')} til ${formaterDato(toDate(nyeste.soknader[0].tom), ' d MMMM')}`

                                const flereSoknader = nyeste.soknader.length > 1
                                let iconTekst = nyeste.vedtaksperiode.sisteSpleisstatus
                                if (flereSoknader) {
                                    iconTekst += ' (⚠️ flere søknader på en vedtaksperiode)'
                                }
                                return (
                                    <Timeline.Period
                                        start={toDate(nyeste.soknader[0].fom)}
                                        end={toDate(nyeste.soknader[0].tom)}
                                        status="neutral"
                                        key={nyeste.vedtaksperiode.id}
                                        icon={iconTekst}
                                    >
                                        <Fragment>
                                            <BodyShort className="font-ax-bold" spacing>
                                                {nyeste.vedtaksperiode.sisteSpleisstatus}
                                            </BodyShort>
                                            <BodyShort spacing={true}>{vedtaksperiodeLesbar}</BodyShort>
                                            <BodyShort className="font-ax-bold" spacing>
                                                Behandlinger
                                            </BodyShort>
                                            {sortertEtterOppdatert.map((behandling) => {
                                                const statuserMedForelegging: Array<
                                                    Omit<VedtaksperiodeBehandlingStatusDbRecord, 'status'> & {
                                                        status: string
                                                    }
                                                > = [...behandling.statuser]
                                                const forelagt = forelagteMap.get(
                                                    `${behandling.vedtaksperiode.vedtaksperiodeId}-${behandling.vedtaksperiode.behandlingId}`,
                                                )
                                                if (forelagt) {
                                                    statuserMedForelegging.push({
                                                        id: forelagt.id,
                                                        brukervarselId: null,
                                                        dittSykefravaerMeldingId: null,
                                                        opprettetDatabase: forelagt.opprettet,
                                                        status: `FORELAGTE_OPPLYSNINGER_NY`,
                                                        tidspunkt: forelagt.opprinneligOpprettet,
                                                        vedtaksperiodeBehandlingId: behandling.vedtaksperiode.id!,
                                                    })

                                                    if (forelagt.statusEndret && forelagt.status !== 'NY') {
                                                        statuserMedForelegging.push({
                                                            id: forelagt.id,
                                                            brukervarselId: null,
                                                            dittSykefravaerMeldingId: null,
                                                            opprettetDatabase: forelagt.opprettet,
                                                            status: `FORELAGTE_OPPLYSNINGER_${forelagt.status}`,
                                                            tidspunkt: forelagt.statusEndret,
                                                            vedtaksperiodeBehandlingId: behandling.vedtaksperiode.id!,
                                                        })
                                                    }
                                                }
                                                const sortert = statuserMedForelegging.sort((a, b) =>
                                                    a.tidspunkt.localeCompare(b.tidspunkt),
                                                )

                                                const tidligstePerStatus: typeof statuserMedForelegging = []
                                                let forrigeStatus: string | undefined = undefined

                                                for (const element of sortert) {
                                                    if (element.status !== forrigeStatus) {
                                                        tidligstePerStatus.push(element)
                                                        forrigeStatus = element.status
                                                    }
                                                }
                                                return (
                                                    <>
                                                        <Table size="small" className="mb-4">
                                                            <Table.Body>
                                                                <Table.Row>
                                                                    <Table.DataCell>
                                                                        Spleisstatus tidspunkt
                                                                    </Table.DataCell>
                                                                    <Table.DataCell>
                                                                        {formatterTimestamp(
                                                                            behandling.vedtaksperiode
                                                                                .sisteSpleisstatusTidspunkt,
                                                                        )}
                                                                    </Table.DataCell>
                                                                </Table.Row>
                                                                {behandling.vedtaksperiode
                                                                    .sisteVarslingstatusTidspunkt && (
                                                                    <Table.Row>
                                                                        <Table.DataCell>
                                                                            Varslingstatus tidspunkt
                                                                        </Table.DataCell>
                                                                        <Table.DataCell>
                                                                            {formatterTimestamp(
                                                                                behandling.vedtaksperiode
                                                                                    .sisteVarslingstatusTidspunkt,
                                                                            )}
                                                                        </Table.DataCell>
                                                                    </Table.Row>
                                                                )}
                                                                {behandling.vedtaksperiode.sisteVarslingstatus && (
                                                                    <Table.Row>
                                                                        <Table.DataCell>Varslingstatus</Table.DataCell>
                                                                        <Table.DataCell>
                                                                            {
                                                                                behandling.vedtaksperiode
                                                                                    .sisteVarslingstatus
                                                                            }
                                                                        </Table.DataCell>
                                                                    </Table.Row>
                                                                )}
                                                                <Table.Row>
                                                                    <Table.DataCell>VedtaksperiodeId</Table.DataCell>
                                                                    <Table.DataCell>
                                                                        <Link
                                                                            href={`${sporingUrl()}/tilstandsmaskin/${behandling.vedtaksperiode.vedtaksperiodeId}`}
                                                                        >
                                                                            {behandling.vedtaksperiode.vedtaksperiodeId}
                                                                        </Link>
                                                                    </Table.DataCell>
                                                                </Table.Row>
                                                                <Table.Row>
                                                                    <Table.DataCell>BehandlingId</Table.DataCell>
                                                                    <Table.DataCell>
                                                                        {behandling.vedtaksperiode.behandlingId}
                                                                    </Table.DataCell>
                                                                </Table.Row>
                                                                {behandling.soknader.map((soknad) => {
                                                                    return (
                                                                        <>
                                                                            <Table.Row>
                                                                                <Table.DataCell>
                                                                                    SykepengesoknadUUID
                                                                                </Table.DataCell>
                                                                                <Table.DataCell>
                                                                                    {soknad.sykepengesoknadUuid}
                                                                                </Table.DataCell>
                                                                            </Table.Row>
                                                                            <Table.Row>
                                                                                <Table.DataCell>
                                                                                    Søknad sendt
                                                                                </Table.DataCell>
                                                                                <Table.DataCell>
                                                                                    {formatterTimestamp(soknad.sendt)}
                                                                                </Table.DataCell>
                                                                            </Table.Row>
                                                                            <Table.Row>
                                                                                <Table.DataCell>
                                                                                    Søknad start syketilfelle
                                                                                </Table.DataCell>
                                                                                <Table.DataCell>
                                                                                    {formatterTimestamp(
                                                                                        soknad.startSyketilfelle,
                                                                                    )}
                                                                                </Table.DataCell>
                                                                            </Table.Row>
                                                                        </>
                                                                    )
                                                                })}
                                                                {(fjernDuplikatStatus
                                                                    ? tidligstePerStatus
                                                                    : sortert
                                                                ).map((status) => {
                                                                    return (
                                                                        <Table.Row key={status.id}>
                                                                            <Table.DataCell>
                                                                                {formatterTimestamp(status.tidspunkt)}
                                                                            </Table.DataCell>
                                                                            <Table.DataCell>
                                                                                {status.status}
                                                                            </Table.DataCell>
                                                                        </Table.Row>
                                                                    )
                                                                })}
                                                            </Table.Body>
                                                        </Table>
                                                    </>
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

            <div className="flex justify-evenly mt-8">
                <ul className="flex navds-timeline__zoom" style={{ float: 'none', marginTop: 0 }}>
                    <VelgManederKnapp maneder={1} setFraSelected={setFraSelected} setTilSelected={setTilSelected} />
                    <VelgManederKnapp maneder={3} setFraSelected={setFraSelected} setTilSelected={setTilSelected} />
                    <VelgManederKnapp maneder={6} setFraSelected={setFraSelected} setTilSelected={setTilSelected} />
                    <VelgManederKnapp maneder={12} setFraSelected={setFraSelected} setTilSelected={setTilSelected} />
                </ul>
                <ReadMore header="Velg datoer" className="mb-8">
                    <div className="mt-4 flex gap-x-2">
                        <DatePicker {...fraDatepickerProps}>
                            <DatePicker.Input {...fraInputprops} label="Fra" />
                        </DatePicker>
                        <DatePicker {...tilDatepickerProps}>
                            <DatePicker.Input {...tilInputprops} label="Til" />
                        </DatePicker>
                    </div>
                </ReadMore>
                <Switch
                    size="small"
                    checked={fjernDuplikatStatus}
                    onChange={(e) => setFjernDuplikatStatus(e.target.checked)}
                >
                    Skjul duplikat statuser
                </Switch>
            </div>
        </div>
    )
}
