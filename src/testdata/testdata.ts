import { BackendProxyOpts, validerKall } from '../proxy/backendproxy'
import {
    FullVedtaksperiodeBehandling,
    InntektsmeldingDbRecord,
} from '../queryhooks/useVedtaksperioderMedInntektsmeldinger'

const testdata = {
    sykepengesoknadListe: [
        {
            id: '124f3422-36f7-33f5-bfd3-1d3080545246',
            sykmeldingId: '70df59fa-e1a3-4f38-bc3d-6a1fb2349c04',
            soknadstype: 'ARBEIDSTAKERE',
            status: 'SENDT',
            fom: '2023-01-01',
            tom: '2023-01-29',
            opprettetDato: '2023-06-12T16:24:31.185172',
            sendtTilNAVDato: '2023-06-13T10:09:31.045548',
            sendtTilArbeidsgiverDato: '2023-06-13T10:09:31.045548',
            avbruttDato: null,
            startSykeforlop: '2023-01-01',
            sykmeldingUtskrevet: '2023-01-01T01:00:00',
            sykmeldingSignaturDato: null,
            arbeidsgiver: null,
            arbeidsgiverNavn: 'Klonelabben',
            arbeidsgiverOrgnummer: '907670201',
            korrigerer: null,
            korrigertAv: null,
            arbeidssituasjon: 'ARBEIDSTAKER',
            soknadPerioder: [
                {
                    fom: '2023-01-01',
                    tom: '2023-01-29',
                    grad: 50,
                    sykmeldingstype: 'GRADERT',
                },
            ],
            merknaderFraSykmelding: null,
        },
        {
            id: 'b1621dbb-2d0a-3a82-b8be-d892a91fd7cf',
            sykmeldingId: '70df59fa-e1a3-4f38-bc3d-6a1fb2349c04',
            soknadstype: 'ARBEIDSTAKERE',
            status: 'SENDT',
            fom: '2023-01-30',
            tom: '2023-02-26',
            opprettetDato: '2023-06-12T16:24:31.185225',
            sendtTilNAVDato: '2023-06-13T10:09:41.301409',
            sendtTilArbeidsgiverDato: '2023-06-13T10:09:41.301409',
            avbruttDato: null,
            startSykeforlop: '2023-01-01',
            sykmeldingUtskrevet: '2023-01-01T01:00:00',
            sykmeldingSignaturDato: null,
            arbeidsgiver: null,
            arbeidsgiverNavn: 'Klonelabben',
            arbeidsgiverOrgnummer: '907670201',
            korrigerer: null,
            korrigertAv: null,
            arbeidssituasjon: 'ARBEIDSTAKER',
            soknadPerioder: [
                {
                    fom: '2023-01-30',
                    tom: '2023-02-26',
                    grad: 50,
                    sykmeldingstype: 'GRADERT',
                },
            ],
            merknaderFraSykmelding: null,
        },
        {
            id: '813adafc-d468-304c-a00d-917c3ab31a08',
            sykmeldingId: '70df59fa-e1a3-4f38-bc3d-6a1fb2349c04',
            soknadstype: 'ARBEIDSTAKERE',
            status: 'NY',
            fom: '2023-02-27',
            tom: '2023-03-26',
            opprettetDato: '2023-06-12T16:24:31.18527',
            sendtTilNAVDato: null,
            sendtTilArbeidsgiverDato: null,
            avbruttDato: null,
            startSykeforlop: '2023-01-01',
            sykmeldingUtskrevet: '2023-01-01T01:00:00',
            sykmeldingSignaturDato: null,
            arbeidsgiver: null,
            arbeidsgiverNavn: 'Klonelabben',
            arbeidsgiverOrgnummer: '907670201',
            korrigerer: null,
            korrigertAv: null,
            arbeidssituasjon: 'ARBEIDSTAKER',
            soknadPerioder: [
                {
                    fom: '2023-02-27',
                    tom: '2023-03-26',
                    grad: 50,
                    sykmeldingstype: 'GRADERT',
                },
            ],
            merknaderFraSykmelding: null,
        },
        {
            id: '84fffb36-2dd7-357c-bfc3-c22ce7368851',
            sykmeldingId: '884b8a9f-e24a-432d-b1c6-89bbac272513',
            soknadstype: 'ARBEIDSTAKERE',
            status: 'NY',
            fom: '2023-04-10',
            tom: '2023-04-16',
            opprettetDato: '2023-06-12T16:24:43.617707',
            sendtTilNAVDato: null,
            sendtTilArbeidsgiverDato: null,
            avbruttDato: null,
            startSykeforlop: '2023-01-01',
            sykmeldingUtskrevet: '2023-04-10T02:00:00',
            sykmeldingSignaturDato: null,
            arbeidsgiver: null,
            arbeidsgiverNavn: 'Klonelabben',
            arbeidsgiverOrgnummer: '907670201',
            korrigerer: null,
            korrigertAv: null,
            arbeidssituasjon: 'ARBEIDSTAKER',
            soknadPerioder: [
                {
                    fom: '2023-04-10',
                    tom: '2023-04-16',
                    grad: 50,
                    sykmeldingstype: 'GRADERT',
                },
            ],
            merknaderFraSykmelding: null,
        },
        {
            id: '8ec860d4-b4ad-34bf-9d94-5c363aade289',
            sykmeldingId: 'd02d8d3a-b58e-44b2-8b41-5279865360a6',
            soknadstype: 'ARBEIDSTAKERE',
            status: 'NY',
            fom: '2023-04-17',
            tom: '2023-04-23',
            opprettetDato: '2023-06-12T16:25:14.513627',
            sendtTilNAVDato: null,
            sendtTilArbeidsgiverDato: null,
            avbruttDato: null,
            startSykeforlop: '2023-01-01',
            sykmeldingUtskrevet: '2023-04-17T02:00:00',
            sykmeldingSignaturDato: null,
            arbeidsgiver: null,
            arbeidsgiverNavn: 'Klonelabben',
            arbeidsgiverOrgnummer: '907670201',
            korrigerer: null,
            korrigertAv: null,
            arbeidssituasjon: 'ARBEIDSTAKER',
            soknadPerioder: [
                {
                    fom: '2023-04-17',
                    tom: '2023-04-23',
                    grad: 60,
                    sykmeldingstype: 'GRADERT',
                },
            ],
            merknaderFraSykmelding: null,
        },
        {
            id: '7ee89646-1feb-34df-85f0-f18e9d30bba5',
            sykmeldingId: '2e6666d0-2540-40f2-99b6-083cbd91934d',
            soknadstype: 'ARBEIDSTAKERE',
            status: 'NY',
            fom: '2023-04-24',
            tom: '2023-04-26',
            opprettetDato: '2023-06-12T16:25:23.350876',
            sendtTilNAVDato: null,
            sendtTilArbeidsgiverDato: null,
            avbruttDato: null,
            startSykeforlop: '2023-01-01',
            sykmeldingUtskrevet: '2023-04-24T02:00:00',
            sykmeldingSignaturDato: null,
            arbeidsgiver: null,
            arbeidsgiverNavn: 'Klonelabben',
            arbeidsgiverOrgnummer: '907670201',
            korrigerer: null,
            korrigertAv: null,
            arbeidssituasjon: 'ARBEIDSTAKER',
            soknadPerioder: [
                {
                    fom: '2023-04-24',
                    tom: '2023-04-26',
                    grad: 80,
                    sykmeldingstype: 'GRADERT',
                },
            ],
            merknaderFraSykmelding: null,
        },
        {
            id: '6cfdd38f-ebf4-373b-96e9-e5b4f9558940',
            sykmeldingId: 'de68e6ed-3cb6-4e3b-9cf0-0a07c234c629',
            soknadstype: 'ARBEIDSTAKERE',
            status: 'NY',
            fom: '2023-04-27',
            tom: '2023-05-21',
            opprettetDato: '2023-06-12T16:25:34.139101',
            sendtTilNAVDato: null,
            sendtTilArbeidsgiverDato: null,
            avbruttDato: null,
            startSykeforlop: '2023-01-01',
            sykmeldingUtskrevet: '2023-04-27T02:00:00',
            sykmeldingSignaturDato: null,
            arbeidsgiver: null,
            arbeidsgiverNavn: 'Klonelabben',
            arbeidsgiverOrgnummer: '907670201',
            korrigerer: null,
            korrigertAv: null,
            arbeidssituasjon: 'ARBEIDSTAKER',
            soknadPerioder: [
                {
                    fom: '2023-04-27',
                    tom: '2023-05-21',
                    grad: 100,
                    sykmeldingstype: 'AKTIVITET_IKKE_MULIG',
                },
            ],
            merknaderFraSykmelding: null,
        },
        {
            id: '217305a5-ea12-313b-ac24-14202087dd40',
            sykmeldingId: '468ecc00-7346-4a71-80a9-61d890971f6e',
            soknadstype: 'ARBEIDSTAKERE',
            status: 'NY',
            fom: '2023-05-22',
            tom: '2023-06-10',
            opprettetDato: '2023-06-19T08:59:52.327839',
            sendtTilNAVDato: null,
            sendtTilArbeidsgiverDato: null,
            avbruttDato: null,
            startSykeforlop: '2023-01-01',
            sykmeldingUtskrevet: '2023-06-26T02:00:00',
            sykmeldingSignaturDato: '2023-06-19T08:59:30.38144',
            arbeidsgiver: null,
            arbeidsgiverNavn: 'Klonelabben',
            arbeidsgiverOrgnummer: '907670201',
            korrigerer: null,
            korrigertAv: null,
            arbeidssituasjon: 'ARBEIDSTAKER',
            soknadPerioder: [
                {
                    fom: '2023-05-22',
                    tom: '2023-06-10',
                    grad: 100,
                    sykmeldingstype: 'AKTIVITET_IKKE_MULIG',
                },
            ],
            merknaderFraSykmelding: null,
        },
        {
            id: '6527094e-b6b5-3c88-8ca3-e11c5ab33503',
            sykmeldingId: '468ecc00-7346-4a71-80a9-61d890971f6e',
            soknadstype: 'ARBEIDSTAKERE',
            status: 'FREMTIDIG',
            fom: '2023-06-11',
            tom: '2023-06-30',
            opprettetDato: '2023-06-19T08:59:52.327943',
            sendtTilNAVDato: null,
            sendtTilArbeidsgiverDato: null,
            avbruttDato: null,
            startSykeforlop: '2023-01-01',
            sykmeldingUtskrevet: '2023-06-26T02:00:00',
            sykmeldingSignaturDato: '2023-06-19T08:59:30.38144',
            arbeidsgiver: null,
            arbeidsgiverNavn: 'Klonelabben',
            arbeidsgiverOrgnummer: '907670201',
            korrigerer: null,
            korrigertAv: null,
            arbeidssituasjon: 'ARBEIDSTAKER',
            soknadPerioder: [
                {
                    fom: '2023-06-11',
                    tom: '2023-06-30',
                    grad: 100,
                    sykmeldingstype: 'AKTIVITET_IKKE_MULIG',
                },
            ],
            merknaderFraSykmelding: null,
        },
    ],
    klippetSykepengesoknadRecord: [
        {
            id: '5670cce5-ecc9-4f7a-81f6-33d4ea53aaaf',
            sykepengesoknadUuid: '84fffb36-2dd7-357c-bfc3-c22ce7368851',
            sykmeldingUuid: 'd02d8d3a-b58e-44b2-8b41-5279865360a6',
            klippVariant: 'SOKNAD_STARTER_INNI_SLUTTER_ETTER',
            periodeFor: '[{"fom":"2023-04-10","tom":"2023-04-30","grad":50,"sykmeldingstype":"GRADERT"}]',
            periodeEtter: '[{"fom":"2023-04-10","tom":"2023-04-16","grad":50,"sykmeldingstype":"GRADERT"}]',
            timestamp: '2023-06-12T14:25:13.956976Z',
        },
        {
            id: 'c00f891f-918d-463b-9d4b-7892b1209b00',
            sykepengesoknadUuid: '8ec860d4-b4ad-34bf-9d94-5c363aade289',
            sykmeldingUuid: '2e6666d0-2540-40f2-99b6-083cbd91934d',
            klippVariant: 'SOKNAD_STARTER_INNI_SLUTTER_ETTER',
            periodeFor: '[{"fom":"2023-04-17","tom":"2023-04-30","grad":60,"sykmeldingstype":"GRADERT"}]',
            periodeEtter: '[{"fom":"2023-04-17","tom":"2023-04-23","grad":60,"sykmeldingstype":"GRADERT"}]',
            timestamp: '2023-06-12T14:25:22.931157Z',
        },
        {
            id: 'b133de12-1e1c-4249-ac61-27ee52298f54',
            sykepengesoknadUuid: '7ee89646-1feb-34df-85f0-f18e9d30bba5',
            sykmeldingUuid: 'de68e6ed-3cb6-4e3b-9cf0-0a07c234c629',
            klippVariant: 'SOKNAD_STARTER_INNI_SLUTTER_ETTER',
            periodeFor: '[{"fom":"2023-04-24","tom":"2023-04-30","grad":80,"sykmeldingstype":"GRADERT"}]',
            periodeEtter: '[{"fom":"2023-04-24","tom":"2023-04-26","grad":80,"sykmeldingstype":"GRADERT"}]',
            timestamp: '2023-06-12T14:25:33.499050Z',
        },
        {
            id: '74c5f650-f35a-47c6-b873-8f69390f9e70',
            sykepengesoknadUuid: '19967e57-7d84-367a-967f-c7a205cfce78',
            sykmeldingUuid: '468ecc00-7346-4a71-80a9-61d890971f6e',
            klippVariant: 'SOKNAD_STARTER_FOR_SLUTTER_ETTER',
            periodeFor: '[{"fom":"2023-05-22","tom":"2023-06-10","grad":100,"sykmeldingstype":"AKTIVITET_IKKE_MULIG"}]',
            periodeEtter: null,
            timestamp: '2023-06-19T06:59:52.064271Z',
        },
        {
            id: '8674cc23-dbe7-47bf-95f6-4a3d6695ea39',
            sykepengesoknadUuid: '4e045b47-39ee-395c-b3b9-50a12891de45',
            sykmeldingUuid: '468ecc00-7346-4a71-80a9-61d890971f6e',
            klippVariant: 'SOKNAD_STARTER_FOR_SLUTTER_ETTER',
            periodeFor: '[{"fom":"2023-06-11","tom":"2023-06-30","grad":100,"sykmeldingstype":"AKTIVITET_IKKE_MULIG"}]',
            periodeEtter: null,
            timestamp: '2023-06-19T06:59:52.264863Z',
        },
    ],
}
const vedtaksperiodeTestdata: FullVedtaksperiodeBehandling[] = [
    {
        vedtaksperiode: {
            id: 'b592f435-fe21-43a2-a5f2-098069a47f69',
            opprettetDatabase: '2024-05-13T10:56:50.855626Z',
            oppdatert: '2024-05-13T10:56:50.883256Z',
            sisteSpleisstatus: 'VENTER_PÅ_ARBEIDSGIVER',
            sisteVarslingstatus: 'SENDT_SMSER',
            vedtaksperiodeId: '3337dceb-e5a5-481d-b659-b55da88a6d61',
            behandlingId: '5809d055-3ccf-49d9-aee7-d81e88db25ee',
            sykepengesoknadUuid: '2f7a41d4-1658-4049-9694-94d1df7fcd6f',
            sisteSpleisstatusTidspunkt: '2040-05-14T05:12:15.133973Z',
            sisteVarslingstatusTidspunkt: '2020-05-14T05:12:15.133973Z',
        },
        soknader: [
            {
                id: '281d97c9-8f02-4b8a-974f-5803bbea7443',
                sykepengesoknadUuid: '2f7a41d4-1658-4049-9694-94d1df7fcd6f',
                orgnummer: '123456547',
                soknadstype: 'ARBEIDSTAKERE',
                startSyketilfelle: '2024-06-01',
                fom: '2024-06-01',
                tom: '2024-06-30',
                fnr: '12345678901',
                sendt: '2024-05-13T10:56:48.047527Z',
                opprettetDatabase: '2024-05-13T10:56:48.267622Z',
            },
        ],
        statuser: [
            {
                id: '92d68e13-8a17-4a87-a0db-158ebeaffc9a',
                vedtaksperiodeBehandlingId: 'b592f435-fe21-43a2-a5f2-098069a47f69',
                opprettetDatabase: '2024-05-13T10:56:50.864047Z',
                tidspunkt: '2024-05-13T10:56:50.827301Z',
                status: 'OPPRETTET',
                brukervarselId: null,
                dittSykefravaerMeldingId: null,
            },
            {
                id: '69923ea7-7635-4391-8336-018ad39d2a7d',
                vedtaksperiodeBehandlingId: 'b592f435-fe21-43a2-a5f2-098069a47f69',
                opprettetDatabase: '2024-05-13T10:56:50.887690Z',
                tidspunkt: '2024-05-13T10:56:50.827301Z',
                status: 'VENTER_PÅ_ARBEIDSGIVER',
                brukervarselId: null,
                dittSykefravaerMeldingId: null,
            },
            {
                id: '69923ea7-7635-4391-8336-12345644',
                vedtaksperiodeBehandlingId: 'b592f435-fe21-43a2-a5f2-098069a47f69',
                opprettetDatabase: '2024-05-13T10:56:50.887690Z',
                tidspunkt: '2024-06-27T10:56:50.827301Z',
                status: 'VARSLET_MANGLER_INNTEKTSMELDING_FØRSTE',
                brukervarselId: null,
                dittSykefravaerMeldingId: null,
            },
        ],
    },
    {
        vedtaksperiode: {
            id: '123',
            opprettetDatabase: '2024-05-14T05:07:47.793659Z',
            oppdatert: '2024-05-14T05:07:47.908311Z',
            sisteSpleisstatus: 'FERDIG',
            sisteVarslingstatus: null,
            vedtaksperiodeId: 'vedtaksperiodeId1',
            behandlingId: 'behandling Id 3',
            sykepengesoknadUuid: 'zzzzz',
            sisteSpleisstatusTidspunkt: '2040-05-14T05:12:15.133973Z',
            sisteVarslingstatusTidspunkt: '2020-05-14T05:12:15.133973Z',
        },
        soknader: [
            {
                id: '123',
                sykepengesoknadUuid: 'zzzzz',
                orgnummer: '232323232',
                soknadstype: 'ARBEIDSTAKERE',
                startSyketilfelle: '2024-04-26',
                fom: '2024-04-26',
                tom: '2024-05-10',
                fnr: '11111111111',
                sendt: '2024-05-14T05:07:47.585866Z',
                opprettetDatabase: '2024-05-14T05:07:47.607239Z',
            },
        ],
        statuser: [
            {
                id: '123',
                vedtaksperiodeBehandlingId: '321',
                opprettetDatabase: '2024-05-14T05:07:47.796746Z',
                tidspunkt: '2024-05-14T05:07:47.747347Z',
                status: 'OPPRETTET',
                brukervarselId: null,
                dittSykefravaerMeldingId: null,
            },
            {
                id: '123',
                vedtaksperiodeBehandlingId: '321',
                opprettetDatabase: '2024-05-14T05:07:47.822813Z',
                tidspunkt: '2024-05-14T05:07:47.747347Z',
                status: 'VENTER_PÅ_ARBEIDSGIVER',
                brukervarselId: null,
                dittSykefravaerMeldingId: null,
            },
            {
                id: '123',
                vedtaksperiodeBehandlingId: '321',
                opprettetDatabase: '2024-05-14T05:07:47.909995Z',
                tidspunkt: '2024-05-14T05:07:47.848024Z',
                status: 'FERDIG',
                brukervarselId: null,
                dittSykefravaerMeldingId: null,
            },
        ],
    },
    {
        vedtaksperiode: {
            id: '123',
            opprettetDatabase: '2024-05-14T05:09:13.717297Z',
            oppdatert: '2024-05-14T05:09:13.759527Z',
            sisteSpleisstatus: 'FERDIG',
            sisteVarslingstatus: null,
            vedtaksperiodeId: 'vedtaksperiodeId1',
            behandlingId: 'behandling Id 2',
            sykepengesoknadUuid: 'yyyyy',
            sisteSpleisstatusTidspunkt: '2040-05-14T05:12:15.133973Z',
            sisteVarslingstatusTidspunkt: '2020-05-14T05:12:15.133973Z',
        },
        soknader: [
            {
                id: '123',
                sykepengesoknadUuid: 'yyyyy',
                orgnummer: '232323232',
                soknadstype: 'ARBEIDSTAKERE',
                startSyketilfelle: '2024-04-26',
                fom: '2024-04-26',
                tom: '2024-05-10',
                fnr: '11111111111',
                sendt: '2024-05-14T05:09:13.548037Z',
                opprettetDatabase: '2024-05-14T05:09:13.565325Z',
            },
        ],
        statuser: [
            {
                id: '123',
                vedtaksperiodeBehandlingId: '321',
                opprettetDatabase: '2024-05-14T05:09:13.720704Z',
                tidspunkt: '2024-05-14T05:09:13.669515Z',
                status: 'OPPRETTET',
                brukervarselId: null,
                dittSykefravaerMeldingId: null,
            },
            {
                id: '123',
                vedtaksperiodeBehandlingId: '321',
                opprettetDatabase: '2024-05-14T05:09:13.745308Z',
                tidspunkt: '2024-05-14T05:09:13.669515Z',
                status: 'VENTER_PÅ_ARBEIDSGIVER',
                brukervarselId: null,
                dittSykefravaerMeldingId: null,
            },
            {
                id: '123',
                vedtaksperiodeBehandlingId: '321',
                opprettetDatabase: '2024-05-14T05:09:13.761334Z',
                tidspunkt: '2024-05-14T05:09:13.674194Z',
                status: 'FERDIG',
                brukervarselId: null,
                dittSykefravaerMeldingId: null,
            },
        ],
    },
    {
        vedtaksperiode: {
            id: '123',
            opprettetDatabase: '2024-05-14T05:12:15.133973Z',
            oppdatert: '2024-05-14T05:12:15.168304Z',
            sisteSpleisstatus: 'FERDIG',
            sisteVarslingstatus: null,
            vedtaksperiodeId: 'vedtaksperiodeId1',
            behandlingId: 'behandling Id 1',
            sykepengesoknadUuid: 'xxxxxxx',
            sisteSpleisstatusTidspunkt: '2040-05-14T05:12:15.133973Z',
            sisteVarslingstatusTidspunkt: '2020-05-14T05:12:15.133973Z',
        },
        soknader: [
            {
                id: '123',
                sykepengesoknadUuid: 'xxxxxxx',
                orgnummer: '232323232',
                soknadstype: 'ARBEIDSTAKERE',
                startSyketilfelle: '2024-04-26',
                fom: '2024-04-26',
                tom: '2024-05-10',
                fnr: '11111111111',
                sendt: '2024-05-14T05:12:14.961442Z',
                opprettetDatabase: '2024-05-14T05:12:14.978695Z',
            },
        ],
        statuser: [
            {
                id: '123',
                vedtaksperiodeBehandlingId: '321',
                opprettetDatabase: '2024-05-14T05:12:15.137038Z',
                tidspunkt: '2024-05-14T05:12:15.080399Z',
                status: 'OPPRETTET',
                brukervarselId: null,
                dittSykefravaerMeldingId: null,
            },
            {
                id: '123',
                vedtaksperiodeBehandlingId: '321',
                opprettetDatabase: '2024-05-14T05:12:15.153872Z',
                tidspunkt: '2024-05-14T05:12:15.080399Z',
                status: 'VENTER_PÅ_ARBEIDSGIVER',
                brukervarselId: null,
                dittSykefravaerMeldingId: null,
            },
            {
                id: '123',
                vedtaksperiodeBehandlingId: '321',
                opprettetDatabase: '2024-05-14T05:12:15.170200Z',
                tidspunkt: '2024-05-14T05:12:15.084914Z',
                status: 'FERDIG',
                brukervarselId: null,
                dittSykefravaerMeldingId: null,
            },
        ],
    },
]

export async function mockApi(opts: BackendProxyOpts): Promise<void> {
    const validert = validerKall(opts)
    if (!validert) return
    const { req, res } = opts
    const fnr = req.headers.fnr

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

    await sleep(200)
    if (validert.api == 'GET /api/v1/flex/sykepengesoknader' && fnr !== undefined) {
        res.status(200)
        res.json(testdata)
        res.end()
        return
    }
    if (validert.api == 'GET /api/v1/flex/sykepengesoknader/[uuid]') {
        res.status(200)
        res.json({ fnr: 'fødselsnummer', sykepengesoknad: testdata.sykepengesoknadListe[0] })
        res.end()
        return
    }
    if (validert.api == 'POST /api/v1/vedtak-og-inntektsmeldinger') {
        const inntektsmedling: InntektsmeldingDbRecord = {
            id: '123',
            inntektsmeldingId: '123',
            fnr: '11111111111',
            arbeidsgivertype: 'VIRKSOMHET',
            virksomhetsnummer: '123456789',
            fullRefusjon: true,
            opprettet: '2024-05-14T05:12:14.978695Z',
            mottattDato: '2024-05-14T05:12:14.978695Z',
            foersteFravaersdag: '2024-04-26',
            vedtaksperiodeId: '123',
        }
        res.status(200)
        res.json({ inntektsmeldinger: [inntektsmedling], vedtaksperioder: vedtaksperiodeTestdata })
        res.end()
        return
    }

    if (validert.api.startsWith('POST /api/v1/cronjob')) {
        res.status(200)
        res.json({ heihei: 12354, now: req.query.now })
        res.end()
        return
    }
    const ident = req.headers.ident

    if (validert.api == 'GET /api/v1/flex/identer' && ident !== undefined) {
        res.status(200)
        res.json([
            { gruppe: 'FOLKEREGISTERIDENT', ident: ident },
            {
                gruppe: 'FOLKEREGISTERIDENT',
                ident: '11111111111',
            },
            { gruppe: 'AKTORID', ident: '1111111111122' },
        ])
        res.end()
        return
    }
    res.status(404)
    res.end()
}
