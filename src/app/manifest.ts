import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'D-14 Access Portal',
    short_name: 'D-14 Portal',
    description: 'Maritime Security Law Enforcement (D14)',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a192f',
    theme_color: '#0a192f',
    icons: [
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}