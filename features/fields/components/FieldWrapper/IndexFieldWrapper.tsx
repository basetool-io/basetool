import { Field } from '../../types'
import { ReactNode, memo } from 'react'
import classNames from 'classnames'

const IndexFieldWrapper = ({
  children,
  noPadding = false,
}: {
  field: Field;
  children: ReactNode;
  noPadding?: boolean;
}) => (
  <div className={classNames(
    "py-2 leading-tight whitespace-no-wrap overflow-hidden overflow-ellipsis",
    {
      "py-0": noPadding,
    }
  )}>
    {children}
  </div>
)

export default memo(IndexFieldWrapper)
