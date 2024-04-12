import Ffmpeg from "fluent-ffmpeg";
import { renderGridThumbnail } from "./src/thumbnail";

Ffmpeg.setFfprobePath("ffprobe");
Ffmpeg.setFfmpegPath("ffmpeg");

const outputPath = "C:\\Users\\Administrator\\Downloads\\test";

let urlList = [
  "E:\\LavaAnimeLib\\1987年\\其他地区\\Never Gonna Give You Up 000000\\[LavaAnime] Never Gonna Give You Up - Rick Astley [Music_MV][CHS][1080P][AVC AAC].mp4",
];

for (const url of urlList) {
  await renderGridThumbnail(url, outputPath);
}
