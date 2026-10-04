import { renderSocialImage } from './metadata/social-image'

export const alt =
  'Vidro — A clear view of your code. A Web Component code editor.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function TwitterImage() {
  return renderSocialImage()
}
