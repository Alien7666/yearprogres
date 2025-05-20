import mysql from 'mysql2/promise';

// 創建一個連接池
let poolConfig;

try {
  // 先嘗試使用環境變數
  poolConfig = {
    host: process.env.DB_HOST || 'mysql', // 預設使用正確的容器名稱
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'YearProgres',
    password: process.env.DB_PASSWORD || '5YSwPDW7wnBnbGai',
    database: process.env.DB_NAME || 'YearProgres',
    waitForConnections: true,
    connectionLimit: 3,
    queueLimit: 0,
    connectTimeout: 60000, // 連接超時時間延長到 60 秒
  };
  
  console.log('嘗試使用数据库配置:', JSON.stringify(poolConfig, null, 2));
  
} catch (error) {
  console.error('讀取環境變數失敗:', error);
  // 如果發生錯誤，使用預設配置
  poolConfig = {
    host: '192.168.0.10',
    port: 3306,
    user: 'YearProgres',
    password: '5YSwPDW7wnBnbGai',
    database: 'YearProgres',
    waitForConnections: true,
    connectionLimit: 3,
    queueLimit: 0,
    connectTimeout: 60000,
  };
}

const pool = mysql.createPool(poolConfig);

// 初始化資料庫，確保表格存在
export async function initDb() {
  try {
    const conn = await pool.getConnection();
    // 檢查自訂進度條表格是否存在，不存在則創建
    await conn.query(`
      CREATE TABLE IF NOT EXISTS custom_progress_bars (
        id VARCHAR(10) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        start_time DATETIME NOT NULL,
        end_time DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_by_ip VARCHAR(150)
      )
    `);
    conn.release();
    console.log('資料庫初始化成功');
    return true;
  } catch (error) {
    console.error('資料庫初始化失敗:', error);
    return false;
  }
}

// 創建自訂進度條
export async function createCustomProgressBar(name: string, startTime: Date, endTime: Date, ip?: string) {
  try {
    const id = generateId();
    const conn = await pool.getConnection();
    
    // 處理IP地址，如果太長則只保留前面一部分
    let processedIp = ip;
    if (ip && ip.length > 140) {
      // 取得第一個 IP 地址，通常是用戶端的真實IP
      processedIp = ip.split(',')[0].trim();
      // 再次確保長度符合要求
      if (processedIp.length > 140) {
        processedIp = processedIp.substring(0, 140);
      }
    }
    
    await conn.query(
      'INSERT INTO custom_progress_bars (id, name, start_time, end_time, created_by_ip) VALUES (?, ?, ?, ?, ?)',
      [id, name, startTime, endTime, processedIp || null]
    );
    
    conn.release();
    return { id, success: true };
  } catch (error) {
    console.error('創建自訂進度條失敗:', error);
    return { success: false, error: '創建進度條時發生錯誤' };
  }
}

// 獲取自訂進度條信息
export async function getCustomProgressBar(id: string) {
  try {
    const conn = await pool.getConnection();
    
    const [rows] = await conn.query(
      'SELECT id, name, start_time, end_time FROM custom_progress_bars WHERE id = ?',
      [id]
    );
    
    conn.release();
    
    if (Array.isArray(rows) && rows.length > 0) {
      return { 
        success: true, 
        data: rows[0] 
      };
    }
    
    return { success: false, error: '找不到進度條' };
  } catch (error) {
    console.error('獲取自訂進度條失敗:', error);
    return { success: false, error: '獲取進度條時發生錯誤' };
  }
}

// 生成短ID (6個字符)
function generateId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return id;
}
