const getUser = async () => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/api/user`,
      {
        credentials: 'include',
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { success: true, user: data };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error getting user: ${message}`);
    return { success: false, error: message };
  }
};

const createIncognitoUser = async (deviceId: string, playerName: string) => {
  let recordId = null;
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/api/user`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId, playerName }),
        credentials: 'include',
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    recordId = data.recordId;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error creating incognito user: ${message}`);
  }
  return recordId;
};

export const generateWords = async (
  roomId: string,
  topic: string,
): Promise<void> => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/api/ai-generate?roomId=${roomId}&topic=${topic}`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      },
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Error generate words: ${message}`);
  }
};

export default { getUser, createIncognitoUser, generateWords };
