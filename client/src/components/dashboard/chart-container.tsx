import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/lib/hooks/use-theme';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';

type ChartType = 'bar' | 'pie' | 'doughnut' | 'line';

interface ChartContainerProps {
  title: string;
  type: ChartType;
  data: any[];
  dataKey?: string;
  nameKey?: string;
  categories?: string[];
  colors?: string[];
  height?: number;
}

const ChartContainer = ({
  title,
  type,
  data,
  dataKey = 'value',
  nameKey = 'name',
  categories,
  colors = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899'],
  height = 300
}: ChartContainerProps) => {
  const { theme } = useTheme();

  const renderBarChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#f1f1f1'} />
        <XAxis 
          dataKey={nameKey} 
          tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#6B7280' }} 
          axisLine={{ stroke: theme === 'dark' ? '#4B5563' : '#E5E7EB' }}
        />
        <YAxis 
          tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#6B7280' }} 
          axisLine={{ stroke: theme === 'dark' ? '#4B5563' : '#E5E7EB' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: theme === 'dark' ? '#1F2937' : '#FFF',
            borderColor: theme === 'dark' ? '#4B5563' : '#E5E7EB',
            color: theme === 'dark' ? '#F9FAFB' : '#111827'
          }} 
        />
        {categories ? (
          categories.map((category, index) => (
            <Bar 
              key={category} 
              dataKey={category} 
              fill={colors[index % colors.length]} 
              radius={[4, 4, 0, 0]}
            />
          ))
        ) : (
          <Bar dataKey={dataKey} fill="#3B82F6" radius={[4, 4, 0, 0]} />
        )}
      </BarChart>
    </ResponsiveContainer>
  );

  const renderPieChart = (isDoughnut = false) => (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={isDoughnut ? 70 : 0}
          outerRadius={100}
          fill="#8884d8"
          paddingAngle={1}
          dataKey={dataKey}
          nameKey={nameKey}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ 
            backgroundColor: theme === 'dark' ? '#1F2937' : '#FFF',
            borderColor: theme === 'dark' ? '#4B5563' : '#E5E7EB',
            color: theme === 'dark' ? '#F9FAFB' : '#111827'
          }} 
        />
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          formatter={(value) => <span style={{ color: theme === 'dark' ? '#E5E7EB' : '#4B5563' }}>{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderLineChart = () => (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#f1f1f1'} />
        <XAxis 
          dataKey={nameKey} 
          tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#6B7280' }} 
          axisLine={{ stroke: theme === 'dark' ? '#4B5563' : '#E5E7EB' }}
        />
        <YAxis 
          tick={{ fill: theme === 'dark' ? '#9CA3AF' : '#6B7280' }} 
          axisLine={{ stroke: theme === 'dark' ? '#4B5563' : '#E5E7EB' }}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: theme === 'dark' ? '#1F2937' : '#FFF',
            borderColor: theme === 'dark' ? '#4B5563' : '#E5E7EB',
            color: theme === 'dark' ? '#F9FAFB' : '#111827'
          }} 
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value) => <span style={{ color: theme === 'dark' ? '#E5E7EB' : '#4B5563' }}>{value}</span>}
        />
        {categories?.map((category, index) => (
          <Line
            key={category}
            type="monotone"
            dataKey={category}
            name={category}
            stroke={colors?.[index] || '#3B82F6'}
            strokeWidth={2}
            dot={{ fill: colors?.[index] || '#3B82F6' }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'pie':
      case 'doughnut':
        return renderPieChart();
      case 'line':
        return renderLineChart();
      default:
        return <div>Chart type not supported</div>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-0">
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {renderChart()}
      </CardContent>
    </Card>
  );
};

export default ChartContainer;