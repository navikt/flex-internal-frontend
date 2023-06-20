import React, { useState } from 'react'
import { Table } from '@navikt/ds-react'

import { initialProps } from '../initialprops/initialProps'
import FnrInput from '../components/FnrInput'
import { useIdenter } from '../queryhooks/useIdenter'

const IdentPage = () => {
    const [fnr, setFnr] = useState<string>()

    const { data: data } = useIdenter(fnr, fnr !== undefined)

    return (
        <div className="flex-row space-y-4">
            <FnrInput setFnr={setFnr} />
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell scope="col">Identgruppe</Table.HeaderCell>
                        <Table.HeaderCell scope="col">Ident</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>

                <Table.Body>
                    {data?.map((d, i) => {
                        return (
                            <Table.Row key={i + d.ident}>
                                <Table.DataCell>{d.gruppe}</Table.DataCell>
                                <Table.DataCell>{d.ident}</Table.DataCell>
                            </Table.Row>
                        )
                    })}
                </Table.Body>
            </Table>
        </div>
    )
}

export const getServerSideProps = initialProps

export default IdentPage
