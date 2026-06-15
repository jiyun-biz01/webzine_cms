import { useState, useEffect } from "react";
import {
	BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import ContentHeader from "@/components/layout/ContentHeader";
import SubscriberSummaryCards from "@/components/common/SubscriberSummaryCards";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import * as subscriberService from "@/services/subscriberService";
import styles from "./SubscriberStats.module.css";

const ALL_REGIONS = ["서울","경기","인천","강원","충북","충남","대전","세종","전북","전남","광주","경북","경남","대구","울산","부산","제주","해외"];

const tooltipStyle = {
	background: "var(--bg-primary)",
	border: "1px solid var(--border-color)",
	borderRadius: "var(--border-radius)",
	fontSize: "12px",
};

function SubscriberStats() {
	const [loading, setLoading]         = useState(true);
	const [summary, setSummary]         = useState({ total: 0, active: 0, inactive: 0 });
	const [monthlyStats, setMonthlyStats] = useState([]);
	const [ageStats, setAgeStats]       = useState([]);
	const [regionStats, setRegionStats] = useState([]);

	useEffect(() => {
		Promise.all([
			subscriberService.getSubscribers({ page: 1, limit: 1 }),
			subscriberService.getMonthlyStats(),
			subscriberService.getDemographicsStats(),
		])
			.then(([listData, monthly, demographics]) => {
				setSummary(listData.stats ?? { total: 0, active: 0, inactive: 0 });
				setMonthlyStats(monthly.map((d) => ({
					month: `${parseInt(d.month.split("-")[1])}월`,
					신규: d.count,
				})));
				setAgeStats(demographics.ageGroups.map((g) => ({ name: g.label, 명: g.count })));
				const regionMap = Object.fromEntries(demographics.regions.map((r) => [r.label, r.count]));
				setRegionStats(ALL_REGIONS.map((r) => ({ name: r, 명: regionMap[r] ?? 0 })));
			})
			.catch(() => {})
			.finally(() => setLoading(false));
	}, []);

	if (loading) return <LoadingSpinner />;

	return (
		<>
			<ContentHeader
				breadcrumb={["홈", "구독자 관리", "구독자 통계"]}
				title="구독자 통계"
				subTitle="구독자 현황과 월별·연령대·지역 분포를 확인합니다."
			/>

			<div className={styles.body}>
				<SubscriberSummaryCards stats={summary} />

				{/* 월별 신규 구독자 */}
				<div className="card">
					<div className="card-header"><h3>월별 신규 구독자 (최근 6개월)</h3></div>
					<div className={styles.chartWrap}>
						<ResponsiveContainer width="100%" height={220}>
							<BarChart data={monthlyStats} margin={{ top: 8, right: 24, left: -16, bottom: 0 }}>
								<CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
								<XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--text-secondary)" }} />
								<YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--text-secondary)" }} />
								<Tooltip contentStyle={tooltipStyle} />
								<Bar dataKey="신규" fill="var(--primary)" radius={[4, 4, 0, 0]} />
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>

				{/* 연령대 + 지역 */}
				<div className={styles.demoGrid}>
					{/* 연령대 분포 */}
					<div className="card">
						<div className="card-header"><h3>연령대 분포</h3></div>
						<div className={styles.chartWrap}>
							<ResponsiveContainer width="100%" height={220}>
								<BarChart data={ageStats} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
									<CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
									<XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} />
									<YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--text-secondary)" }} />
									<Tooltip contentStyle={tooltipStyle} />
									<Bar dataKey="명" fill="var(--info)" radius={[4, 4, 0, 0]} />
								</BarChart>
							</ResponsiveContainer>
						</div>
					</div>

					{/* 지역 분포 */}
					<div className="card">
						<div className="card-header"><h3>지역 분포</h3></div>
						<div className={styles.chartWrap}>
							<div style={{ overflowX: "auto" }}>
								<div style={{ minWidth: 900 }}>
									<ResponsiveContainer width="100%" height={220}>
										<BarChart data={regionStats} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
											<CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
											<XAxis dataKey="name" tick={{ fontSize: 11, fill: "var(--text-secondary)" }} interval={0} />
											<YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "var(--text-secondary)" }} />
											<Tooltip contentStyle={tooltipStyle} />
											<Bar dataKey="명" fill="var(--success)" radius={[4, 4, 0, 0]} />
										</BarChart>
									</ResponsiveContainer>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

export default SubscriberStats;
