import { useEffect, useState } from "react";
import axios from "axios";
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

export default function MoodChart() {
  const [labels, setLabels] = useState([]);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchData = async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        console.error("⚠️ Chưa đăng nhập hoặc user chưa được lưu.");
        return;
      }
      const token = JSON.parse(storedUser).token;

      const res = await axios.get("http://localhost:5000/api/moods", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("✅ Dữ liệu mood:", res.data);

      if (!Array.isArray(res.data) || res.data.length === 0) {
        console.warn("⚠️ Không có dữ liệu mood");
        setLabels([]);
        setScores([]);
        return;
      }

      const xLabels = res.data.map(item => item.x);
      const yScores = res.data.map(item => item.y);

      setLabels(xLabels);
      setScores(yScores);
    } catch (err) {
      console.error("❌ Lỗi khi lấy dữ liệu mood:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);


  const chartData = {
    labels,
    datasets: [
      {
        label: "Mood theo thời gian",
        data: scores,
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.3,
        pointRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
      },
      tooltip: {
        callbacks: {
          label: context => `Mood: ${context.parsed.y}`,
        },
      },
    },
    scales: {
      y: {
        min: 0,
        max: 1,
        title: {
          display: true,
          text: "Mức mood (0 - 1)",
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-md">
      <h2 className="text-xl font-semibold mb-2">Biểu đồ Mood</h2>
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : labels.length === 0 ? (
        <p className="text-gray-500">Chưa có dữ liệu mood nào.</p>
      ) : (
        <Line data={chartData} options={chartOptions} />
      )}
    </div>
  );
}
