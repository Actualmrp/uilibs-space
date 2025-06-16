import { OpenSourceIcon } from "./icons/open-source"

export const Icons = {
  OpenSource: OpenSourceIcon,
} as const

export type IconName = keyof typeof Icons
