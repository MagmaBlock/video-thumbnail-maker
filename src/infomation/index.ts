import type Ffmpeg from "fluent-ffmpeg";
import { ffprobe } from "fluent-ffmpeg";

/**
 * 获取视频文件的 FFprobe JSON 格式媒体信息
 * @param filePath
 * @returns
 */
export function getVideoInfomations(filePath: string) {
  return new Promise<Ffmpeg.FfprobeData>((resolve, reject) => {
    ffprobe(filePath, (err, mediaData) => {
      if (err) reject(err);
      resolve(mediaData);
    });
  });
}

/**
 * 从文件信息获取视频文件的时长
 * @param ffprobeResult ffprobe
 * @returns 秒数
 */
export function getVideoDuration(ffprobeResult: Ffmpeg.FfprobeData) {
  let longestDuration = 0;
  for (const iterator of ffprobeResult.streams) {
    if (iterator.codec_type == "video") {
      const thisDuration = Number(iterator.duration); // 以秒为单位的时长. 由于 ffprobe 提供的时长为字符串，因此需要转换.

      if (!Number.isNaN(thisDuration) && thisDuration > longestDuration) {
        longestDuration = thisDuration;
      }
    }
  }

  return longestDuration;
}
