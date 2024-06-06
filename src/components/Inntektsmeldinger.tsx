import React from 'react'
import { Alert } from '@navikt/ds-react'

import { InntektsmeldingDbRecord } from '../queryhooks/useInntektsmeldinger'
import { formatterTimestamp } from '../utils/formatterDatoer'

export function InntektsmeldingView({ inntektsmeldinger }: { inntektsmeldinger: InntektsmeldingDbRecord[] }) {
    if (inntektsmeldinger.length === 0) {
        return <Alert variant="info">Ingen inntektsmeldinger registrert</Alert>
    }
    return (
        <div>
            {inntektsmeldinger.map((inntektsmelding) => (
                <div key={inntektsmelding.id} className="mb-2 bg-bg-subtle rounded-2xl p-4">
                    <div>InntektsmeldingId: {inntektsmelding.inntektsmeldingId}</div>
                    <div>Arbeidsgivertype: {inntektsmelding.arbeidsgivertype}</div>
                    <div>Virksomhetsnummer: {inntektsmelding.virksomhetsnummer}</div>
                    <div>Full refusjon: {inntektsmelding.fullRefusjon ? 'Ja' : 'Nei'}</div>
                    <div>Opprettet: {formatterTimestamp(inntektsmelding.opprettet)}</div>
                    <div>Mottatt dato: {formatterTimestamp(inntektsmelding.mottattDato)}</div>
                    <div>Første fraværsdag: {inntektsmelding.foersteFravaersdag}</div>
                    <div>VedtaksperiodeId: {inntektsmelding.vedtaksperiodeId}</div>
                </div>
            ))}
        </div>
    )
}
