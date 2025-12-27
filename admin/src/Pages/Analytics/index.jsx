import React, { useState, useEffect, useContext } from 'react';
import { fetchDataFromApi } from '../../utils/api';
import { MyContext } from '../../App';
import { 
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { FaUsers, FaGlobe, FaDesktop, FaMobile, FaTablet, FaChartLine, FaEye, FaClock } from 'react-icons/fa';
import { HiTrendingUp, HiTrendingDown } from 'react-icons/hi';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

// Country flag emoji helper
const getCountryFlag = (countryCode) => {
    if (!countryCode || countryCode === 'XX' || countryCode === 'LC') return '🌍';
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
};

const Analytics = () => {
    const context = useContext(MyContext);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState('30d');
    
    // Dashboard stats
    const [dashboardStats, setDashboardStats] = useState(null);
    const [countryStats, setCountryStats] = useState([]);
    const [deviceStats, setDeviceStats] = useState([]);
    const [topPages, setTopPages] = useState([]);
    const [referrerStats, setReferrerStats] = useState([]);
    const [timelineData, setTimelineData] = useState([]);
    const [browserStats, setBrowserStats] = useState([]);
    const [realTimeStats, setRealTimeStats] = useState({ activeVisitors: 0, pageViews: 0 });

    // Fetch all analytics data
    const fetchAnalytics = async () => {
        setLoading(true);
        context?.setProgress(30);
        
        try {
            // Fetch all stats in parallel
            const [dashboard, countries, devices, pages, referrers, timeline, browsers, realtime] = await Promise.all([
                fetchDataFromApi('/api/analytics/dashboard'),
                fetchDataFromApi(`/api/analytics/countries?period=${period}`),
                fetchDataFromApi(`/api/analytics/devices?period=${period}`),
                fetchDataFromApi(`/api/analytics/pages?period=${period}&limit=10`),
                fetchDataFromApi(`/api/analytics/referrers?period=${period}&limit=10`),
                fetchDataFromApi(`/api/analytics/timeline?period=${period}`),
                fetchDataFromApi(`/api/analytics/browsers?period=${period}`),
                fetchDataFromApi('/api/analytics/realtime')
            ]);
            
            if (dashboard?.success) setDashboardStats(dashboard.data);
            if (countries?.success) setCountryStats(countries.data || []);
            if (devices?.success) setDeviceStats(devices.data || []);
            if (pages?.success) setTopPages(pages.data || []);
            if (referrers?.success) setReferrerStats(referrers.data || []);
            if (timeline?.success) setTimelineData(timeline.data || []);
            if (browsers?.success) setBrowserStats(browsers.data || []);
            if (realtime?.success) setRealTimeStats(realtime.data || { activeVisitors: 0, pageViews: 0 });
            
            context?.setProgress(100);
        } catch (error) {
            console.error('Error fetching analytics:', error);
            context?.alertBox('error', 'Failed to load analytics data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
        
        // Refresh real-time stats every 30 seconds
        const interval = setInterval(async () => {
            try {
                const realtime = await fetchDataFromApi('/api/analytics/realtime');
                if (realtime?.success) setRealTimeStats(realtime.data);
            } catch (e) {
                console.error('Real-time refresh error:', e);
            }
        }, 30000);
        
        return () => clearInterval(interval);
    }, [period]);

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num?.toString() || '0';
    };

    const getDeviceIcon = (device) => {
        switch (device?.toLowerCase()) {
            case 'desktop': return <FaDesktop className="text-blue-500" />;
            case 'mobile': return <FaMobile className="text-green-500" />;
            case 'tablet': return <FaTablet className="text-orange-500" />;
            default: return <FaDesktop className="text-gray-500" />;
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <CircularProgress />
            </div>
        );
    }

    return (
        <div className="analytics-dashboard">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">📊 Analytics Dashboard</h1>
                    <p className="text-gray-500 text-sm mt-1">Track your website visitors and engagement</p>
                </div>
                
                <div className="flex items-center gap-4">
                    {/* Real-time indicator */}
                    <div className="flex items-center gap-2 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                        <span className="text-green-700 font-semibold">{realTimeStats.activeVisitors}</span>
                        <span className="text-green-600 text-sm">online now</span>
                    </div>
                    
                    {/* Period selector */}
                    <Select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        size="small"
                        className="min-w-[120px]"
                    >
                        <MenuItem value="today">Today</MenuItem>
                        <MenuItem value="7d">Last 7 days</MenuItem>
                        <MenuItem value="30d">Last 30 days</MenuItem>
                        <MenuItem value="90d">Last 90 days</MenuItem>
                    </Select>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Today's Visitors */}
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Today's Visitors</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">
                                {formatNumber(dashboardStats?.today?.uniqueVisitors || 0)}
                            </h3>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-full">
                            <FaUsers className="text-blue-600 text-xl" />
                        </div>
                    </div>
                    <div className="flex items-center mt-3">
                        {dashboardStats?.today?.changePercent >= 0 ? (
                            <HiTrendingUp className="text-green-500 mr-1" />
                        ) : (
                            <HiTrendingDown className="text-red-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${dashboardStats?.today?.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {dashboardStats?.today?.changePercent >= 0 ? '+' : ''}{dashboardStats?.today?.changePercent || 0}%
                        </span>
                        <span className="text-gray-400 text-sm ml-1">vs yesterday</span>
                    </div>
                </div>

                {/* Page Views Today */}
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Page Views Today</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">
                                {formatNumber(dashboardStats?.today?.visits || 0)}
                            </h3>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-full">
                            <FaEye className="text-purple-600 text-xl" />
                        </div>
                    </div>
                    <div className="flex items-center mt-3">
                        <span className="text-gray-500 text-sm">
                            {dashboardStats?.today?.newVisitors || 0} new visitors
                        </span>
                    </div>
                </div>

                {/* Monthly Visitors */}
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Monthly Visitors</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">
                                {formatNumber(dashboardStats?.thisMonth?.uniqueVisitors || 0)}
                            </h3>
                        </div>
                        <div className="bg-green-100 p-3 rounded-full">
                            <FaChartLine className="text-green-600 text-xl" />
                        </div>
                    </div>
                    <div className="flex items-center mt-3">
                        {dashboardStats?.thisMonth?.changePercent >= 0 ? (
                            <HiTrendingUp className="text-green-500 mr-1" />
                        ) : (
                            <HiTrendingDown className="text-red-500 mr-1" />
                        )}
                        <span className={`text-sm font-medium ${dashboardStats?.thisMonth?.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {dashboardStats?.thisMonth?.changePercent >= 0 ? '+' : ''}{dashboardStats?.thisMonth?.changePercent || 0}%
                        </span>
                        <span className="text-gray-400 text-sm ml-1">vs last month</span>
                    </div>
                </div>

                {/* Countries */}
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-500 text-sm">Countries</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">
                                {countryStats?.length || 0}
                            </h3>
                        </div>
                        <div className="bg-orange-100 p-3 rounded-full">
                            <FaGlobe className="text-orange-600 text-xl" />
                        </div>
                    </div>
                    <div className="flex items-center mt-3">
                        <span className="text-gray-500 text-sm">
                            Top: {countryStats[0]?.country || 'N/A'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Visitors Over Time */}
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">📈 Visitors Over Time</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={timelineData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis 
                                    dataKey="date" 
                                    tick={{ fontSize: 12 }}
                                    tickFormatter={(value) => {
                                        const date = new Date(value);
                                        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                                    }}
                                />
                                <YAxis tick={{ fontSize: 12 }} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="uniqueVisitors" 
                                    stroke="#3b82f6" 
                                    fill="#93c5fd" 
                                    name="Unique Visitors"
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="visits" 
                                    stroke="#10b981" 
                                    fill="#6ee7b7" 
                                    name="Page Views"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Device Breakdown */}
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">📱 Device Breakdown</h3>
                    <div className="h-[300px] flex items-center">
                        <div className="w-1/2">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={deviceStats}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="visits"
                                        nameKey="device"
                                    >
                                        {deviceStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="w-1/2 space-y-3">
                            {deviceStats.map((device, index) => (
                                <div key={device.device} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {getDeviceIcon(device.device)}
                                        <span className="text-gray-700 capitalize">{device.device}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-semibold">{device.percentage}%</span>
                                        <span className="text-gray-400 text-sm ml-2">({formatNumber(device.visits)})</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Countries and Top Pages */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Top Countries */}
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">🌍 Top Countries</h3>
                    <div className="space-y-3 max-h-[350px] overflow-y-auto">
                        {countryStats.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No data yet</p>
                        ) : (
                            countryStats.slice(0, 10).map((country, index) => (
                                <div key={country.country} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">{getCountryFlag(country.countryCode)}</span>
                                        <div>
                                            <span className="font-medium text-gray-800">{country.country}</span>
                                            <span className="text-gray-400 text-sm ml-2">({country.countryCode})</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-semibold text-gray-800">{formatNumber(country.visits)}</span>
                                        <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                                            <div 
                                                className="bg-blue-500 h-2 rounded-full" 
                                                style={{ width: `${country.percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Top Pages */}
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">📄 Top Pages</h3>
                    <div className="space-y-3 max-h-[350px] overflow-y-auto">
                        {topPages.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No data yet</p>
                        ) : (
                            topPages.map((page, index) => (
                                <div key={page.page} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                            {index + 1}
                                        </span>
                                        <span className="font-medium text-gray-700 truncate max-w-[200px]" title={page.page}>
                                            {page.page === '/' ? 'Homepage' : page.page}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="font-semibold text-gray-800">{formatNumber(page.visits)}</span>
                                        <span className="text-gray-400 text-sm ml-1">views</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Referrers and Browsers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Traffic Sources */}
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">🔗 Traffic Sources</h3>
                    <div className="h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={referrerStats.slice(0, 5)} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis type="number" tick={{ fontSize: 12 }} />
                                <YAxis 
                                    dataKey="referrer" 
                                    type="category" 
                                    tick={{ fontSize: 12 }} 
                                    width={100}
                                />
                                <Tooltip />
                                <Bar dataKey="visits" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Browsers */}
                <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">🌐 Browsers</h3>
                    <div className="space-y-3">
                        {browserStats.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No data yet</p>
                        ) : (
                            browserStats.map((browser, index) => (
                                <div key={browser.browser} className="flex items-center justify-between">
                                    <span className="text-gray-700">{browser.browser}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="h-2 rounded-full" 
                                                style={{ 
                                                    width: `${browser.percentage}%`,
                                                    backgroundColor: COLORS[index % COLORS.length]
                                                }}
                                            ></div>
                                        </div>
                                        <span className="font-semibold text-gray-800 w-12 text-right">{browser.percentage}%</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;

