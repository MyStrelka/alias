export const generateRoomId = (existingRooms: string[]): string => {
  const newRoomId = Math.floor(1000 + Math.random() * 9000).toString();
  if (existingRooms.includes(newRoomId)) {
    return generateRoomId(existingRooms);
  } else {
    return newRoomId;
  }
};
