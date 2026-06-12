import React from 'react'
import { GenericActions } from '../../../types/GenericConfig'
import { Button } from '../../../components/ui'

interface Props<T> {
  openDropdownIndex: number | null
  dropdownPosition: { top: number; left: number } | null
  dropdownRef: React.RefObject<HTMLDivElement | null>
  actions: GenericActions<T>
  data: T[]
  onExecuteAction: (actionIndex: number, item: T) => void
}

export default function DropdownMenu<T>({
  openDropdownIndex,
  dropdownPosition,
  dropdownRef,
  actions,
  data,
  onExecuteAction
}: Props<T>) {
  if (openDropdownIndex === null || !dropdownPosition || !actions?.customActions) return null

  const item = data[openDropdownIndex]
  if (!item) return null

  return (
    <div
      ref={dropdownRef}
      role="menu"
      className='fixed z-50 w-44 rounded-md bg-(--color-bg-surface) shadow-lg ring-1 ring-(--color-border) animate-dropdown-in'
      style={{ top: dropdownPosition.top, left: Math.max(8, dropdownPosition.left) }}
    >
      <div className='flex flex-col py-1'>
        {actions.customActions.map((action, actionIndex) => {
          if (action.condition && !action.condition(item)) return null
          return (
            <Button
              key={actionIndex}
              role="menuitem"
              variant="ghost"
              size="sm"
              onClick={() => onExecuteAction(actionIndex, item)}
              leftIcon={action.icon}
              className={`w-full justify-start rounded-none ${action.className ?? ''}`}
            >
              {action.label}
            </Button>
          )
        })}
      </div>
    </div>
  )
}
