import React, { useEffect, useState } from 'react';
import { useIndexedDB } from '../hooks/useIndexedDB';
import { useASTStore } from '../store/astStore';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const ResistanceChart = () => {
  const { getResistanceTrends } = useIndexedDB();
  const { results } = useASTStore();
  const [trendData, setTrendData] = useState([]);
  const [organismFilter, setOrganismFilter] = useState('');
  const [antibioticFilter, setAntibioticFilter] = useState('');
  const [organisms, setOrganisms] = useState([]);
  const [antibiotics, setAntibiotics] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Get unique organisms and antibiotics from results
  useEffect(() => {
    if (results.length > 0) {
      const uniqueOrganisms = [...new Set(results.map(r => r.organism).filter(Boolean))];
      const uniqueAntibiotics = [...new Set(results.map(r => r.antibiotic).filter(Boolean))];
      setOrganisms(uniqueOrganisms);
      setAntibiotics(uniqueAntibiotics);
    }
  }, [results]);

  // Load trend data
  useEffect(() => {
    loadTrendData();
  }, [organismFilter, antibioticFilter]);

  const loadTrendData = async () => {
    setIsLoading(true);
    const data = await getResistanceTrends(
      organismFilter || null,
      antibioticFilter || null,
      12
    );
    setTrendData(data);
    setIsLoading(false);
  };

  // Prepare pie chart data for overall resistance
  const getPieData = () => {
    const sCount = results.filter(r => r.interpretation === 'S').length;
    const iCount = results.filter(r => r.interpretation === 'I').length;
    const rCount = results.filter(r => r.interpretation === 'R').length;

    return {
      labels: ['Susceptible (S)', 'Intermediate (I)', 'Resistant (R)'],
      datasets: [
        {
          data: [sCount, iCount, rCount],
          backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
          borderColor: ['#16a34a', '#ca8a04', '#dc2626'],
          borderWidth: 2,
        },
      ],
    };
  };

  // Prepare bar chart for organism-specific resistance
  const getOrganismResistanceData = () => {
    const organismMap = {};
    
    results.forEach(r => {
      if (!organismMap[r.organism]) {
        organismMap[r.organism] = { total: 0, resistant: 0 };
      }
      organismMap[r.organism].total++;
      if (r.interpretation === 'R') {
        organismMap[r.organism].resistant++;
      }
    });

    const labels = Object.keys(organismMap);
    const data = labels.map(org => 
      organismMap[org].total > 0 ? Math.round((organismMap[org].resistant / organismMap[org].total) * 100) : 0
    );
    const counts = labels.map(org => organismMap[org].total);

    return {
      labels,
      datasets: [
        {
          label: 'Resistance Rate (%)',
          data: data,
          backgroundColor: data.map(val => 
            val >= 40 ? '#ef4444' : 
            val >= 20 ? '#eab308' : 
            '#22c55e'
          ),
          borderColor: '#1e293b',
          borderWidth: 1,
          yAxisID: 'y',
        },
        {
          label: 'Total Tests',
          data: counts,
          backgroundColor: '#3b82f6',
          borderColor: '#1e293b',
          borderWidth: 1,
          yAxisID: 'y1',
        },
      ],
    };
  };

  // Prepare line chart for resistance trends
  const getTrendData = () => {
    if (trendData.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [
          {
            label: 'Resistance Rate (%)',
            data: [0],
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            tension: 0.4,
            fill: true,
          },
        ],
      };
    }

    return {
      labels: trendData.map(d => d.month),
      datasets: [
        {
          label: 'Resistance Rate (%)',
          data: trendData.map(d => d.resistanceRate),
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#ef4444',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          yAxisID: 'y',
        },
        {
          label: 'Total Tests',
          data: trendData.map(d => d.total),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: false,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          yAxisID: 'y1',
        },
      ],
    };
  };

  const pieOptions = {
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: true,
        text: 'Overall Resistance Distribution',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  const barOptions = {
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: true,
        text: 'Resistance Rate by Organism',
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Percentage (%)',
        },
        grid: {
          drawOnChartArea: true,
        },
      },
      y1: {
        position: 'right',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Total Tests',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  const lineOptions = {
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: true,
        text: `Resistance Trends ${organismFilter ? `- ${organismFilter}` : ''}${antibioticFilter ? ` (${antibioticFilter})` : ''}`,
        font: {
          size: 16,
          weight: 'bold',
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        title: {
          display: true,
          text: 'Resistance Rate (%)',
        },
      },
      y1: {
        position: 'right',
        beginAtZero: true,
        title: {
          display: true,
          text: 'Total Tests',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };

  if (results.length === 0) {
    return (
      <div className="card">
        <p className="text-center text-gray-500 py-8">
          📊 Enter some AST results to see resistance charts
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters for trend chart */}
      <div className="card grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="label-text text-sm">Organism Filter</label>
          <select
            value={organismFilter}
            onChange={(e) => setOrganismFilter(e.target.value)}
            className="select-field text-sm"
          >
            <option value="">All Organisms</option>
            {organisms.map(org => (
              <option key={org} value={org}>{org}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-text text-sm">Antibiotic Filter</label>
          <select
            value={antibioticFilter}
            onChange={(e) => setAntibioticFilter(e.target.value)}
            className="select-field text-sm"
          >
            <option value="">All Antibiotics</option>
            {antibiotics.map(ab => (
              <option key={ab} value={ab}>{ab}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button 
            onClick={() => {
              setOrganismFilter('');
              setAntibioticFilter('');
            }} 
            className="btn-outline text-sm w-full"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Pie Chart - Overall Distribution */}
      <div className="card">
        <div className="h-80">
          <Pie data={getPieData()} options={pieOptions} />
        </div>
      </div>

      {/* Bar Chart - Organism Resistance */}
      <div className="card">
        <div className="h-80">
          <Bar data={getOrganismResistanceData()} options={barOptions} />
        </div>
      </div>

      {/* Line Chart - Trends */}
      <div className="card">
        <div className="h-80">
          {isLoading ? (
            <p className="text-center text-gray-500 py-8">Loading trend data...</p>
          ) : (
            <Line data={getTrendData()} options={lineOptions} />
          )}
        </div>
        {trendData.length > 0 && (
          <div className="mt-4 text-sm text-gray-500 text-center">
            Showing last {trendData.length} months of data
          </div>
        )}
      </div>
    </div>
  );
};

export default ResistanceChart;
