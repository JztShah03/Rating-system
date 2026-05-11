import { RefreshCw, ShieldAlert } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import AdminChart from '../components/AdminChart';
import LoadingButton from '../components/LoadingButton';
import StatCard from '../components/StatCard';
import { technicians } from '../data/technicians';
import { fetchRatings } from '../services/googleSheetService';
import { formatAverage, getRatingEmoji, getRatingLabel } from '../utils/ratingHelpers';

const chartColors = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];


function normalizeTimestamp(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function getRatingDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function buildTechnicianSummary(records) {
  return technicians.map((technician) => {
    const technicianRecords = records.filter((record) => {
      const recordTechnician = String(record.technicianName || record.technicianId);
      return recordTechnician === technician.name;
    });
    const total = technicianRecords.length;
    const ratingSum = technicianRecords.reduce((sum, record) => sum + Number(record.ratingValue || 0), 0);
    const average = total ? ratingSum / total : 0;

    const counts = [1, 2, 3, 4, 5].reduce((result, value) => {
      result[value] = technicianRecords.filter((record) => Number(record.ratingValue) === value).length;
      return result;
    }, {});

    return {
      technicianId: technician.name,
      technicianName: technician.name,
      name: technician.name,
      total,
      average: Number(average.toFixed(2)),
      counts
    };
  });
}

function buildRatingDistribution(records) {
  return [1, 2, 3, 4, 5].map((value) => ({
    name: `${value} - ${getRatingLabel(value)}`,
    value,
    count: records.filter((record) => Number(record.ratingValue) === value).length,
    emoji: getRatingEmoji(value)
  }));
}

export default function AdminDashboard({ onLogout }) {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [technicianFilter, setTechnicianFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const data = await fetchRatings();
      const sorted = [...data].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      setRecords(sorted);
    } catch (error) {
      console.error(error);
      setErrorMessage('Google Sheet data cannot be loaded. Check your Apps Script URL and deployment permissions.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredRecords = useMemo(() => {
    return records.filter((record) => {
      const recordTechnician = String(record.technicianName || record.technicianId);
      const matchesTechnician = technicianFilter === 'all' || recordTechnician === technicianFilter;
      const recordDate = getRatingDate(record.timestamp);
      const matchesStart = !startDate || (recordDate && recordDate >= new Date(`${startDate}T00:00:00`));
      const matchesEnd = !endDate || (recordDate && recordDate <= new Date(`${endDate}T23:59:59`));

      return matchesTechnician && matchesStart && matchesEnd;
    });
  }, [endDate, records, startDate, technicianFilter]);

  const totalRatings = filteredRecords.length;
  const ratingSum = filteredRecords.reduce((sum, record) => sum + Number(record.ratingValue || 0), 0);
  const overallAverage = totalRatings ? ratingSum / totalRatings : 0;
  const technicianSummary = buildTechnicianSummary(filteredRecords);
  const activeTechnicians = technicianSummary.filter((item) => item.total > 0);
  const bestTechnician = activeTechnicians.length
    ? [...activeTechnicians].sort((a, b) => b.average - a.average || b.total - a.total)[0]
    : null;
  const lowestTechnician = activeTechnicians.length
    ? [...activeTechnicians].sort((a, b) => a.average - b.average || b.total - a.total)[0]
    : null;
  const distribution = buildRatingDistribution(filteredRecords);
  const ratingBreakdownData = technicianSummary.map((item) => ({
    technicianName: item.technicianName,
    '1': item.counts[1],
    '2': item.counts[2],
    '3': item.counts[3],
    '4': item.counts[4],
    '5': item.counts[5]
  }));
  const recentRecords = filteredRecords.slice(0, 10);

  return (
    <main className="page page--dashboard">
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">Admin Dashboard</span>
          <h1>ICT Service Analytics</h1>
          <p>Monitor customer feedback, service performance, and rating trends from Google Sheets.</p>
        </div>
        <div className="dashboard-header__actions">
          <LoadingButton isLoading={isLoading} loadingText="Refreshing..." onClick={loadData}>
            <RefreshCw size={18} aria-hidden="true" /> Refresh Data
          </LoadingButton>
          <button className="button button--ghost" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      </header>

      <section className="filter-panel" aria-label="Dashboard filters">
        <label>
          ICT Service
          <select value={technicianFilter} onChange={(event) => setTechnicianFilter(event.target.value)}>
            <option value="all">All Services</option>
            {technicians.map((technician) => (
              <option key={technician.name} value={technician.name}>
                {technician.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Start date
          <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
        </label>
        <label>
          End date
          <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
        </label>
        <button
          className="button button--ghost"
          type="button"
          onClick={() => {
            setTechnicianFilter('all');
            setStartDate('');
            setEndDate('');
          }}
        >
          Clear Filters
        </button>
      </section>

      {errorMessage ? (
        <section className="empty-state empty-state--error" role="alert">
          <h2>Unable to load dashboard</h2>
          <p>{errorMessage}</p>
          <button className="button button--primary" type="button" onClick={loadData}>
            Try Again
          </button>
        </section>
      ) : null}

      {!errorMessage && isLoading ? (
        <section className="empty-state">
          <span className="spinner spinner--large" aria-hidden="true" />
          <h2>Loading rating data...</h2>
          <p>Please wait while the dashboard fetches records from Google Sheets.</p>
        </section>
      ) : null}

      {!errorMessage && !isLoading && totalRatings === 0 ? (
        <section className="empty-state">
          <h2>No rating data yet</h2>
          <p>Once customers submit ratings, analytics and recent records will appear here.</p>
        </section>
      ) : null}

      {!errorMessage && !isLoading && totalRatings > 0 ? (
        <>
          <section className="stats-grid">
            <StatCard label="Total Ratings" value={totalRatings} helper="Filtered records" />
            <StatCard label="Overall Average" value={formatAverage(overallAverage)} helper="Out of 5.00" />
            <StatCard
              label="Best Performing"
              value={bestTechnician ? bestTechnician.technicianName : '—'}
              helper={bestTechnician ? `${formatAverage(bestTechnician.average)} average` : 'No data'}
            />
            <StatCard
              label="Lowest Performing"
              value={lowestTechnician ? lowestTechnician.technicianName : '—'}
              helper={lowestTechnician ? `${formatAverage(lowestTechnician.average)} average` : 'No data'}
            />
          </section>

          <section className="charts-grid">
            <AdminChart title="Rating Breakdown by Service">
              <ResponsiveContainer width="100%" height={310}>
                <BarChart data={ratingBreakdownData} margin={{ top: 10, right: 20, left: 0, bottom: 48 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="technicianName" angle={-35} textAnchor="end" interval={0} height={70} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="1" stackId="a" fill="#ef4444" name="Very Unsatisfied (1)" />
                  <Bar dataKey="2" stackId="a" fill="#f97316" name="Unsatisfied (2)" />
                  <Bar dataKey="3" stackId="a" fill="#eab308" name="Neutral (3)" />
                  <Bar dataKey="4" stackId="a" fill="#84cc16" name="Satisfied (4)" />
                  <Bar dataKey="5" stackId="a" fill="#22c55e" name="Very Satisfied (5)" />
                </BarChart>
              </ResponsiveContainer>
            </AdminChart>

            <AdminChart title="Number of Ratings per Service">
              <ResponsiveContainer width="100%" height={310}>
                <BarChart data={technicianSummary} margin={{ top: 10, right: 20, left: 0, bottom: 48 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="technicianName" angle={-35} textAnchor="end" interval={0} height={70} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="total" name="Total Ratings" fill="#0f766e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </AdminChart>

            <AdminChart title="Rating Distribution">
              <ResponsiveContainer width="100%" height={310}>
                <PieChart>
                  <Pie
                    data={distribution}
                    dataKey="count"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={105}
                    paddingAngle={3}
                  >
                    {distribution.map((entry, index) => (
                      <Cell key={entry.value} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name, item) => [`${value} ratings`, `${item.payload.emoji} ${name}`]} />
                </PieChart>
              </ResponsiveContainer>
            </AdminChart>
          </section>

          <section className="table-card">
            <div className="table-card__header">
              <h2>Service Performance Breakdown</h2>
              <p>Average rating and distribution count from 1 to 5 for every service.</p>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ICT Service</th>
                    <th>Total</th>
                    <th>Average</th>
                    <th>1 😡</th>
                    <th>2 🙁</th>
                    <th>3 😐</th>
                    <th>4 🙂</th>
                    <th>5 😄</th>
                  </tr>
                </thead>
                <tbody>
                  {technicianSummary.map((item) => (
                    <tr key={item.technicianId}>
                      <td>
                        <strong>{item.technicianName}</strong>
                      </td>
                      <td>{item.total}</td>
                      <td>{formatAverage(item.average)}</td>
                      <td>{item.counts[1]}</td>
                      <td>{item.counts[2]}</td>
                      <td>{item.counts[3]}</td>
                      <td>{item.counts[4]}</td>
                      <td>{item.counts[5]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="table-card">
            <div className="table-card__header">
              <h2>Latest Rating Records</h2>
              <p>Showing up to 10 most recent records based on the active filters.</p>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Service</th>
                    <th>Rating</th>
                    <th>Device</th>
                    <th>User Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRecords.map((record, index) => {
                    const recordTechnician = record.technicianName || record.technicianId || 'Unknown';
                    return (
                      <tr key={`${record.timestamp}-${recordTechnician}-${index}`}>
                        <td>{normalizeTimestamp(record.timestamp)}</td>
                        <td>
                          <strong>{recordTechnician}</strong>
                        </td>
                        <td>
                          <strong>
                            {record.emojiSelected} {record.ratingValue}/5
                          </strong>
                          <span>{record.ratingLabel}</span>
                        </td>
                        <td>{record.deviceType || 'Unknown'}</td>
                        <td className="user-agent-cell">{record.userAgent || 'Unknown'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      ) : null}
    </main>
  );
}
