import React, { useState } from 'react'
import { StethoscopeIcon, TasklistIcon, SplitHorizontalIcon, EarthIcon } from '@navikt/aksel-icons'
import { BodyShort, Box, Timeline } from '@navikt/ds-react'

import { KlippetSykepengesoknadRecord, Soknad, dayjsToDate } from '../queryhooks/useSoknader'
import type { Sykmelding } from '../queryhooks/useSykmeldinger'
import gruppertOgFiltrert, { SoknadGruppering } from '../utils/gruppering'
import { filtrerPaFilter } from '../utils/filterlogikk'
import { hentDatospenn, validerSykmeldingsDatoer } from '../utils/sykmeldingValidering'
import { beregnAktivTidsvindu, erPeriodeInnenforTidsvindu } from '../utils/tidslinjeUtils'
import { arbeidsgiverLabelForSoknader } from '../utils/soknadArbeidsgiverLabel'

import { Filter, ValgteFilter } from './Filter'
import VelgZoomPeriode from './VelgZoomPeriode'
import { timelinePeriodeStatus } from './soknad/Tidslinje'
import {
    grupperSykmeldingerPaArbeidsgiver,
    perioderMedDatoer,
    sorterPerioder,
    sykmeldingStatus,
} from './sykmelding/sykmeldingTidslinjeUtils'
import ViktigeFeltForSoknad from './periodeinfo/ViktigeFeltForSoknad'
import ViktigeFeltForSykmelding from './periodeinfo/ViktigeFeltForSykmelding'
import DetaljerDrawer, {
    DrawerInnhold,
    lagKlippetSoknadDrawerInnhold,
    lagSykmeldingDrawerInnhold,
    lagSoknadDrawerInnhold,
    lagOppholdUtlandSoknadDrawerInnhold,
} from './DetaljerDrawer'

interface Props {
    sykmeldinger: Sykmelding[]
    soknader: Soknad[]
    klipp: KlippetSykepengesoknadRecord[]
}

export default function TidslinjeKombinert({ sykmeldinger, soknader, klipp }: Props) {
    const [filter, setFilter] = useState<Filter[]>([])
    const [visningsFraDato, setVisningsFraDato] = useState<Date | null>(null)
    const [visningstilDato, setVisningstilDato] = useState<Date | null>(null)
    const [aktivPeriodeId, setAktivPeriodeId] = useState<string | null>(null)
    const [aktivDrawerKildeId, setAktivDrawerKildeId] = useState<string | null>(null)
    const [drawerInnhold, setDrawerInnhold] = useState<DrawerInnhold | null>(null)
    const [drawerPlassering, setDrawerPlassering] = useState<'bunn' | 'hoyre'>('bunn')

    const gyldigeSykmeldinger = validerSykmeldingsDatoer(sykmeldinger)
    const filtrerteSykmeldinger = filtrerPaFilter(gyldigeSykmeldinger, filter)
    const datospennSyk = hentDatospenn(filtrerteSykmeldinger)
    const sykmeldingerGruppertPaArbeidsgiver = grupperSykmeldingerPaArbeidsgiver(filtrerteSykmeldinger)

    const soknaderGruppert = gruppertOgFiltrert(filter, soknader, klipp)
    const filtrerteSoknaderAntall = [...soknaderGruppert.values()].flatMap((arb) =>
        [...arb.sykmeldinger.values()].flatMap((syk) => [...syk.soknader.values()]),
    ).length

    let eldsteFra: Date | null = datospennSyk?.startDato ?? null
    let nysteTil: Date | null = datospennSyk?.sluttDato ?? null

    for (const [arbId, { sykmeldinger: sykGrp }] of soknaderGruppert.entries()) {
        for (const { soknader: sokGrp } of sykGrp.values()) {
            for (const sok of sokGrp.values()) {
                const erOppholdUtland = arbId === 'opphold_utland'
                const fom = erOppholdUtland ? dayjsToDate(sok.soknad.opprettetDato) : dayjsToDate(sok.soknad.fom!)
                const tom = erOppholdUtland ? dayjsToDate(sok.soknad.opprettetDato) : dayjsToDate(sok.soknad.tom!)
                if (fom && (!eldsteFra || fom < eldsteFra)) eldsteFra = fom
                if (tom && (!nysteTil || tom > nysteTil)) nysteTil = tom
            }
        }
    }

    const aktivTidsvindu = beregnAktivTidsvindu(visningsFraDato, visningstilDato, eldsteFra, nysteTil)

    const sykmeldingAntall = aktivTidsvindu
        ? filtrerteSykmeldinger.filter((sykmelding) => {
              const perioder = sorterPerioder(perioderMedDatoer(sykmelding))
              if (perioder.length === 0) return false
              return erPeriodeInnenforTidsvindu(
                  perioder[0].startDato,
                  perioder[perioder.length - 1].sluttDato,
                  aktivTidsvindu.fra,
                  aktivTidsvindu.til,
              )
          }).length
        : filtrerteSykmeldinger.length

    const soknadAntall = aktivTidsvindu
        ? [...soknaderGruppert.entries()].flatMap(([arbId, arb]) =>
              [...arb.sykmeldinger.values()].flatMap((syk) =>
                  [...syk.soknader.values()].filter((sok) => {
                      const erOppholdUtland = arbId === 'opphold_utland'
                      const fom = erOppholdUtland ? dayjsToDate(sok.soknad.opprettetDato) : dayjsToDate(sok.soknad.fom!)
                      const tom = erOppholdUtland ? dayjsToDate(sok.soknad.opprettetDato) : dayjsToDate(sok.soknad.tom!)
                      return fom && tom && erPeriodeInnenforTidsvindu(fom, tom, aktivTidsvindu.fra, aktivTidsvindu.til)
                  }),
              ),
          ).length
        : filtrerteSoknaderAntall

    const sykmeldingRader = aktivTidsvindu
        ? Array.from(sykmeldingerGruppertPaArbeidsgiver.entries()).flatMap(([arbeidsgiverId, arbeidsgiver]) => {
              const perioder_med_innhold = arbeidsgiver.sykmeldinger.flatMap((sykmelding) => {
                  const status = sykmeldingStatus(sykmelding.sykmeldingStatus?.statusEvent)
                  const perioder = sorterPerioder(perioderMedDatoer(sykmelding))

                  if (perioder.length === 0) return []

                  const forstePeriode = perioder[0]
                  const sistePeriode = perioder[perioder.length - 1]

                  if (
                      !erPeriodeInnenforTidsvindu(
                          forstePeriode.startDato,
                          sistePeriode.sluttDato,
                          aktivTidsvindu.fra,
                          aktivTidsvindu.til,
                      )
                  ) {
                      return []
                  }

                  const harFlerePerioder = perioder.length > 1
                  const ikon = harFlerePerioder ? <SplitHorizontalIcon aria-hidden /> : undefined
                  const periodeKey = `${sykmelding.id}-${forstePeriode.fom}-${sistePeriode.tom}`

                  const periodeInfo = <ViktigeFeltForSykmelding sykmelding={sykmelding} perioder={perioder} />

                  const sykmeldingAktivId = sykmelding.id

                  return [
                      <Timeline.Period
                          start={forstePeriode.startDato}
                          end={sistePeriode.sluttDato}
                          status={status}
                          icon={ikon}
                          className="ring-1 ring-inset ring-white/95"
                          key={periodeKey}
                          isActive={aktivPeriodeId === sykmeldingAktivId}
                          onSelectPeriod={() => {
                              if (aktivDrawerKildeId === sykmeldingAktivId) {
                                  setAktivPeriodeId(null)
                                  setAktivDrawerKildeId(null)
                                  setDrawerInnhold(null)
                              } else {
                                  setAktivPeriodeId(sykmeldingAktivId)
                                  setAktivDrawerKildeId(sykmeldingAktivId)
                                  setDrawerInnhold(lagSykmeldingDrawerInnhold(sykmelding, periodeInfo))
                              }
                          }}
                      />,
                  ]
              })

              if (perioder_med_innhold.length === 0) return []

              return [
                  <Timeline.Row
                      key={`syk-${arbeidsgiverId}`}
                      label={arbeidsgiver.label}
                      icon={<StethoscopeIcon aria-hidden fontSize="1.5rem" />}
                  >
                      {perioder_med_innhold}
                  </Timeline.Row>,
              ]
          })
        : []

    const soknadRader = aktivTidsvindu
        ? Array.from(soknaderGruppert.entries()).flatMap(([arbId, arb]) => {
              if (arbId === 'opphold_utland') return []

              const label = arbeidsgiverLabelForSoknader(arbId, arb, soknaderGruppert)

              const perioder_med_innhold = Array.from(arb.sykmeldinger.entries()).flatMap(([sykId, syk]) => {
                  const erGhostSykmelding = sykId.endsWith('_GHOST')

                  return Array.from(syk.soknader.values())
                      .flatMap((sok: SoknadGruppering) => {
                          const klippingAvSoknad = sok.klippingAvSoknad
                              .filter((k) => {
                                  const fom = dayjsToDate(k.fom)
                                  const tom = dayjsToDate(k.tom)
                                  return (
                                      fom &&
                                      tom &&
                                      erPeriodeInnenforTidsvindu(fom, tom, aktivTidsvindu.fra, aktivTidsvindu.til)
                                  )
                              })
                              .map((k) => {
                                  const sykmeldingId = k.sykmeldingUuid ?? null
                                  const erAktiv = aktivPeriodeId !== null && aktivPeriodeId === sykmeldingId
                                  const kildeId = k.id

                                  return (
                                      <Timeline.Period
                                          start={dayjsToDate(k.fom)!}
                                          end={dayjsToDate(k.tom)!}
                                          status="neutral"
                                          key={k.tom}
                                          isActive={erAktiv}
                                          onSelectPeriod={() => {
                                              if (aktivDrawerKildeId === kildeId) {
                                                  setAktivPeriodeId(null)
                                                  setAktivDrawerKildeId(null)
                                                  setDrawerInnhold(null)
                                              } else {
                                                  setAktivPeriodeId(sykmeldingId)
                                                  setAktivDrawerKildeId(kildeId)
                                                  setDrawerInnhold(lagKlippetSoknadDrawerInnhold(k))
                                              }
                                          }}
                                      />
                                  )
                              })

                          if (!erGhostSykmelding) {
                              const sokFom = dayjsToDate(sok.soknad.fom!)
                              const sokTom = dayjsToDate(sok.soknad.tom!)
                              if (
                                  sokFom &&
                                  sokTom &&
                                  erPeriodeInnenforTidsvindu(sokFom, sokTom, aktivTidsvindu.fra, aktivTidsvindu.til)
                              ) {
                                  const sykmeldingId = sok.soknad.sykmeldingId ?? null
                                  const erAktiv = aktivPeriodeId !== null && aktivPeriodeId === sykmeldingId
                                  const kildeId = sok.soknad.id
                                  klippingAvSoknad.push(
                                      <Timeline.Period
                                          start={sokFom}
                                          end={sokTom}
                                          status={timelinePeriodeStatus(sok.soknad.status)}
                                          key={sok.soknad.tom?.toISOString() ?? sok.soknad.id}
                                          isActive={erAktiv}
                                          onSelectPeriod={() => {
                                              if (aktivDrawerKildeId === kildeId) {
                                                  setAktivPeriodeId(null)
                                                  setAktivDrawerKildeId(null)
                                                  setDrawerInnhold(null)
                                              } else {
                                                  setAktivPeriodeId(sykmeldingId)
                                                  setAktivDrawerKildeId(kildeId)
                                                  setDrawerInnhold(
                                                      lagSoknadDrawerInnhold(
                                                          sok.soknad,
                                                          <ViktigeFeltForSoknad soknad={sok.soknad} />,
                                                      ),
                                                  )
                                              }
                                          }}
                                      />,
                                  )
                              }
                          }

                          return klippingAvSoknad
                      })
                      .concat(
                          syk.klippingAvSykmelding
                              .filter((k) => {
                                  const fom = dayjsToDate(k.fom)
                                  const tom = dayjsToDate(k.tom)
                                  return (
                                      fom &&
                                      tom &&
                                      erPeriodeInnenforTidsvindu(fom, tom, aktivTidsvindu.fra, aktivTidsvindu.til)
                                  )
                              })
                              .map((k) => {
                                  const sykmeldingId = k.sykmeldingUuid ?? null
                                  const erAktiv = aktivPeriodeId !== null && aktivPeriodeId === sykmeldingId
                                  const kildeId = k.id

                                  return (
                                      <Timeline.Period
                                          start={dayjsToDate(k.fom)!}
                                          end={dayjsToDate(k.tom)!}
                                          status="neutral"
                                          key={k.tom}
                                          isActive={erAktiv}
                                          onSelectPeriod={() => {
                                              if (aktivDrawerKildeId === kildeId) {
                                                  setAktivPeriodeId(null)
                                                  setAktivDrawerKildeId(null)
                                                  setDrawerInnhold(null)
                                              } else {
                                                  setAktivPeriodeId(sykmeldingId)
                                                  setAktivDrawerKildeId(kildeId)
                                                  setDrawerInnhold(lagKlippetSoknadDrawerInnhold(k))
                                              }
                                          }}
                                      />
                                  )
                              }),
                      )
              })

              if (perioder_med_innhold.length === 0) return []

              return [
                  <Timeline.Row
                      key={`sok-${arbId}`}
                      label={label}
                      icon={<TasklistIcon aria-hidden fontSize="1.5rem" />}
                  >
                      {perioder_med_innhold}
                  </Timeline.Row>,
              ]
          })
        : []

    const oppholdUtlandPins = aktivTidsvindu
        ? Array.from(soknaderGruppert.get('opphold_utland')?.sykmeldinger.values() ?? []).flatMap((syk) =>
              Array.from(syk.soknader.values()).flatMap((sok) => {
                  const dato = dayjsToDate(sok.soknad.opprettetDato)
                  if (!dato) return []
                  const kildeId = sok.soknad.id
                  return [
                      <Timeline.Pin
                          key={sok.soknad.id}
                          date={dato}
                          onClick={() => {
                              if (aktivDrawerKildeId === kildeId) {
                                  setAktivDrawerKildeId(null)
                                  setDrawerInnhold(null)
                              } else {
                                  setAktivDrawerKildeId(kildeId)
                                  setDrawerInnhold(
                                      lagOppholdUtlandSoknadDrawerInnhold(
                                          sok.soknad,
                                          <ViktigeFeltForSoknad soknad={sok.soknad} />,
                                      ),
                                  )
                              }
                          }}
                      >
                          <span className="flex items-center gap-1 text-sm">
                              <EarthIcon aria-hidden fontSize="1.25rem" />
                              Opphold utland søknad
                          </span>
                      </Timeline.Pin>,
                  ]
              }),
          )
        : []

    const labelKlasse = 'kombinert-tidslinje-boks'

    return (
        <div className="min-w-[800px] min-h-[2000px] overflow-x-auto">
            <ValgteFilter filter={filter} setFilter={setFilter} />
            <BodyShort className="font-semibold">{`${sykmeldingAntall} sykmelding(er) · ${soknadAntall} søknad(er)`}</BodyShort>
            <VelgZoomPeriode setFraDato={setVisningsFraDato} setTilDato={setVisningstilDato} />
            {aktivTidsvindu && (
                <>
                    <Box
                        borderColor="brand-blue"
                        borderWidth="2"
                        padding="space-16"
                        borderRadius="12"
                        className={`mb-4 ${labelKlasse}`}
                    >
                        <BodyShort className="font-semibold mb-2">Sykmeldinger</BodyShort>
                        <Timeline
                            endDate={aktivTidsvindu.til}
                            startDate={aktivTidsvindu.fra}
                            key={`syk-${aktivTidsvindu.fra.toISOString()}-${aktivTidsvindu.til.toISOString()}`}
                        >
                            {sykmeldingRader}
                        </Timeline>
                    </Box>
                    <Box
                        borderColor="brand-blue"
                        borderWidth="2"
                        padding="space-16"
                        borderRadius="12"
                        className={labelKlasse}
                    >
                        <BodyShort className="font-semibold mb-2">Søknader</BodyShort>
                        <Timeline
                            endDate={aktivTidsvindu.til}
                            startDate={aktivTidsvindu.fra}
                            key={`sok-${aktivTidsvindu.fra.toISOString()}-${aktivTidsvindu.til.toISOString()}`}
                        >
                            {soknadRader}
                            {oppholdUtlandPins}
                        </Timeline>
                    </Box>
                </>
            )}
            <DetaljerDrawer
                innhold={drawerInnhold}
                filter={filter}
                setFilter={setFilter}
                plassering={drawerPlassering}
                setPlassering={setDrawerPlassering}
                onLukk={() => {
                    setAktivDrawerKildeId(null)
                    setDrawerInnhold(null)
                }}
            />
        </div>
    )
}
