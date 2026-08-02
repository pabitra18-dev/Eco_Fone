
'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { getAllSalesData, type SaleRecord } from './actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowDownLeft, ArrowUpRight, DollarSign } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { getSalesData } from './analytics-actions';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const typeVariantMap: { [key in SaleRecord['type']]: "default" | "secondary" } = {
  Order: "default",
  Purchase: "secondary",
};

const statusVariantMap: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
  // Order statuses
  "Delivered": "default",
  "Shipped": "secondary",
  "Processing": "outline",
  "Pending Payment": "outline",
  "Cancelled": "destructive",
  "Payment Verified": "default",
  // Purchase statuses
  "pending": "outline",
  "accepted": "secondary",
  "rejected": "destructive",
  "completed": "default",
};

const TypeIcon = ({ type }: { type: SaleRecord['type'] }) => {
    if (type === 'Order') {
        return <ArrowUpRight className="h-4 w-4 text-green-500" title="Sale to Customer"/>;
    }
    return <ArrowDownLeft className="h-4 w-4 text-red-500" title="Purchase from Customer" />;
};

const chartConfig = {
  total: {
    label: "Sales",
    color: "hsl(var(--primary))",
  },
} satisfies import("@/components/ui/chart").ChartConfig;

export default function SalesPage() {
  const [records, setRecords] = useState<SaleRecord[]>([]);
  const [salesChartData, setSalesChartData] = useState<{ month: string; total: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [salesRecords, chartData] = await Promise.all([
          getAllSalesData(),
          getSalesData(new Date(new Date().setMonth(new Date().getMonth() - 6)), new Date()) // Default to last 6 months
      ]);
      setRecords(salesRecords);
      setSalesChartData(chartData);
      setLoading(false);
    };
    fetchData();
  }, []);
  
  const filteredRecords = useMemo(() => {
    if (!searchTerm) return records;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return records.filter(record => 
      record.customerName.toLowerCase().includes(lowerCaseSearchTerm) ||
      record.items.toLowerCase().includes(lowerCaseSearchTerm) ||
      record.id.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [records, searchTerm]);

  const totalRevenue = useMemo(() => filteredRecords.filter(r => r.type === 'Order' && r.status === 'Delivered').reduce((acc, r) => acc + r.amount, 0), [filteredRecords]);
  const totalCost = useMemo(() => filteredRecords.filter(r => r.type === 'Purchase' && r.status === 'completed').reduce((acc, r) => acc + r.amount, 0), [filteredRecords]);
  const netProfit = totalRevenue - totalCost;

  if (loading) {
    return <div className="text-center p-8">Loading sales data...</div>;
  }
  
  return (
    <div className="space-y-8">
       <div>
         <h1 className="text-3xl font-bold">Sales & Analytics</h1>
         <p className="text-muted-foreground">A consolidated view of all sales, purchases, and revenue trends.</p>
       </div>

       <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue (Completed)</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">NPR {totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Costs (Completed)</CardTitle>
              <ArrowDownLeft className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">NPR {totalCost.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                NPR {netProfit.toLocaleString()}
              </div>
            </CardContent>
          </Card>
       </div>
       
       <Card>
          <CardHeader>
              <CardTitle>Sales Overview</CardTitle>
              <CardDescription>Total sales over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
              <div className="w-full h-[250px] md:h-[300px]">
                <ChartContainer config={chartConfig} className="min-h-[200px] w-full h-full">
                    <BarChart accessibilityLayer data={salesChartData}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="total" fill="var(--color-total)" radius={4} />
                    </BarChart>
                </ChartContainer>
              </div>
          </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>All sales and purchases are listed below.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Input 
              placeholder="Search by customer, item, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          {/* Desktop Table */}
          <div className="hidden md:block border rounded-md">
            <Table>
                <TableHeader>
                <TableRow>
                    <TableHead className="hidden sm:table-cell">Type</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden md:table-cell">Items</TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                    <TableRow key={`${record.type}-${record.id}`}>
                        <TableCell className="hidden sm:table-cell">
                        <Badge variant={typeVariantMap[record.type]}>
                            <TypeIcon type={record.type}/>
                            <span className="ml-1.5">{record.type}</span>
                            </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{record.customerName}</TableCell>
                        <TableCell className="text-muted-foreground max-w-xs truncate hidden md:table-cell">{record.items}</TableCell>
                        <TableCell className="hidden sm:table-cell"><Badge variant={statusVariantMap[record.status]}>{record.status}</Badge></TableCell>
                        <TableCell className="text-right font-medium">NPR {record.amount.toLocaleString()}</TableCell>
                    </TableRow>
                    ))
                ) : (
                    <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                        No records found.
                    </TableCell>
                    </TableRow>
                )}
                </TableBody>
            </Table>
          </div>
           {/* Mobile Accordion */}
           <div className="md:hidden space-y-3">
                {filteredRecords.length > 0 ? (
                    <Accordion type="single" collapsible className="w-full">
                        {filteredRecords.map((record) => (
                        <AccordionItem value={`${record.type}-${record.id}`} key={`${record.type}-${record.id}`} className="border rounded-lg">
                            <AccordionTrigger className="p-4 text-sm hover:no-underline">
                                <div className="flex-1 flex justify-between items-center mr-4 text-left">
                                    <div>
                                    <p className="font-semibold">{record.customerName}</p>
                                    <p className="text-xs text-muted-foreground truncate max-w-[150px]">{record.items}</p>
                                    </div>
                                    <Badge variant={typeVariantMap[record.type]}>
                                    <TypeIcon type={record.type}/>
                                    <span className="ml-1.5">{record.type}</span>
                                    </Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="p-4 border-t space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Status:</span>
                                    <Badge variant={statusVariantMap[record.status]}>{record.status}</Badge>
                                </div>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Amount:</span>
                                    <span className="font-medium">NPR {record.amount.toLocaleString()}</span>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                        ))}
                    </Accordion>
                ) : (
                    <div className="text-center h-24 text-muted-foreground flex items-center justify-center">No records found.</div>
                )}
           </div>
        </CardContent>
      </Card>
    </div>
  );
}
