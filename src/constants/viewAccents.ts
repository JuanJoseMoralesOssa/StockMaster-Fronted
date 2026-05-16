import type { CSSProperties } from 'react'
import type NavItem from '../types/NavItem'

export type AccentName = NonNullable<NavItem['accent']>
export type ViewAccentStyle = CSSProperties & Record<`--${string}`, string>

type AccentTokens = Record<`--${string}`, string>

export const viewAccents: Record<AccentName | 'default', AccentTokens> = {
  default: {
    '--view-accent': 'oklch(0.44 0.20 264)',
    '--view-accent-hover': 'oklch(0.36 0.18 264)',
    '--view-accent-soft': 'oklch(0.97 0.02 264)',
    '--view-accent-border': 'oklch(0.86 0.09 264)',
    '--view-accent-text': 'oklch(0.36 0.18 264)',
    '--nav-accent-bg': 'oklch(0.44 0.20 264 / 0.18)',
    '--nav-accent-dot': 'oklch(0.62 0.17 264)',
    '--nav-accent-ring': 'oklch(0.62 0.17 264 / 0.22)',
  },
  indigo: {
    '--view-accent': 'oklch(0.50 0.18 275)',
    '--view-accent-hover': 'oklch(0.41 0.17 275)',
    '--view-accent-soft': 'oklch(0.97 0.025 275)',
    '--view-accent-border': 'oklch(0.86 0.08 275)',
    '--view-accent-text': 'oklch(0.36 0.15 275)',
    '--nav-accent-bg': 'oklch(0.50 0.18 275 / 0.18)',
    '--nav-accent-dot': 'oklch(0.66 0.14 275)',
    '--nav-accent-ring': 'oklch(0.66 0.14 275 / 0.22)',
  },
  rose: {
    '--view-accent': 'oklch(0.55 0.18 20)',
    '--view-accent-hover': 'oklch(0.46 0.17 20)',
    '--view-accent-soft': 'oklch(0.97 0.025 20)',
    '--view-accent-border': 'oklch(0.87 0.08 20)',
    '--view-accent-text': 'oklch(0.38 0.14 20)',
    '--nav-accent-bg': 'oklch(0.55 0.18 20 / 0.18)',
    '--nav-accent-dot': 'oklch(0.68 0.15 20)',
    '--nav-accent-ring': 'oklch(0.68 0.15 20 / 0.22)',
  },
  blue: {
    '--view-accent': 'oklch(0.52 0.18 255)',
    '--view-accent-hover': 'oklch(0.43 0.17 255)',
    '--view-accent-soft': 'oklch(0.97 0.025 255)',
    '--view-accent-border': 'oklch(0.86 0.08 255)',
    '--view-accent-text': 'oklch(0.38 0.16 255)',
    '--nav-accent-bg': 'oklch(0.52 0.18 255 / 0.18)',
    '--nav-accent-dot': 'oklch(0.68 0.14 255)',
    '--nav-accent-ring': 'oklch(0.68 0.14 255 / 0.22)',
  },
  emerald: {
    '--view-accent': 'oklch(0.55 0.16 155)',
    '--view-accent-hover': 'oklch(0.44 0.14 155)',
    '--view-accent-soft': 'oklch(0.97 0.025 155)',
    '--view-accent-border': 'oklch(0.86 0.07 155)',
    '--view-accent-text': 'oklch(0.34 0.12 155)',
    '--nav-accent-bg': 'oklch(0.55 0.16 155 / 0.18)',
    '--nav-accent-dot': 'oklch(0.70 0.13 155)',
    '--nav-accent-ring': 'oklch(0.70 0.13 155 / 0.22)',
  },
  amber: {
    '--view-accent': 'oklch(0.67 0.16 75)',
    '--view-accent-hover': 'oklch(0.56 0.15 75)',
    '--view-accent-soft': 'oklch(0.98 0.035 75)',
    '--view-accent-border': 'oklch(0.88 0.09 75)',
    '--view-accent-text': 'oklch(0.42 0.12 75)',
    '--nav-accent-bg': 'oklch(0.67 0.16 75 / 0.18)',
    '--nav-accent-dot': 'oklch(0.78 0.15 75)',
    '--nav-accent-ring': 'oklch(0.78 0.15 75 / 0.22)',
  },
  violet: {
    '--view-accent': 'oklch(0.52 0.18 300)',
    '--view-accent-hover': 'oklch(0.43 0.16 300)',
    '--view-accent-soft': 'oklch(0.97 0.025 300)',
    '--view-accent-border': 'oklch(0.86 0.08 300)',
    '--view-accent-text': 'oklch(0.37 0.15 300)',
    '--nav-accent-bg': 'oklch(0.52 0.18 300 / 0.18)',
    '--nav-accent-dot': 'oklch(0.69 0.14 300)',
    '--nav-accent-ring': 'oklch(0.69 0.14 300 / 0.22)',
  },
  teal: {
    '--view-accent': 'oklch(0.55 0.13 195)',
    '--view-accent-hover': 'oklch(0.45 0.12 195)',
    '--view-accent-soft': 'oklch(0.97 0.025 195)',
    '--view-accent-border': 'oklch(0.86 0.07 195)',
    '--view-accent-text': 'oklch(0.34 0.11 195)',
    '--nav-accent-bg': 'oklch(0.55 0.13 195 / 0.18)',
    '--nav-accent-dot': 'oklch(0.70 0.11 195)',
    '--nav-accent-ring': 'oklch(0.70 0.11 195 / 0.22)',
  },
}

export function getViewAccentStyle(accentName: NavItem['accent'] | undefined): ViewAccentStyle {
  const accent = viewAccents[accentName ?? 'default']

  return {
    ...accent,
    '--color-action-bg': accent['--view-accent'],
    '--color-action-bg-hover': accent['--view-accent-hover'],
    '--color-focus-ring': accent['--view-accent'],
    '--color-text-link': accent['--view-accent-text'],
  }
}
