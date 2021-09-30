import { Field } from '../../types'
import { ReactNode, memo } from 'react'
import classNames from 'classnames'

const IndexFieldWrapper = ({
  children,
  flush = false,
}: {
  field: Field;
  children: ReactNode;
  flush?: boolean;
}) => (
  <div className={classNames(
    "py-2 leading-tight whitespace-no-wrap overflow-hidden overflow-ellipsis",
    {
      "py-0": flush,
    }
  )}>
    {children}
  </div>
)

export default memo(IndexFieldWrapper)
