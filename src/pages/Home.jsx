import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState, useContext } from "react";
import MoodChart from "../components/MoodChart";
import { AuthContext } from "../context/AuthContext";

function Home() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [chartData, setChartData] = useState({ labels: [], data: [] });

  const handleClick = () => {
    navigate('/create');
  };

  useEffect(() => {
  const fetchMoodData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/moods`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error(`Fetch failed with status ${res.status}`);
      }

      const result = await res.json();

      const moodMap = {
        sad: 1,
        neutral: 2,
        okay: 3,
        good: 4,
        happy: 5,
      };

      const labels = result.map(entry => {
        const date = new Date(entry.createdAt);
        return date.toLocaleDateString();
      });

      const data = result.map(entry => {
        return typeof entry.mood === "string"
          ? moodMap[entry.mood.toLowerCase()] || 0
          : entry.mood;
      });

      setChartData({ labels, data });
    } catch (error) {
      console.error("Lỗi khi fetch mood:", error);
    }
  };

  fetchMoodData();
}, []);


  return (
    <div
      className="min-h-screen flex flex-col items-center py-12 transition-colors duration-300"
      style={{
        backgroundImage:
          'linear-gradient(to bottom left, #a1c4fd 70%, #fbc2eb 100%)',
      }}
    >
      <div className="absolute inset-0 bg-gray-900 opacity-90 dark:opacity-100 pointer-events-none z-0 hidden dark:block"></div>

      <div className="z-10 text-center px-6">
        <h1 className="text-4xl font-bold text-slate-800 dark:text-white">
          🌤️ Mood Journal
        </h1>
        <p className="mt-4 text-lg text-slate-700 dark:text-gray-300">
          Hôm nay bạn cảm thấy thế nào? Ghi lại cảm xúc của mình nhé.
        </p>

        <button
          onClick={handleClick}
          className="mt-8 bg-white text-indigo-500 hover:bg-indigo-100 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600 transition duration-300 px-6 py-3 rounded-xl shadow-md"
        >
          Thêm nhật ký cảm xúc
        </button>
      </div>

      {/* Biểu đồ mood */}
      <div className="z-10 mt-12 w-full px-6">
        <MoodChart labels={chartData.labels} data={chartData.data} />
      </div>
    </div>
  );
}

export default Home;
