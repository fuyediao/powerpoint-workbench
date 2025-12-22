/**
 * IP 檢測工具
 * 用於檢測當前 IP 地址和地理位置
 */

interface IpInfo {
  ip: string
  country?: string
  region?: string
  city?: string
  isp?: string
  error?: string
}

/**
 * 通過代理檢測 IP 地址
 */
export async function checkIpViaProxy(proxyEndpoint: string): Promise<IpInfo> {
  try {
    // 使用代理端點檢測 IP
    const response = await fetch(`${proxyEndpoint}/ip-check`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      ip: data.ip || data.query || 'Unknown',
      country: data.country || data.countryCode,
      region: data.regionName || data.region,
      city: data.city,
      isp: data.isp || data.org || data.asn,
    }
  } catch (error) {
    return {
      ip: 'Error',
      error: error instanceof Error ? error.message : 'Failed to check IP via proxy',
    }
  }
}

/**
 * 直接檢測 IP 地址（不使用代理）
 */
export async function checkIpDirect(): Promise<IpInfo> {
  try {
    // 使用多個 IP 檢測服務作為備選
    const services = [
      'https://api.ipify.org?format=json',
      'https://ipapi.co/json/',
      'https://ip-api.com/json/',
    ]

    for (const service of services) {
      try {
        const response = await fetch(service, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) continue

        const data = await response.json()

        // 不同服務返回的格式不同，統一處理
        if (service.includes('ipify')) {
          return {
            ip: data.ip,
          }
        } else if (service.includes('ipapi.co')) {
          return {
            ip: data.ip,
            country: data.country_name,
            region: data.region,
            city: data.city,
            isp: data.org,
          }
        } else if (service.includes('ip-api.com')) {
          return {
            ip: data.query || data.ip,
            country: data.country,
            region: data.regionName,
            city: data.city,
            isp: data.isp,
          }
        }
      } catch (error) {
        console.warn(`Failed to check IP via ${service}:`, error)
        continue
      }
    }

    throw new Error('All IP check services failed')
  } catch (error) {
    return {
      ip: 'Error',
      error: error instanceof Error ? error.message : 'Failed to check IP',
    }
  }
}

/**
 * 檢測 Gemini API 的 IP 限制
 */
export async function checkGeminiApiAccess(
  apiKey: string,
  useProxy: boolean,
  proxyEndpoint?: string
): Promise<{ success: boolean; message: string; ipInfo?: IpInfo }> {
  try {
    // 構建測試請求
    const testUrl = useProxy && proxyEndpoint
      ? `${proxyEndpoint}/v1beta/models/gemini-2.0-flash-exp:generateContent`
      : 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent'

    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(useProxy && proxyEndpoint
          ? { 'X-API-Key': apiKey }
          : { 'x-goog-api-key': apiKey }),
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'test' }] }],
      }),
    })

    const data = await response.json()

    if (response.ok) {
      return {
        success: true,
         message: 'API_ACCESS_OK', // 將在組件中翻譯
      }
    } else if (data.error?.message?.includes('location') || data.error?.message?.includes('region')) {
      // 獲取 IP 信息
      const ipInfo = useProxy && proxyEndpoint
        ? await checkIpViaProxy(proxyEndpoint)
        : await checkIpDirect()

      return {
        success: false,
        message: `LOCATION_ERROR:${data.error.message}`, // 將在組件中翻譯
        ipInfo,
      }
    } else {
      return {
        success: false,
        message: `API_ERROR:${data.error?.message || 'Unknown error'}`, // 將在組件中翻譯
      }
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error',
    }
  }
}

