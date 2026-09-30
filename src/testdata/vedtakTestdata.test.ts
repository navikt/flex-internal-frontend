import { describe, expect, it } from 'vitest'

import { sykepengesoknaderTestdata } from './sykepengesoknaderTestdata'
import { hentVedtakTestdata } from './vedtakTestdata'

describe('hentVedtakTestdata', () => {
    it('gir vedtak med dokumentreferanse, periode og arbeidsgiver fra eksisterende sendte søknader', () => {
        const søknader = sykepengesoknaderTestdata.sykepengesoknadListe.slice(0, 2)

        for (const søknad of søknader) {
            const vedtak = hentVedtakTestdata(søknad.id)

            expect(vedtak).toHaveLength(1)
            expect(vedtak[0].vedtak.dokumenter).toContainEqual({ dokumentId: søknad.id, type: 'Søknad' })
            expect(vedtak[0].vedtak.fom).toBe(søknad.fom)
            expect(vedtak[0].vedtak.tom).toBe(søknad.tom)
            expect(vedtak[0].vedtak.organisasjonsnummer).toBe(søknad.arbeidsgiverOrgnummer)
            expect(vedtak[0].orgnavn).toBe(søknad.arbeidsgiverNavn)
            expect(vedtak[0].vedtak.utbetaling.utbetalingsdager?.length).toBeGreaterThan(0)
        }
    })

    it('gir tom liste for søknader uten vedtak', () => {
        const søknadUtenVedtak = sykepengesoknaderTestdata.sykepengesoknadListe[3]

        expect(hentVedtakTestdata(søknadUtenVedtak.id)).toEqual([])
        expect(hentVedtakTestdata('ukjent-soknad')).toEqual([])
    })
})
