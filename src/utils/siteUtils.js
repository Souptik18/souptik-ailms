export function isAdminRoutePath(pathname = '') {
  const path = pathname
    ? pathname.toLowerCase()
    : (typeof window === 'undefined' ? '' : window.location.pathname.toLowerCase())
  return path.includes('url-admin')
}

export function inr(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
}

export function embedUrl(videoId) {
  return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`
}

export function thumbnailUrl(videoId) {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}
