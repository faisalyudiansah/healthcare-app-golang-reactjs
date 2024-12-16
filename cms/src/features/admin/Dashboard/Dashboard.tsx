import React, { useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { Pie, PieChart, Cell, LabelList } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { Data } from '@/store/dashboardSlice';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

const getRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

type Props = {
  report: Data;
};

const AdminDashboard: React.FC<Props> = ({ report }) => {
  const state = useSelector((state: RootState) => state.dashboard);

  const prepareChartData = (data, key) => {
    let sortedData = [...data].sort((a, b) => b[key] - a[key]);
    if (sortedData.length > 8) {
      const topCategories = sortedData.slice(0, 7);
      const otherTotal = sortedData
        .slice(7)
        .reduce((sum, item) => sum + parseFloat(item[key]), 0);
      topCategories.push({
        name: 'Other',
        [key]: otherTotal,
        total_item: sortedData
          .slice(7)
          .reduce((sum, item) => sum + item.total_item, 0),
      });
      sortedData = topCategories;
    }
    return sortedData.map((item, index) => ({
      name: item.name,
      value: parseFloat(item[key]),
      totalItem: item.total_item,
      fill: getRandomColor(),
    }));
  };

  const categoryData = prepareChartData(
    report.products.categories,
    'total_product_price',
  );
  const classificationData = prepareChartData(
    report.products.classifications,
    'total_product_price',
  );

  const createChartConfig = (data) => {
    const config = {
      value: { label: 'Total Product Price' },
      totalItem: { label: 'Total Item' },
    };
    data.forEach((item) => {
      config[item.name] = {
        label: item.name,
        color: item.fill,
      };
    });
    return config;
  };

  const categoryConfig = createChartConfig(categoryData);
  const classificationConfig = createChartConfig(classificationData);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="font-bold">{data.name}</p>
          <p>Total Product Price: Rp{data.value.toLocaleString()}</p>
          <p>Total Item: {data.totalItem}</p>
        </div>
      );
    }
    return null;
  };

  const PieChartCard = ({ title, data, config }) => (
    <Card className="flex flex-col w-1/2">
      <CardHeader className="items-center pb-0">
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {state.startDate} - {state.endDate}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0 w-full">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart className="w-full">
            <Pie
              className="w-full"
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <LabelList
                dataKey="name"
                position="inside"
                fill="white"
                style={{ fontSize: '12px' }}
              />
            </Pie>
            <ChartTooltip content={<CustomTooltip />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">
          Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="leading-none text-muted-foreground">
          Showing total product price for the selected period
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <div className="flex flex-col w-full">
      <h1 className="font-bold text-center my-4">{report.pharmacy.name}</h1>
      <div className="w-full flex">
        <PieChartCard
          title="Pie Chart - Product Categories"
          data={categoryData}
          config={categoryConfig}
        />
        <PieChartCard
          title="Pie Chart - Product Classification"
          data={classificationData}
          config={classificationConfig}
        />
      </div>
    </div>
  );
};

export default AdminDashboard;
