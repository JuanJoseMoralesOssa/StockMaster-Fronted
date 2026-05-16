import React from 'react'
import { GenericActions } from '../../../types/GenericConfig'
import PrimaryButton from '../common/PrimaryButton'

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
      className='fixed z-50 w-44 rounded-md bg-(--color-bg-surface) shadow-lg ring-1 ring-[var(--color-border)] animate-dropdown-in'
      style={{ top: dropdownPosition.top, left: Math.max(8, dropdownPosition.left) }}
    >
      <div className='flex flex-col py-1'>
        {actions.customActions.map((action, actionIndex) => {
          if (action.condition && !action.condition(item)) return null
          return (
            <PrimaryButton
              key={actionIndex}
              onClick={() => onExecuteAction(actionIndex, item)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-(--color-bg-subtle) transition-colors flex items-center gap-2 ${action.className || 'text-(--color-text-secondary)'
                }`}
              icon={action.icon}
            >
              {action.label}
            </PrimaryButton>
          )
        })}
      </div>
    </div>
  )
}
