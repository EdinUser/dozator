const shareVersion = 1;
const sharePrefix = "calc=";

export function buildShareUrl(calculatorKey, values) {
  const url = new URL(window.location.href);
  url.hash = `${sharePrefix}${encodePayload({
    v: shareVersion,
    calculator: calculatorKey,
    values,
  })}`;
  return url.toString();
}

export function readSharedCalculation(hashValue = window.location.hash) {
  const hash = hashValue.replace(/^#/, "");

  if (!hash.startsWith(sharePrefix)) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeURIComponent(atob(hash.slice(sharePrefix.length))));

    if (payload.v !== shareVersion || !payload.calculator || !payload.values) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

function encodePayload(payload) {
  return btoa(encodeURIComponent(JSON.stringify(payload)));
}
