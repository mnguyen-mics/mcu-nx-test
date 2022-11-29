/*
  - To use it color must be a HEX value and percent to be between -1.0 and 1.0
    - Negative value will darken the color
    - Positive value will lighten the color
*/

export function shadeColor(color: string, percent: number) {
  const f = parseInt(color.slice(1), 16),
    t = percent < 0 ? 0 : 255,
    p = percent < 0 ? percent * -1 : percent,
    // tslint:disable-next-line
    R = f >> 16,
    // tslint:disable-next-line
    G = (f >> 8) & 0x00ff,
    // tslint:disable-next-line
    B = f & 0x0000ff;
  return (
    '#' +
    (
      0x1000000 +
      (Math.round((t - R) * p) + R) * 0x10000 +
      (Math.round((t - G) * p) + G) * 0x100 +
      (Math.round((t - B) * p) + B)
    )
      .toString(16)
      .slice(1)
  );
}

export interface ColorPalletteOption {
  paletteCount: number;
  paletteType: 'average' | 'dominant';
}

// inspiration https://github.com/pradeep1991singh/react-native-image-color-picker/blob/master/src/canvas-html.js
// http://www.nbdtech.com/Blog/archive/2008/04/27/Calculating-the-Perceived-Brightness-of-a-Color.aspx

export function getColorPalettes(url: string, options: ColorPalletteOption) {
  const { paletteCount = 3, paletteType = 'average' } = options;

  const imageElement = new Image();
  imageElement.crossOrigin = 'Anonymous';
  imageElement.src = `${url}?${Date.now()}`;

  // const pluginElement = document.getElementsByClassName(plugin.id)
  // const imageElement = pluginElement![0].getElementsByTagName('img')[0];

  return new Promise((resolve, reject) => {
    try {
      imageElement.addEventListener('load', () => {
        const canvas = document.createElement('canvas');
        const canvasContext = canvas.getContext && canvas.getContext('2d');

        if (!canvasContext) return [0, 0, 0, 1];

        const imageWidth = (canvas.width =
          imageElement.naturalWidth || imageElement.offsetWidth || imageElement.width);

        const imageHeight = (canvas.height =
          imageElement.naturalHeight || imageElement.offsetHeight || imageElement.height);

        canvasContext.drawImage(imageElement, 0, 0);

        if (paletteType === 'average') {
          return resolve(getAveragePalette(imageWidth, imageHeight, canvasContext));
        } else {
          return resolve(
            getDominantPalettes(
              getAllPalettes(imageWidth, imageHeight, canvasContext),
              paletteCount,
            ),
          );
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

export function rgbToHex(rgba: number[]) {
  let hexColor = '#';
  rgba.slice(0, 3).forEach(c => {
    const hex = c.toString(16);
    hexColor += hex.length === 1 ? '0' + hex : hex;
  });
  return hexColor;
}

function getAveragePalette(
  imageWidth: number,
  imageHeight: number,
  canvasContext: CanvasRenderingContext2D,
) {
  const blockSize = 5;
  let i = -4;
  let count = 0;
  let red = 0;
  let green = 0;
  let blue = 0;
  const alpha = 1;

  let imageData: ImageData;
  try {
    imageData = canvasContext.getImageData(0, 0, imageWidth, imageHeight);
    // tslint:disable-next-line
    while ((i += blockSize * 4) < imageData.data.length) {
      ++count;
      red += imageData.data[i];
      green += imageData.data[i + 1];
      blue += imageData.data[i + 2];
    }

    // tslint:disable-next-line
    red = ~~(red / count);
    // tslint:disable-next-line
    green = ~~(green / count);
    // tslint:disable-next-line
    blue = ~~(blue / count);

    return [[red, green, blue, alpha]];
  } catch (e) {
    throw new Error(e);
  }
}

function getAllPalettes(width: number, height: number, context: CanvasRenderingContext2D) {
  const distinctPalettes = [];

  try {
    const imgData = context.getImageData(0, 0, height, width).data;

    for (let i = 0; i <= width * height; i += 4) {
      const pixelData = imgData.slice(i, i + 4);
      if (pixelData.toString().trim() !== '0,0,0,0') {
        distinctPalettes.push(pixelData);
      }
    }
  } catch (e) {
    return [];
  }

  return distinctPalettes;
}

function getDominantPalettes(allPalettes: Uint8ClampedArray[], distinctCount: number) {
  const combinations = getPaletteOccurrences(allPalettes);
  const palettes = combinations[0];
  const occurrences = combinations[1];
  const dominantPalettes = [];

  // Handle the case were the palette detection don't return anything
  if (allPalettes.length === 0) {
    for (let i = 0; i < distinctCount; i++) {
      dominantPalettes.push([10, 50, 84, 255]);
    }
    return dominantPalettes;
  }

  while (distinctCount) {
    let dominant = 0,
      dominantKey = 0;
    (occurrences as number[]).forEach((v, k) => {
      if (v > dominant) {
        dominant = v;
        dominantKey = k;
      }
    });

    dominantPalettes.push(palettes[dominantKey]);

    palettes.splice(dominantKey, 1);
    occurrences.splice(dominantKey, 1);
    distinctCount--;
  }
  return dominantPalettes;
}

function getPaletteOccurrences(palettes: Uint8ClampedArray[]) {
  const paletteList: Uint8ClampedArray[] = [];
  const occurrenceList: number[] = [];
  let previousPalette: string;

  palettes.sort();
  palettes.forEach((palette, key) => {
    if (palette.toString() !== previousPalette) {
      paletteList.push(palette);
      occurrenceList.push(1);
    } else {
      occurrenceList[occurrenceList.length - 1]++;
    }
    previousPalette = palettes[key].toString();
  });
  return [paletteList, occurrenceList];
}

/*
  Usage: pass value for red green and blue between 0 and 255 and the function will return a value between 0 and 260.
  if the value is between 0 and 130 the color is dark else it is light
*/

export function getPerceivedBrightness(red: number, green: number, blue: number) {
  return Math.sqrt(red * red * 0.241 + green * green * 0.691 + blue * blue * 0.068);
}
