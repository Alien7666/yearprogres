import { NextApiRequest, NextApiResponse } from 'next';
import { createCustomProgressBar } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 只允許 POST 請求
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: '方法不允許' });
  }

  try {
    const { name, startTime, endTime } = req.body;

    // 驗證必要參數
    if (!name || !endTime) {
      return res.status(400).json({ success: false, error: '名稱和結束時間為必填項' });
    }

    // 驗證時間格式
    const endTimeDate = new Date(endTime);
    if (isNaN(endTimeDate.getTime())) {
      return res.status(400).json({ success: false, error: '無效的結束時間格式' });
    }
    
    // 設置開始時間，如果沒有提供則使用當前時間
    let startTimeDate: Date;
    if (startTime) {
      startTimeDate = new Date(startTime);
      if (isNaN(startTimeDate.getTime())) {
        return res.status(400).json({ success: false, error: '無效的開始時間格式' });
      }
    } else {
      startTimeDate = new Date();
    }

    // 獲取客戶端 IP
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;

    // 驗證開始時間早於結束時間
    if (startTimeDate >= endTimeDate) {
      return res.status(400).json({ success: false, error: '開始時間必須早於結束時間' });
    }

    // 創建自訂進度條
    const result = await createCustomProgressBar(
      name,
      startTimeDate,
      endTimeDate,
      typeof ip === 'string' ? ip : Array.isArray(ip) ? ip[0] : undefined
    );

    if (result.success) {
      return res.status(201).json({
        success: true,
        id: result.id,
        url: `${process.env.NEXT_PUBLIC_URL || 'https://yearprogres.azndev.com'}/${result.id}`
      });
    } else {
      return res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('處理請求時發生錯誤:', error);
    return res.status(500).json({ success: false, error: '內部伺服器錯誤' });
  }
}
