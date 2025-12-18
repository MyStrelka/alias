export interface UserData {
  id: string;
  username: string;
  email: string;
  avatar: string; // URL картинки
  collectionId: string;
  collectionName: string;
  name?: string; // Поле может быть опциональным (?)
}
