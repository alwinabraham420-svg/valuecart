import { MarketingAttribution } from '@/types';

const STORAGE_KEY = 'valuecart_marketing_attribution';

export function captureAttributionFromUrl(searchParams: URLSearchParams, pathname?: string): MarketingAttribution {
  if (typeof window === 'undefined') {
    return {
      utm_source: 'direct',
      utm_medium: 'organic',
      utm_campaign: 'direct_traffic',
    };
  }

  const utm_source = searchParams.get('utm_source');
  const utm_medium = searchParams.get('utm_medium');
  const utm_campaign = searchParams.get('utm_campaign');
  const utm_content = searchParams.get('utm_content');
  const utm_term = searchParams.get('utm_term');
  const fbclid = searchParams.get('fbclid');

  // If URL has Meta Ad / UTM parameters, save them
  if (utm_source || utm_campaign || fbclid) {
    const attribution: MarketingAttribution = {
      utm_source: utm_source || (fbclid ? 'facebook' : 'meta_ads'),
      utm_medium: utm_medium || 'paid_social',
      utm_campaign: utm_campaign || 'unnamed_campaign',
      utm_content: utm_content || undefined,
      utm_term: utm_term || undefined,
      fbclid: fbclid || undefined,
      landingPage: pathname || window.location.pathname,
      referrer: document.referrer || undefined,
      timestamp: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
    } catch {
      // ignore storage errors
    }

    return attribution;
  }

  // Otherwise try to get previously stored attribution from this session
  return getStoredAttribution();
}

export function getStoredAttribution(): MarketingAttribution {
  if (typeof window === 'undefined') {
    return {
      utm_source: 'direct',
      utm_medium: 'organic',
      utm_campaign: 'direct_traffic',
    };
  }

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // fallback
  }

  return {
    utm_source: 'direct',
    utm_medium: 'organic',
    utm_campaign: 'direct_traffic',
    landingPage: window.location.pathname,
    timestamp: new Date().toISOString(),
  };
}
