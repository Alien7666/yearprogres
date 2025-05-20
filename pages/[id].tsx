import { GetServerSideProps, NextPage } from "next";
import Link from "next/link";
import { DateTime, Duration } from "luxon";
import { useEffect, useState } from "react";
import { showFireworks } from "../lib/fireworks/showFireworks";
import { calculateYearProgress } from "../lib/utils";
import { NextSeo } from "next-seo";
import Icon from "@mdi/react";
import { mdiInstagram, mdiGithub } from "@mdi/js";
import { getCustomProgressBar } from "../lib/db";

const TIMER_INTERVAL_MS = 1000; // 1s
const IS_CLOSE_THRESHOLD = 10; // 調整為只在最後10秒顯示倒數

interface Props {
  timeLeftInSeconds: number;
  totalTimeInSeconds: number;
  progressName: string;
  id: string;
  error?: string;
}

const CustomProgress: NextPage<Props & { endTimeStr?: string }> = ({
  timeLeftInSeconds,
  totalTimeInSeconds,
  progressName,
  id,
  error,
  endTimeStr,
}) => {
  const [timeLeftDuration, setTimeLeftDuration] = useState<Duration>();
  const currentTimeLeftInSeconds = timeLeftDuration
    ? Math.floor(timeLeftDuration.as("seconds"))
    : timeLeftInSeconds;

  const progressPercent = calculateProgressPercent(currentTimeLeftInSeconds, totalTimeInSeconds);
  // 倒計時結束時顯示完成了！
  const messageToDisplay = currentTimeLeftInSeconds <= 0 ? "完成了！" : currentTimeLeftInSeconds;
  // 只在最後10秒內觸發特殊顯示
  const isCloseToEnd = currentTimeLeftInSeconds > 0 && currentTimeLeftInSeconds <= IS_CLOSE_THRESHOLD;

  useEffect(() => {
    // 使用傳入的endTimeStr參數確保精確到秒
    const endTime = endTimeStr ? new Date(endTimeStr) : new Date(Date.now() + timeLeftInSeconds * 1000);
    
    // 設定更新剩餘時間的函數
    const updateTimeLeft = () => {
      const now = DateTime.local();
      const end = DateTime.fromJSDate(endTime);
      
      // 計算精確的剩餘時間，包含毫秒
      const remainingDuration = end.diff(now, [
        "months",
        "days",
        "hours",
        "minutes",
        "seconds",
        "milliseconds"
      ]);
      
      // 確保剩餘時間沒有負值
      if (remainingDuration.as('milliseconds') <= 0) {
        // 如果時間已經結束，將所有值設為0
        setTimeLeftDuration(Duration.fromObject({
          months: 0,
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          milliseconds: 0
        }));
        
        // 從定時器中清除不必要的頻繁更新
        if (intervalIdRef) {
          clearInterval(intervalIdRef);
          intervalIdRef = null;
        }
      } else {
        // 確保時間精確到秒
        setTimeLeftDuration(remainingDuration);
      }
    };
    
    // 使用React的useRef管理定時器ID
    // 為了解決類型問題，我們使用簡單的變量
    let intervalIdRef: number | null = null;
    
    // 立即更新一次
    updateTimeLeft();
    
    // 設定定時器每秒更新
    intervalIdRef = window.setInterval(updateTimeLeft, TIMER_INTERVAL_MS) as unknown as number;

    return () => {
      if (intervalIdRef) {
        clearInterval(intervalIdRef);
      }
    };
  }, [timeLeftInSeconds, endTimeStr]);  // 當timeLeftInSeconds或endTimeStr變化時重新計算

  // 追蹤是否已顯示煙火
  const [fireworksShown, setFireworksShown] = useState(false);
  
  useEffect(() => {
    // 在倒數結束時顯示煙火，且只顯示一次
    if (currentTimeLeftInSeconds <= 0 && !fireworksShown) {
      showFireworks();
      setFireworksShown(true);
    }
  }, [currentTimeLeftInSeconds, fireworksShown]);

  // 如果有錯誤，顯示錯誤訊息
  if (error) {
    return (
      <div className="h-screen w-screen flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <h1 className="text-2xl font-bold mb-4">找不到進度條</h1>
          <p className="mb-6">{error}</p>
          <Link href="/" className="underline">返回年進度條</Link>
        </div>
      </div>
    );
  }

  // SEO 設定
  const url = `${process.env.NEXT_PUBLIC_URL || 'https://yearprogres.azndev.com'}/${id}`;
  const title = `${progressName} - 進度條`;
  const description = `${progressPercent}% 已完成`;

  return (
    <div>
      <NextSeo
        title={title}
        description={description}
        canonical={url}
        openGraph={{
          url,
          title,
          description,
          site_name: "年進度條",
        }}
        twitter={{
          handle: "@r6alien",
          cardType: "summary_large_image",
        }}
      />

      <main className="h-screen w-screen flex relative">
        {isCloseToEnd ? (
          <section className="m-auto flex items-center justify-center w-full p-4">
            <h1 className="font-black text-8xl text-center">
              {messageToDisplay}
            </h1>
          </section>
        ) : (
          <section className="m-auto flex flex-col items-center gap-8 w-full h-full max-w-2xl p-4 min-h-0">
            <h1 className="mt-auto font-black text-6xl break-words text-center">
              {progressName}
            </h1>
            <div className="h-8 w-full border flex-shrink-0">
              <div
                className="bg-gray-300 h-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <h2 className="font-extrabold text-4xl">{`${progressPercent}%`}</h2>
            <div className="mt-auto font-mono min-h-[32px] text-xs">
              {timeLeftDuration && (
                <span>
                  {currentTimeLeftInSeconds <= 0 ? (
                    <span className="text-green-600 font-bold">已完成</span>
                  ) : (
                    <>
                      剩下&nbsp;
                      {timeLeftDuration.months > 0 &&
                        `${timeLeftDuration.months} 個月, `}
                      {timeLeftDuration.days > 0 &&
                        `${timeLeftDuration.days} 天, `}
                      {timeLeftDuration.hours} 小時, {timeLeftDuration.minutes}{" "}
                      分鐘, {Math.floor(timeLeftDuration.seconds)} 秒鐘
                    </>
                  )}
                </span>
              )}
            </div>
            <div className="text-sm inline-flex gap-4 items-center justify-center p-4">
              <a href="https://www.instagram.com/r6alien">
                <Icon
                  path={mdiInstagram}
                  title="關注我的Instagram"
                  size={0.8}
                />
              </a>
              <a href="https://github.com/Alien7666">
                <Icon
                  path={mdiGithub}
                  title="關注我的GitHub"
                  size={0.8}
                />
              </a>
            </div>

            <div>
              <Link href="/" className="underline text-sm">返回年進度條</Link>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

// 計算進度條百分比
function calculateProgressPercent(currentTimeLeftInSeconds: number, totalTimeInSeconds: number) {
  // 總時間 = 結束時間 - 開始時間
  const totalTime = totalTimeInSeconds;
  // 已過時間 = 總時間 - 剩餘時間
  const elapsedTime = totalTime - currentTimeLeftInSeconds;

  // 百分比 = (已過時間 / 總時間) * 100
  return Math.floor((elapsedTime / totalTime) * 100);
}

// 計算剩餘時間
function calculateTimeLeft(totalSeconds: number) {
  const now = DateTime.local();
  const end = now.plus({ seconds: totalSeconds });

  return end.diff(now, [
    "months",
    "days",
    "hours",
    "minutes",
    "seconds",
  ]);
}

export const getServerSideProps: GetServerSideProps<Props & { endTimeStr?: string }> = async ({
  params,
}) => {
  try {
    const id = params?.id as string;

    // 從資料庫獲取自訂進度條資訊
    const result = await getCustomProgressBar(id);

    if (!result.success) {
      return {
        props: {
          timeLeftInSeconds: 0,
          totalTimeInSeconds: 100, // 預設值，不會實際使用
          progressName: "",
          id: id,
          error: "找不到指定的進度條",
        },
      };
    }

    const data = result.data as any;
    const startTime = new Date(data.start_time);
    const endTime = new Date(data.end_time);
    const now = new Date();
    
    // 計算剩餘時間（秒）
    const timeLeftInSeconds = Math.max(0, Math.floor((endTime.getTime() - now.getTime()) / 1000));
    
    // 計算總時間（秒） = 結束時間 - 開始時間
    const totalTimeInSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    return {
      props: {
        timeLeftInSeconds,
        totalTimeInSeconds,
        progressName: data.name,
        id: id,
        endTimeStr: endTime.toISOString(), // 將結束時間傳遞給前端
      },
    };
  } catch (error) {
    console.error("獲取自訂進度條時發生錯誤:", error);
    return {
      props: {
        timeLeftInSeconds: 0,
        totalTimeInSeconds: 100, // 預設值，不會實際使用
        progressName: "",
        id: params?.id as string || "",
        error: "獲取進度條資訊時發生錯誤",
      },
    };
  }
};

export default CustomProgress;
