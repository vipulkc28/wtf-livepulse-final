import { useAnalytics } from '../hooks/useAnalytics.js';
import { useGymData } from '../hooks/useGymData.js';
import { useAppStore } from '../store/useAppStore.js';
import { AppShell } from '../components/layout/AppShell.jsx';
import { TopNav } from '../components/layout/TopNav.jsx';
import { SummaryBar } from '../components/layout/SummaryBar.jsx';
import { OccupancyCard } from '../components/live/OccupancyCard.jsx';
import { RevenueCard } from '../components/live/RevenueCard.jsx';
import { ActivityFeed } from '../components/live/ActivityFeed.jsx';
import { ConnectionIndicator } from '../components/live/ConnectionIndicator.jsx';
import { HeatmapPanel } from '../components/analytics/HeatmapPanel.jsx';
import { RevenueBreakdownChart } from '../components/analytics/RevenueBreakdownChart.jsx';
import { ChurnRiskPanel } from '../components/analytics/ChurnRiskPanel.jsx';
import { RenewalDonut } from '../components/analytics/RenewalDonut.jsx';
import { CrossGymRevenueChart } from '../components/analytics/CrossGymRevenueChart.jsx';
import { AnomalyTable } from '../components/anomalies/AnomalyTable.jsx';
import { SimulatorControlPanel } from '../components/simulator/SimulatorControlPanel.jsx';

export function DashboardPage() {
  const selectedGymId = useAppStore((s) => s.selectedGymId);
  const liveSnapshot = useAppStore((s) => s.liveSnapshot);
  const analytics = useAppStore((s) => s.analytics);
  const activityFeed = useAppStore((s) => s.activityFeed);
  const anomalies = useAppStore((s) => s.anomalies);
  const connectionStatus = useAppStore((s) => s.connectionStatus);

  useGymData(selectedGymId);
  useAnalytics(selectedGymId, '30d');

  return (
    <AppShell>
      <TopNav />
      <SummaryBar />
      <div className="grid two">
        <OccupancyCard occupancy={liveSnapshot?.live?.current_occupancy || 0} capacity={liveSnapshot?.gym?.capacity || 0} />
        <RevenueCard amount={liveSnapshot?.live?.today_revenue || 0} />
      </div>
      <div className="grid two">
        <ActivityFeed items={activityFeed} />
        <div className="stack">
          <ConnectionIndicator status={connectionStatus} />
          <SimulatorControlPanel />
        </div>
      </div>
      <div className="grid two">
        <HeatmapPanel items={analytics?.heatmap || []} />
        <RevenueBreakdownChart items={analytics?.revenue_by_plan || []} />
      </div>
      <div className="grid three">
        <ChurnRiskPanel items={analytics?.churn_risk_members || []} />
        <RenewalDonut data={analytics?.new_vs_renewal || { new_pct: 0, renewal_pct: 0 }} />
        <CrossGymRevenueChart items={analytics?.cross_gym || []} />
      </div>
      <AnomalyTable items={anomalies} />
    </AppShell>
  );
}
