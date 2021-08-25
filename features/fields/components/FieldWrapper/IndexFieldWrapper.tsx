import { Field } from '../../types'
import { ReactNode } from 'react'

const IndexFieldWrapper = ({
  children,
}: {
  field: Field;
  children: ReactNode;
}) => (
  <div className="px-4 py-2 leading-tight whitespace-no-wrap">
    {children}
  </div>
)

export default IndexFieldWrapper
