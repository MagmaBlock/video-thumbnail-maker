import Ffmpeg from "fluent-ffmpeg";
import { convertAVIF } from "../convert";
import { getVideoInfomations, getVideoDuration } from "../infomation";
import path from "path";

/**
 * 渲染宫格图
 * 生成的图片将为 10x10, 共 100 小张 1 大张
 * @param filePath
 * @param videoDuration
 * @param outputFilePath 输出 PNG 文件的文件名，需加后缀名 ".png"
 * @returns
 */
export function renderGridPNG(
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
 * 为指定路径的视频文件生成缩略图，缩略图将保存在 outputPath，以视频文件名命名
 * @param filePath
 * @param outputPath
 */
export async function renderGridThumbnail(
  filePath: string,
  outputPath: string
) {
  console.log("正在获取视频信息...");
  const mediaData = await getVideoInfomations(filePath);
  const videoDuration = getVideoDuration(mediaData);
  const outputName = path.parse(filePath).name;

  console.log("正在渲染 10x10 宫格预览图...");
  const pngFileName = outputName + ".png";
  const avifFileName = outputName + ".avif";
  await renderGridPNG(
    filePath,
    videoDuration,
    path.join(outputPath, pngFileName)
  );

  console.log("正在转换格式为 AVIF...");
  await convertAVIF(
    path.join(outputPath, pngFileName),
    path.join(outputPath, avifFileName)
  );

  console.log("渲染完成, 生成文件位置: ", path.join(outputPath, avifFileName));
}
