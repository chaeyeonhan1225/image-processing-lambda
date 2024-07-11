import { S3 } from '@aws-sdk/client-s3';
import sharp, { FormatEnum } from 'sharp';

function parseQueryStringValue(querystring: string, key: string): string {
  return new URLSearchParams('?' + querystring).get(key);
}

export async function imageProcessingHandler(event: any, _context: any, callback) {
  try {
    const { request, response } = event.Records[0].cf;

    const querystring = request.querystring;

    if (!querystring) {
      return callback(null, response);
    }

    const s3 = new S3();

    const uri = decodeURIComponent(request.uri);
    const bucket = request.origin.s3.domainName.replace('.s3.ap-northeast-2.amazonaws.com', '');

    const supportFormats: unknown[] = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'tiff'];

    const key = uri.substring(1);
    const image = await s3.getObject({ Bucket: bucket, Key: key });

    const originalFormat = key.match(/(.*)\.(.*)/)[2].toLowerCase();

    const width = Number(parseQueryStringValue(querystring, 'w')) || null;
    const height = Number(parseQueryStringValue(querystring, 'h')) || null;
    const quality = Number(parseQueryStringValue(querystring, 'q')) || 100;
    const format = supportFormats.find((f) => f === parseQueryStringValue(querystring, 'f')) || originalFormat;

    if (
      !image.Body ||
      !supportFormats.includes(originalFormat) ||
      !supportFormats.includes(format) ||
      originalFormat === 'gif' ||
      !width ||
      !height
    ) {
      console.log('존재하지 않는 이미지이거나 지원하지 않는 확장자 ', originalFormat, format);
      return callback(null, response);
    }
    const body = await image.Body.transformToByteArray();

    console.log({
      key,
      width,
      height,
      quality,
      format,
    });
    let thumbnailImage = sharp(body);

    const result = await thumbnailImage
      .resize({
        width: width > 600 ? 600 : width,
        height: height > 600 ? 600 : height,
        fit: 'cover',
      })
      .withMetadata()
      .toFormat(format as keyof FormatEnum, { quality: quality }) // 타입 체크
      .toBuffer();

    if (Buffer.byteLength(result, 'base64') > 1048576) {
      return callback(null, response);
    }

    response.status = 200;
    response.body = result.toString('base64');
    response.bodyEncoding = 'base64';
    if (format !== originalFormat) {
      response.headers['content-type'] = [{ key: 'Content-Type', value: 'image/' + format }];
    }

    return callback(null, response);
  } catch (err) {
    console.error(err);
    return callback(err);
  }
}
