import { ANALYTICS_CONFIG } from './config'

declare global {
  interface Window {
    hj: (...args: any[]) => void
    _hjSettings: any
  }
}

export const initHotjar = () => {
  if (!ANALYTICS_CONFIG.IS_PRODUCTION) return

  const h = window
  const o = document
  const t = 'script'
  const j = '.hotjar.com'
  
  h.hj = h.hj || function(...args: any[]) {
    (h.hj.q = h.hj.q || []).push(args)
  }
  
  h._hjSettings = { hjid: ANALYTICS_CONFIG.HOTJAR_ID, hjsv: ANALYTICS_CONFIG.HOTJAR_VERSION }
  
  const a = o.getElementsByTagName('head')[0]
  const r = o.createElement(t) as HTMLScriptElement
  
  r.async = true
  r.src = `https://static.hotjar.com/c/hotjar-${h._hjSettings.hjid}.js?sv=${h._hjSettings.hjsv}`
  
  a.appendChild(r)
}

export const identifyHotjarUser = (userId: string, attributes?: Record<string, any>) => {
  if (!ANALYTICS_CONFIG.IS_PRODUCTION) return
  window.hj?.('identify', userId, attributes)
}

export const triggerHotjarEvent = (eventName: string) => {
  if (!ANALYTICS_CONFIG.IS_PRODUCTION) return
  window.hj?.('event', eventName)
}

export const addHotjarTags = (tags: string[]) => {
  if (!ANALYTICS_CONFIG.IS_PRODUCTION) return
  tags.forEach(tag => window.hj?.('tagRecording', [tag]))
}
