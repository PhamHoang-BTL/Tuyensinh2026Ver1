const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const DRIVE_FOLDER_ID = import.meta.env.VITE_DRIVE_FOLDER_ID || '';
const SHEET_ID = import.meta.env.VITE_SHEET_ID || '';
const SCOPES = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets';

let tokenClient: any = null;
let accessToken: string | null = null;
let initialized = false;

export function getAccessToken(): string | null {
  return accessToken;
}

export function isGoogleDriveReady(): boolean {
  return !!accessToken;
}

export async function initGoogleDrive(): Promise<void> {
  if (initialized) return;
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID trống. Kiểm tra file .env');
  }
  // Wait for GIS library to load (safety net, should already be loaded from index.html)
  let waited = 0;
  while (!window.google?.accounts?.oauth2 && waited < 100) {
    await new Promise(r => setTimeout(r, 200));
    waited++;
  }
  if (!window.google?.accounts?.oauth2) {
    throw new Error('Google Identity Services không tải được. Kiểm tra internet.');
  }
  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: SCOPES,
    callback: (resp: any) => {
      if (resp.access_token) {
        accessToken = resp.access_token;
      } else if (resp.error) {
        console.error('[GoogleDrive] Lỗi xác thực:', resp.error);
      }
    },
  });
  initialized = true;
}

export async function requestDriveAccess(): Promise<string> {
  if (!initialized) {
    await initGoogleDrive();
  }
  if (accessToken) return accessToken;

  return new Promise((resolve, reject) => {
    tokenClient.callback = (resp: any) => {
      if (resp.error) {
        reject(new Error(resp.error));
      } else if (resp.access_token) {
        accessToken = resp.access_token;
        resolve(accessToken);
      }
    };
    // Open popup for user consent
    tokenClient.requestAccessToken({ prompt: 'consent' });
  });
}

export async function createDriveFolder(folderName: string): Promise<string> {
  if (!accessToken) {
    await requestDriveAccess();
  }
  const res = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      ...(DRIVE_FOLDER_ID && { parents: [DRIVE_FOLDER_ID] }),
    }),
  });
  if (!res.ok) throw new Error(`Lỗi tạo thư mục (${res.status})`);
  const data = await res.json();
  return data.id;
}

export async function uploadFileToDrive(file: File, folderId?: string): Promise<{ id: string; name: string; webViewLink: string }> {
  if (!accessToken) {
    await requestDriveAccess();
  }

  // Step 1: Create file
  const parents: string[] = [];
  if (folderId) parents.push(folderId);
  else if (DRIVE_FOLDER_ID) parents.push(DRIVE_FOLDER_ID);
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: `tuyensinh-${Date.now()}-${file.name}`,
      ...(parents.length && { parents }),
    }),
  });
  if (!createRes.ok) {
    throw new Error(`Lỗi tạo file (${createRes.status})`);
  }
  const fileMeta = await createRes.json();

  // Step 2: Upload content
  const uploadRes = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileMeta.id}?uploadType=media`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': file.type || 'application/octet-stream',
    },
    body: file,
  });
  if (!uploadRes.ok) {
    throw new Error(`Lỗi upload (${uploadRes.status})`);
  }

  // Step 3: Public permission (non-blocking)
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileMeta.id}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: 'reader', type: 'anyone' }),
    });
  } catch {}

  return {
    id: fileMeta.id,
    name: file.name,
    webViewLink: `https://drive.google.com/file/d/${fileMeta.id}/view`,
  };
}

export function getDriveFileUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

export function getDriveFileViewUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

export function getDriveFileDownloadUrl(fileId: string): string {
  return `https://drive.google.com/uc?export=download&id=${fileId}`;
}

export async function appendToSheet(values: string[]): Promise<void> {
  if (!SHEET_ID) throw new Error('VITE_SHEET_ID trống. Thêm vào file .env');
  if (!accessToken) {
    await requestDriveAccess();
  }
  // Insert a new row at position 2 (after header) to keep newest on top
  await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      requests: [{
        insertDimension: {
          range: {
            sheetId: 0,
            dimension: 'ROWS',
            startIndex: 1,
            endIndex: 2,
          },
          inheritFromBefore: false,
        },
      }],
    }),
  });
  // Write values to the new empty row A2
  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/A2?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [values],
      }),
    }
  );
  if (!res.ok) throw new Error(`Lỗi ghi Sheet (${res.status})`);
}

export function revokeDriveAccess(): void {
  accessToken = null;
}
