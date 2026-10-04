export interface VidroChangeDetail {
  readonly value: string
  readonly origin: 'user' | 'external'
}

export interface VidroTypingDetail {
  readonly value: string
  readonly origin: 'user'
}

export interface VidroEventMap {
  'vidro-change': CustomEvent<VidroChangeDetail>
  'vidro-type-start': CustomEvent<VidroTypingDetail>
  'vidro-type-leave': CustomEvent<VidroTypingDetail>
}

declare global {
  interface HTMLElementEventMap extends VidroEventMap {}
}
