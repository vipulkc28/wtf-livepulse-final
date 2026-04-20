export const selectSelectedGym = (state) => state.gyms.find((g) => g.id === state.selectedGymId) || null;
