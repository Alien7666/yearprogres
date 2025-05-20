import { NextApiRequest, NextApiResponse } from 'next';
import { getCustomProgressBar } from '../../../lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 只允許 GET 請求
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: '方法不允許' });
  }

  try {
    const { id } = req.query;

    if (!id || Array.isArray(id)) {
      return res.status(400).json({ success: false, error: '無效的進度條ID' });
    }

    const result = await getCustomProgressBar(id);

    if (result.success) {
      return res.status(200).json({ success: true, data: result.data });
    } else {
      return res.status(404).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('處理請求時發生錯誤:', error);
    return res.status(500).json({ success: false, error: '內部伺服器錯誤' });
  }
}
