import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

export default function MoodChart({ labels, data }) {
  const chartData = {
    labels,
    datasets: [
      {
        label: "Mood theo ngày",
        data,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-md">
      <h2 className="text-xl font-semibold mb-2">Biểu đồ Mood</h2>
      <Line data={chartData} />
    </div>
  );
}
