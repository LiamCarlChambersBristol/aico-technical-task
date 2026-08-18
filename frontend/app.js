const BASE_URL = 'http://localhost:3000';

function renderJson(targetId, data) {
  const el = document.getElementById(targetId);
  if (!el) return;
  el.textContent = JSON.stringify(data, null, 2);
}

async function apiFetch(url, options = {}) {
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  const body = await response.text();
  let parsed = body;

  try {
    parsed = body ? JSON.parse(body) : null;
  } catch (error) {
    parsed = body;
  }

  if (!response.ok) {
    throw new Error(JSON.stringify(parsed, null, 2));
  }

  return parsed;
}

function bindForm(formId, handler) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const responseBox = document.getElementById(`${formId}-response`);
    try {
      const result = await handler(new FormData(form));
      responseBox.textContent = JSON.stringify(result, null, 2);
    } catch (error) {
      responseBox.textContent = error.message;
    }
  });
}

function getValue(formData, name) {
  const value = formData.get(name);
  return value === undefined || value === null || value === '' ? undefined : String(value);
}

if (document.getElementById('device-list-btn')) {
  document.getElementById('device-list-btn').addEventListener('click', async () => {
    try {
      const result = await apiFetch('/devices/listDevices');
      renderJson('device-list-response', result);
    } catch (error) {
      renderJson('device-list-response', { error: error.message });
    }
  });

  bindForm('device-get-form', async (formData) => {
    const deviceId = getValue(formData, 'deviceId');
    if (!deviceId) throw new Error('deviceId is required');
    return apiFetch(`/devices/getDevice/${deviceId}`);
  });

  bindForm('device-create-form', async (formData) => {
    const payload = {
      name: getValue(formData, 'name'),
      deviceType: getValue(formData, 'deviceType'),
    };
    if (!payload.name || !payload.deviceType) {
      throw new Error('name and deviceType are required');
    }
    return apiFetch('/devices/createDevice', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  });

  bindForm('device-update-form', async (formData) => {
    const deviceId = getValue(formData, 'deviceId');
    const payload = {
      name: getValue(formData, 'name'),
      deviceType: getValue(formData, 'deviceType'),
    };
    if (!deviceId) throw new Error('deviceId is required');
    return apiFetch(`/devices/updateDevice/${deviceId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  });

  bindForm('device-delete-form', async (formData) => {
    const deviceId = getValue(formData, 'deviceId');
    if (!deviceId) throw new Error('deviceId is required');
    return apiFetch(`/devices/deleteDevice/${deviceId}`, {
      method: 'DELETE',
    });
  });
}

if (document.getElementById('event-add-form')) {
  bindForm('event-add-form', async (formData) => {
    const payload = {
      deviceId: getValue(formData, 'deviceId'),
      eventType: getValue(formData, 'eventType'),
      payload: JSON.parse(getValue(formData, 'payloadJson') || '{}'),
    };
    if (!payload.deviceId || !payload.eventType) {
      throw new Error('deviceId and eventType are required');
    }
    return apiFetch('/events/addEvent', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  });

  bindForm('event-get-form', async (formData) => {
    const deviceId = getValue(formData, 'deviceId');
    const amount = getValue(formData, 'amount');
    const url = amount ? `/events/getEvents/${deviceId}?amount=${amount}` : `/events/getEvents/${deviceId}`;
    if (!deviceId) throw new Error('deviceId is required');
    return apiFetch(url);
  });

  bindForm('event-since-form', async (formData) => {
    const deviceId = getValue(formData, 'deviceId');
    const since = getValue(formData, 'since');
    if (!deviceId || !since) throw new Error('deviceId and since are required');
    return apiFetch(`/events/getEventsSince/${deviceId}/${encodeURIComponent(since)}`);
  });

  bindForm('event-latest-form', async (formData) => {
    const deviceId = getValue(formData, 'deviceId');
    if (!deviceId) throw new Error('deviceId is required');
    return apiFetch(`/events/getLatestEvent/${deviceId}`);
  });

  bindForm('event-delete-form', async (formData) => {
    const deviceId = getValue(formData, 'deviceId');
    if (!deviceId) throw new Error('deviceId is required');
    return apiFetch(`/events/deleteEvents/${deviceId}`, {
      method: 'DELETE',
    });
  });
}

if (document.getElementById('projection-form')) {
  bindForm('projection-form', async (formData) => {
    const deviceId = getValue(formData, 'deviceId');
    if (!deviceId) throw new Error('deviceId is required');
    return apiFetch(`/projections/rebuildProjection/${deviceId}`, {
      method: 'POST',
    });
  });
}
