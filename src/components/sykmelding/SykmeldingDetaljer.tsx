import React, { Fragment } from 'react'

import { Sykmelding } from '../../queryhooks/useSykmeldinger'

const SykmeldingDetaljer = ({ sykmelding }: { sykmelding: Sykmelding }) => (
    <Fragment>
        <div>{`id: ${sykmelding.id}`}</div>
        <div>{`mottattTidspunkt: ${sykmelding.mottattTidspunkt}`}</div>
        <div>{`behandletTidspunkt: ${sykmelding.behandletTidspunkt}`}</div>
        <div>{`arbeidsgiver: ${sykmelding.arbeidsgiver?.navn ?? 'Ukjent'}`}</div>
        <div>{`status: ${sykmelding.sykmeldingStatus?.statusEvent ?? 'Ukjent status'}`}</div>
        <div>{`perioder: ${sykmelding.sykmeldingsperioder.length}`}</div>
        <div>{`egenmeldt: ${sykmelding.egenmeldt}`}</div>
        <div>{`papirsykmelding: ${sykmelding.papirsykmelding}`}</div>
    </Fragment>
)

export default SykmeldingDetaljer
