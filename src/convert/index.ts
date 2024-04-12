import Ffmpeg from "fluent-ffmpeg";

/**
 * 转换图片到 AVIF
 * @param filePath 源文件路径
 * @param outputFilePath 输出 AVIF 文件的文件名，需加后缀名 ".png"
 * @returns
 */
export function convertAVIF(filePath: string, outputFilePath: string) {
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
