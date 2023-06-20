import React, { useState } from 'react'
import { Table, TextField } from '@navikt/ds-react'

import { initialProps } from '../initialprops/initialProps'
import { useIdenter } from '../queryhooks/useIdenter'

const IdentPage = () => {
    const [ident, setIdent] = useState<string>()

    const { data: data } = useIdenter(ident, ident !== undefined)

    return (
        <div className="flex-row space-y-4">
            <TextField
                type="number"
                label="ident"
                onChange={(e) =>
                    e.target.value.length == 11 || e.target.value.length == 13
                        ? setIdent(e.target.value)
                        : setIdent(undefined)
                }
            />
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
