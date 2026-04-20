import { useAppStore } from '../../store/useAppStore.js';

export function TopNav() {
  const gyms = useAppStore((s) => s.gyms);
  const selectedGymId = useAppStore((s) => s.selectedGymId);
  const setSelectedGymId = useAppStore((s) => s.setSelectedGymId);

  return (
    <header className="card row between">
      <h1>WTF LivePulse</h1>
      <select value={selectedGymId || ''} onChange={(e) => setSelectedGymId(e.target.value)}>
        {gyms.map((gym) => (
          <option key={gym.id} value={gym.id}>{gym.name}</option>
        ))}
      </select>
    </header>
  );
}
