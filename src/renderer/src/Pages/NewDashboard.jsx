import React from "react";
import {
  Card,
  CardContent,
  CardHeader
} from "../components/UI/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { motion } from "framer-motion";
import { LucideDollarSign, LucideUsers, LucidePackage, LucideFileText } from "lucide-react";

const data = [
  { date: "Mon", sales: 1200 },
  { date: "Tue", sales: 1900 },
  { date: "Wed", sales: 800 },
  { date: "Thu", sales: 1700 },
  { date: "Fri", sales: 2100 },
  { date: "Sat", sales: 2600 },
  { date: "Sun", sales: 3000 },
];

const stats = [
  { icon: LucideDollarSign, label: "Total Revenue", value: "₨ 210,000" },
  { icon: LucideFileText, label: "Total Invoices", value: "145" },
  { icon: LucideUsers, label: "Customers", value: "83" },
  { icon: LucidePackage, label: "Products", value: "37" },
];

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {stats.map(({ icon: Icon, label, value }, index) => (
          <Card key={index} className="rounded-2xl shadow-md hover:shadow-lg transition">
            <CardHeader className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <Icon className="text-blue-600 w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-xl font-semibold text-gray-800">{value}</p>
              </div>
            </CardHeader>
          </Card>
        ))}
      </motion.div>

      <motion.div
        className="bg-white p-6 rounded-2xl shadow-md"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h2 className="text-lg font-semibold mb-4 text-gray-700">Weekly Sales</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
