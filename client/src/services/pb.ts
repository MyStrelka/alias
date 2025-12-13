import PocketBase from "pocketbase";

// Адрес твоего сервера PocketBase.

export const pb = new PocketBase("http://127.0.0.1:8090");

// Тип данных пользователя
export interface UserData {
  id: string;
  username: string;
  email: string;
  avatar: string; // URL картинки
  collectionId: string;
  collectionName: string;
  name?: string; // Поле может быть опциональным (?)
}
