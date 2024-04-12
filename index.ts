import Ffmpeg, { ffprobe } from "fluent-ffmpeg";
import { spawn } from "node:child_process";
import path from "path";

Ffmpeg.setFfprobePath("ffprobe");
Ffmpeg.setFfmpegPath("ffmpeg");

const outputPath = "C:\\Users\\magma\\Downloads\\test\\";

let urlList = [""];

for (const url of urlList) {
  await renderGridThumbnail(url, outputPath);
}

async function renderGridThumbnail(url: string, outputPath: string) {
  console.log("正在获取视频信息...");
  const mediaData = await getVideoInfomations(url);
  const videoDuration = getVideoDuration(mediaData);
  const outputName = path.parse(url).name;

  console.log("正在渲染 10x10 宫格预览图...");
  const pngFileName = outputName + ".png";
  const avifFileName = outputName + ".avif";
  await renderGridPNG(url, videoDuration, path.join(outputPath, pngFileName));

  console.log("正在转换格式为 AVIF...");
  await convertAVIF(pngFileName, path.join(outputPath, avifFileName));

  console.log("渲染完成, 生成文件位置: ", path.join(outputPath, avifFileName));
}

/**
 * 获取视频文件的 FFprobe JSON 格式媒体信息
 * @param filePath
 * @returns
 */
async function getVideoInfomations(filePath: string) {
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
function getVideoDuration(ffprobeResult: Ffmpeg.FfprobeData) {
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

/**
 * 渲染宫格图
 * 生成的图片将为 10x10, 共 100 小张 1 大张
 * @param filePath
 * @param videoDuration
 * @param outputFilePath 输出 PNG 文件的文件名，需加后缀名 ".png"
 * @returns
 */
function renderGridPNG(
  filePath: string,
  videoDuration: number,
  outputFilePath: string
) {
  return new Promise<void>((resolve, reject) => {
    const everyNSecAPic = (videoDuration / 100).toFixed(3);
    // const cmd = `-i "${url}" -vf "fps=1/${everyNSecAPic},scale=-1:180,tile=10x10" "${outputName}.png"`;

    Ffmpeg()
      .addInput(filePath)
      .videoFilter(`fps=1/${everyNSecAPic},scale=-1:180,tile=10x10`)
      .on("start", function (commandLine) {
        console.log("Spawned Ffmpeg with command: " + commandLine);
      })
      .on("error", (err, stdout, stderr) => {
        reject(err);
        console.error(err);
      })
      .on("end", () => {
        resolve();
        console.log("转换完成!");
      })
      .save(outputFilePath);
  });
}

/**
 * 转换图片到 AVIF
 * @param filePath 源文件路径
 * @param outputFilePath 输出 AVIF 文件的文件名，需加后缀名 ".png"
 * @returns
 */
function convertAVIF(filePath: string, outputFilePath: string) {
  // return `-i ${sourceFilePath} -crf 50 ${destFileName}.avif`;
  return new Promise<void>((resolve, reject) => {
    Ffmpeg()
      .addInput(filePath)
      .outputOption(["-crf", "50"])
      .on("start", function (commandLine) {
        console.log("Spawned Ffmpeg with command: " + commandLine);
      })
      .on("error", (err, stdout, stderr) => {
        reject(err);
        console.error(err);
      })
      .on("end", () => {
        resolve();
        console.log("转换完成!");
      })
      .save(outputFilePath);
  });
}

async function executeFFmpegCommand(command: string) {
  return new Promise((resolve, reject) => {
    const ffmpegProcess = spawn("ffmpeg", [command]);

    ffmpegProcess.stderr.on("data", (data: Buffer) => {
      console.error(data.toLocaleString());
    });

    ffmpegProcess.on("close", (code) => {
      if (code == 0) resolve(code);
      else reject(code);
    });
  });
}
