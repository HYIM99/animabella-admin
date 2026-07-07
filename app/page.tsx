'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTrans } from '../contexts/LanguageContext';

export default function AdminDashboard() {
  const { t, locale, toggleLocale } = useTrans();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 临时模拟的数据统计，后续可从数据库按日期聚合并算出
  const stats = {
    turnover: 105.00,
    net: 73.50,
    commissions: 31.50
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      // 联表查询：获取预约记录的同时，带出客户姓名电话和项目详情
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          customers (name, phone),
          services (name_it, name_zh, price)
        `)
        .order('appointment_time', { ascending: true });

      if (error) throw error;
      if (data) setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'confirmed' })
      .eq('id', id);
    if (!error) fetchAppointments(); // 刷新列表
  };

  return (
    <div className="min-h-screen pb-12">
      {/* 顶部导航栏 */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-wide">{t.title}</h1>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleLocale}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium transition-colors"
            >
              {t.switchLang}
            </button>
            <button className="px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-md">
              {t.walkIn}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 mt-8">
        {/* 数据统计卡片区 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100">
            <p className="text-gray-500 text-sm font-medium mb-1">{t.todayTurnover}</p>
            <p className="text-3xl font-light">€ {stats.turnover.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100">
            <p className="text-gray-500 text-sm font-medium mb-1">{t.todayNet}</p>
            <p className="text-3xl font-light text-green-600">€ {stats.net.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100">
            <p className="text-gray-500 text-sm font-medium mb-1">{t.todayCommissions}</p>
            <p className="text-3xl font-light text-red-500">€ {stats.commissions.toFixed(2)}</p>
          </div>
        </div>

        {/* 预约列表区 */}
        <h2 className="text-lg font-semibold mb-4 pl-1 border-l-4 border-black">{t.appointments || '预约管理'}</h2>
        <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : appointments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">{t.noOrders}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
                    <th className="p-4 font-medium">{t.time}</th>
                    <th className="p-4 font-medium">{t.clientName}</th>
                    <th className="p-4 font-medium">{t.service}</th>
                    <th className="p-4 font-medium">{t.source}</th>
                    <th className="p-4 font-medium">状态 / 操作</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {appointments.map((appt) => {
                    const dateObj = new Date(appt.appointment_time);
                    const dateStr = dateObj.toLocaleDateString();
                    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    // 根据当前选择的语言，智能切换项目名称
                    const serviceName = locale === 'zh' ? appt.services?.name_zh : appt.services?.name_it;
                    
                    return (
                      <tr key={appt.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <div className="font-medium">{dateStr}</div>
                          <div className="text-gray-500">{timeStr}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{appt.customers?.name}</div>
                          <div className="text-gray-500">{appt.customers?.phone}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-medium">{serviceName}</div>
                          <div className="text-gray-500">€ {appt.services?.price}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-md text-xs font-medium ${appt.source === 'online' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                            {appt.source === 'online' ? t.online : t.walkInSource}
                          </span>
                        </td>
                        <td className="p-4">
                          {appt.status === 'pending' && (
                            <button 
                              onClick={() => handleConfirm(appt.id)}
                              className="px-3 py-1.5 bg-black text-white rounded-md text-xs font-medium hover:bg-gray-800"
                            >
                              {t.confirmOrder}
                            </button>
                          )}
                          {appt.status === 'confirmed' && (
                            <button className="px-3 py-1.5 bg-green-600 text-white rounded-md text-xs font-medium hover:bg-green-700">
                              {t.completeOrder}
                            </button>
                          )}
                          {appt.status === 'completed' && (
                            <span className="text-gray-400 font-medium text-xs">已完成</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

