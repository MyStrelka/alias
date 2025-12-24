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

const createIncognitoUser = async (deviceId: string, name: string) => {
  let recordId = null;
  try {
    const response = await fetch(
      `${import.meta.env.VITE_SERVER_URL}/api/user`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId, name }),
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

export default { getUser, createIncognitoUser };
