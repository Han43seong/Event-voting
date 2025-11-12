/**
 * 디바이스 핑거프린트 생성 유틸리티
 * 브라우저 정보를 수집하여 고유한 디바이스 ID를 생성합니다.
 */

/**
 * 브라우저 정보를 수집하여 디바이스 핑거프린트를 생성합니다.
 * @returns {Promise<string>} 해시된 디바이스 ID
 */
export async function generateDeviceId() {
  // localStorage에 이미 저장된 ID가 있으면 재사용
  const existingId = localStorage.getItem('deviceId');
  if (existingId) {
    return existingId;
  }

  // 브라우저 정보 수집
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    languages: navigator.languages.join(','),
    platform: navigator.platform,
    screenResolution: `${screen.width}x${screen.height}`,
    screenColorDepth: screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timezoneOffset: new Date().getTimezoneOffset(),
    hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
    deviceMemory: navigator.deviceMemory || 'unknown',
    // 캔버스 핑거프린트 추가 (더 정확한 식별)
    canvas: getCanvasFingerprint(),
  };

  // JSON 문자열로 변환
  const fingerprintString = JSON.stringify(fingerprint);

  // SHA-256 해시 생성
  const deviceId = await hashString(fingerprintString);

  // localStorage에 저장
  localStorage.setItem('deviceId', deviceId);

  return deviceId;
}

/**
 * 캔버스 기반 핑거프린트 생성
 * @returns {string} 캔버스 데이터 URL
 */
function getCanvasFingerprint() {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // 텍스트 그리기
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Vote System 🗳️', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Vote System 🗳️', 4, 17);

    return canvas.toDataURL();
  } catch (e) {
    return 'canvas-error';
  }
}

/**
 * 문자열을 SHA-256으로 해시합니다.
 * @param {string} str - 해시할 문자열
 * @returns {Promise<string>} 해시된 문자열 (hex)
 */
async function hashString(str) {
  // TextEncoder로 문자열을 바이트 배열로 변환
  const encoder = new TextEncoder();
  const data = encoder.encode(str);

  // SubtleCrypto API로 SHA-256 해시 생성
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);

  // 해시를 hex 문자열로 변환
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return hashHex;
}

/**
 * 저장된 디바이스 ID를 초기화합니다 (테스트/디버깅용)
 */
export function clearDeviceId() {
  localStorage.removeItem('deviceId');
}
