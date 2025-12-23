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

export default { getUser };
