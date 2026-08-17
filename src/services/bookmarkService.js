import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@saved_post_ids';

/**
 * Retrieves the list of saved post IDs from AsyncStorage.
 * @returns {Promise<Array<string>>}
 */
export const getSavedPostIds = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Failed to load saved post IDs', e);
    return [];
  }
};

/**
 * Toggles the saved status of a post in AsyncStorage.
 * @param {string} postId 
 * @returns {Promise<Array<string>>} The updated list of saved post IDs
 */
export const toggleSavePost = async (postId) => {
  try {
    const savedIds = await getSavedPostIds();
    let newSavedIds;
    if (savedIds.includes(postId)) {
      newSavedIds = savedIds.filter(id => id !== postId);
    } else {
      newSavedIds = [...savedIds, postId];
    }
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSavedIds));
    return newSavedIds;
  } catch (e) {
    console.error('Failed to toggle save post', e);
    return [];
  }
};
